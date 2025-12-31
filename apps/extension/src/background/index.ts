import 'webextension-polyfill';
import {
  agentModelStore,
  AgentNameEnum,
  firewallStore,
  generalSettingsStore,
  llmProviderStore,
  authStore,
  ProviderTypeEnum,
  type UserProfile,
  MANAGED_MODEL_IDS,
} from '@extension/storage';
import { t } from '@extension/i18n';
import BrowserContext from './browser/context';
import { Executor } from './agent/executor';
import { createLogger } from './log';
import '../../utils/node-shims';
import { ExecutionState, EventType } from './agent/event/types';
import { createChatModel } from './agent/helper';
import { DEFAULT_AGENT_OPTIONS } from './agent/types';
import { SpeechToTextService } from './services/speechToText';
import { TextCorrectionService } from './services/text-correction';
import { CaptchaService } from './services/captcha-service';
import { injectBuildDomTreeScripts } from './browser/dom/service';
import { analytics } from './services/analytics';
import { fetchImageAsBase64 } from './services/fetch-proxy';

const logger = createLogger('background');

// --- Singleton Initialization ---
const browserContext = new BrowserContext({});
let currentExecutor: Executor | null = null;
let currentPort: chrome.runtime.Port | null = null;

const SIDE_PANEL_URL = chrome.runtime.getURL('side-panel/index.html');
const DASHBOARD_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

async function initialize() {
  await analytics.init();

  try {
    if (chrome.sidePanel && typeof chrome.sidePanel.setPanelBehavior === 'function') {
      await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
    }
  } catch (error) {
    console.error('Failed to set side panel behavior:', error);
  }

  // Initialize Default Agent Model if missing
  const allModels = await agentModelStore.getAllAgentModels();

  if (!allModels[AgentNameEnum.Agent]) {
    logger.info('Setting up default monolithic agent model to Scrapter Auto');
    await agentModelStore.setAgentModel(AgentNameEnum.Agent, {
      provider: 'scrapter' as any,
      modelName: MANAGED_MODEL_IDS.AUTO,
    });
  }

  logger.info('Background initialization complete');
}

initialize();

// --- Browser Event Listeners ---
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (tabId && changeInfo.status === 'complete' && tab.url?.startsWith('http')) {
    await injectBuildDomTreeScripts(tabId);
  }
});

chrome.debugger.onDetach.addListener(async (source, reason) => {
  if (reason === 'canceled_by_user') {
    if (source.tabId) {
      if (currentExecutor) {
        await currentExecutor.cancel();
      }
      await browserContext.cleanup();
    }
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  browserContext.removeAttachedPage(tabId);
});

// --- Executor Factory ---

async function setupExecutor(taskId: string, task: string, browserContext: BrowserContext) {
  const providers = await llmProviderStore.getAllProviders();
  const agentModel = await agentModelStore.getAgentModel(AgentNameEnum.Agent);

  if (!agentModel) {
    throw new Error(t('bg_setup_noAgentModel'));
  }

  let providerConfig = providers[agentModel.provider];

  // --- Fallback logic for managed providers or missing keys ---
  if (!providerConfig) {
    if (agentModel.provider === 'scrapter') {
      // Managed Scrapter Provider - Generate ephemeral config
      providerConfig = {
        type: 'custom' as any,
        apiKey: 'managed-session',
        enabled: true,
        models: [MANAGED_MODEL_IDS.AUTO, MANAGED_MODEL_IDS.BEST]
      } as any;
    } else if (agentModel.provider === 'gemini') {
      // Fallback to Env Key if local storage is empty
      const envKey = process.env.GEMINI_API_KEY;
      if (envKey) {
        logger.info("Using embedded GEMINI_API_KEY for fallback");
        providerConfig = {
          type: ProviderTypeEnum.Gemini,
          apiKey: envKey,
          enabled: true,
          models: ['gemini-2.0-flash']
        } as any;
      }
    }
  }

  if (!providerConfig) {
    throw new Error(t('bg_setup_noProvider', [agentModel.provider]));
  }

  const chatLLM = createChatModel(providerConfig as any, agentModel);

  const firewall = await firewallStore.getFirewall();
  browserContext.updateConfig({
    allowedUrls: firewall.enabled ? firewall.allowList : [],
    deniedUrls: firewall.enabled ? firewall.denyList : [],
  });

  // Proactively pull latest settings from cloud (if user is logged in)
  try {
    await (generalSettingsStore as any).pullFromCloud?.();
  } catch (e) {
    // Silent - this is a best-effort sync
  }
  const generalSettings = await generalSettingsStore.getSettings();
  browserContext.updateConfig({
    minimumWaitPageLoadTime: generalSettings.minWaitPageLoad / 1000.0,
    displayHighlights: generalSettings.displayHighlights,
  });

  return new Executor(task, taskId, browserContext, chatLLM, {
    agentOptions: {
      maxSteps: generalSettings.maxSteps,
      maxFailures: generalSettings.maxFailures,
      maxActionsPerStep: generalSettings.maxActionsPerStep,
      useVision: generalSettings.useVision,
      includeAttributes: DEFAULT_AGENT_OPTIONS.includeAttributes,
    },
    generalSettings,
  });
}

// --- Auth Sync ---
async function syncAuthWithCookies() {
  try {
    const sessionCookie = await chrome.cookies.get({ url: DASHBOARD_URL, name: 'session_token' });
    const userCookie = await chrome.cookies.get({ url: DASHBOARD_URL, name: 'user_profile' });

    if (sessionCookie?.value) {
      const currentAuth = await authStore.get();
      if (currentAuth.sessionToken !== sessionCookie.value) {
        let profile: UserProfile = { id: 'user', email: 'sync@user', plan: 'FREE' };
        if (userCookie?.value) {
          try {
            const decoded = JSON.parse(decodeURIComponent(userCookie.value));
            profile = { ...profile, ...decoded, plan: decoded.plan || 'FREE' };
          } catch (e) { /* ignore */ }
        }
        await authStore.setSession(sessionCookie.value, profile);
      }
    } else {
      const currentAuth = await authStore.get();
      if (currentAuth.sessionToken) await authStore.clearSession();
    }
  } catch (e) { /* ignore */ }
}

syncAuthWithCookies();
chrome.cookies.onChanged.addListener((changeInfo) => {
  if (changeInfo.cookie.domain.includes('localhost') &&
    (changeInfo.cookie.name === 'session_token' || changeInfo.cookie.name === 'user_profile')) {
    syncAuthWithCookies();
  }
});

// --- Side Panel Communication ---

chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== 'side-panel-connection') return;
  // Security check: ensure connection comes from our sidepanel
  if (port.sender?.url !== SIDE_PANEL_URL) {
    // Ideally log warning, but for dev we allow loose connection sometimes
    // port.disconnect(); 
    // return; 
  }
  currentPort = port;

  const sendMessage = (msg: any) => {
    try { port.postMessage(msg); } catch (e) { /* ignore */ }
  };

  port.onMessage.addListener(async (message) => {
    try {
      switch (message.type) {
        case 'heartbeat': sendMessage({ type: 'heartbeat_ack' }); break;

        case 'new_task': {
          if (!message.task) return sendMessage({ type: 'error', error: t('bg_cmd_newTask_noTask') });

          // If we have a current executor and it's waiting for input, this is a follow-up
          if (currentExecutor && message.isFollowUp) {
            logger.info("Adding follow-up to existing executor");
            currentExecutor.addFollowUpTask(message.task);
            return;
          }

          if (currentExecutor) {
            await currentExecutor.cancel();
            await browserContext.cleanup();
          }
          try {
            const taskId = message.taskId || Math.random().toString(36).substring(7);
            currentExecutor = await setupExecutor(taskId, message.task, browserContext);
            currentExecutor.subscribeExecutionEvents(async (event) => {
              if (event.type === EventType.EXECUTION) sendMessage(event);
              else if (event.type === EventType.STREAM && event.data.payload) sendMessage(event.data.payload);
            });
            currentExecutor.execute();
          } catch (e: any) {
            logger.error('Failed to start executor:', e);
            sendMessage({ type: 'error', error: e.message });
          }
          break;
        }

        case 'cancel_task':
          if (currentExecutor) await currentExecutor.cancel();
          break;

        case 'screenshot': {
          if (!message.tabId) return sendMessage({ type: 'error', error: t('bg_errors_noTabId') });
          const page = await browserContext.switchTab(message.tabId);
          const screenshot = await page.takeScreenshot();
          sendMessage({ type: 'success', screenshot });
          break;
        }

        case 'state': {
          try {
            const browserState = await browserContext.getState(true);
            sendMessage({ type: 'success', msg: t('bg_cmd_state_printed') });
          } catch (e) {
            sendMessage({ type: 'error', error: 'Failed to get state' });
          }
          break;
        }

        case 'speech_to_text': {
          if (!message.audio) return;
          try {
            const providers = await llmProviderStore.getAllProviders();
            const sttService = await SpeechToTextService.create(providers);
            let audioData = message.audio;
            if (audioData.startsWith('data:')) audioData = audioData.split(',')[1];
            const text = await sttService.transcribeAudio(audioData);
            sendMessage({ type: 'speech_to_text_result', text });
          } catch (e: any) {
            sendMessage({ type: 'speech_to_text_error', error: e.message });
          }
          break;
        }

        case 'FETCH_IMAGE_BLOB': {
          fetchImageAsBase64(message.url).then((result) => {
            sendMessage({
              type: 'IMAGE_BLOB_READY',
              url: message.url,
              data: result.data,
              success: result.success
            });
          });
          break;
        }

        case 'SOLVE_CAPTCHA': {
          (async () => {
            try {
              const agentModel = await agentModelStore.getAgentModel(AgentNameEnum.Agent);
              const providers = await llmProviderStore.getAllProviders();
              const providerConfig = providers[agentModel?.provider || ''] as any;

              // If managed 'scrapter' model, fallback to ENV key (assuming dev) or error
              // Real prod would proxy this to API
              let apiKey = providerConfig?.apiKey;

              if ((!apiKey || agentModel?.provider === 'scrapter') && process.env.GEMINI_API_KEY) {
                apiKey = process.env.GEMINI_API_KEY;
              }

              if (!apiKey) {
                sendMessage({ success: false, error: 'No API Key available for Captcha' });
                return;
              }

              const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
              const activeTab = tabs[0];
              if (!activeTab || !activeTab.id) throw new Error("No active tab found");

              const dataUrl = await chrome.tabs.captureVisibleTab(activeTab.windowId, { format: 'png' });
              const service = new CaptchaService(apiKey);
              const text = await service.solve(dataUrl, message.coordinates);

              sendMessage({ success: true, text });
            } catch (e: any) {
              console.error('Solve Captcha Error', e);
              sendMessage({ success: false, error: e.message });
            }
          })();
          break;
        }

        case 'CORRECT_OCR_TEXT':
        case 'TRANSLATE_OCR_TEXT': {
          const agentModel = await agentModelStore.getAgentModel(AgentNameEnum.Agent);
          const providers = await llmProviderStore.getAllProviders();
          const providerConfig = providers[agentModel?.provider || ''] as any;

          let apiKey = providerConfig?.apiKey;
          if ((!apiKey || agentModel?.provider === 'scrapter') && process.env.GEMINI_API_KEY) {
            apiKey = process.env.GEMINI_API_KEY;
          }

          if (apiKey) {
            const service = new TextCorrectionService(apiKey);
            const targetLang = message.type === 'TRANSLATE_OCR_TEXT' ? "English" : undefined;
            service.processText(message.texts, targetLang).then(result => {
              sendMessage({
                success: true,
                data: result,
                type: message.type === 'TRANSLATE_OCR_TEXT' ? 'TRANSLATION_COMPLETE' : 'CORRECTION_COMPLETE'
              });
            }).catch(err => {
              sendMessage({ success: false, error: String(err) });
            });
          }
          break;
        }

        default:
          logger.warning('Unknown message type:', message.type);
      }
    } catch (error: any) {
      logger.error('Error handling message:', error);
      sendMessage({ type: 'error', error: error.message || 'Unknown error' });
    }
  });

  port.onDisconnect.addListener(() => {
    logger.info('Side panel disconnected');
    currentPort = null;
  });
});