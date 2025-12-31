import { z } from 'zod';
import { ActionResult, type AgentContext } from '@src/background/agent/types';
import { createLogger } from '@src/background/log';
import { ExecutionState, Actors } from '../event/types';
import { wrapUntrustedContent } from '../messages/utils';
import { ActionRegistry } from '../core/agent';
import { ScrapterElementNode } from '../../browser/dom/views';

// Import all specific schemas
import {
  clickElementActionSchema,
  doneActionSchema,
  goBackActionSchema,
  goToUrlActionSchema,
  inputTextActionSchema,
  openTabActionSchema,
  searchGoogleActionSchema,
  switchTabActionSchema,
  sendKeysActionSchema,
  scrollToTextActionSchema,
  cacheContentActionSchema,
  waitActionSchema,
  scrollToPercentActionSchema,
  scrollToTopActionSchema,
  scrollToBottomActionSchema,
  type ActionSchema,
  closeTabActionSchema,
} from './schemas';

const logger = createLogger('ActionRegistry');

export class InvalidInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidInputError';
  }
}

/**
 * Represents a single executable tool available to the agent
 */
export class Action {
  constructor(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly handler: (input: any) => Promise<ActionResult>,
    public readonly schema: ActionSchema,
    public readonly requiresBrowserState: boolean = false,
  ) { }

  async call(input: unknown): Promise<ActionResult> {
    // 1. Handle empty inputs for optional schemas
    const schema = this.schema.schema;
    const isEmptySchema =
      schema instanceof z.ZodObject &&
      Object.keys((schema as z.ZodObject<Record<string, z.ZodTypeAny>>).shape || {}).length === 0;

    if (isEmptySchema) {
      return await this.handler({});
    }

    // 2. Validate Input via Zod
    const parsedArgs = this.schema.schema.safeParse(input);
    if (!parsedArgs.success) {
      const errorMessage = `Invalid arguments for ${this.schema.name}: ${parsedArgs.error.message}`;
      logger.error(errorMessage);
      throw new InvalidInputError(errorMessage);
    }

    // 3. Execute
    return await this.handler(parsedArgs.data);
  }

  name() {
    return this.schema.name;
  }

  getDefinition(): string {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const shape = (this.schema.schema as z.ZodObject<any>).shape || {};

    const args = Object.entries(shape)
      .map(([key, value]) => {
        const zodValue = value as z.ZodTypeAny;
        const description = zodValue.description || 'value';
        const isOptional = zodValue.isOptional();
        return `${key}: "${description}"${isOptional ? ' (optional)' : ''}`;
      })
      .join(', ');

    const argsStr = args.length > 0 ? `Args: { ${args} }` : 'Args: {}';
    return `- **${this.name()}**: ${this.schema.description}. ${argsStr}`;
  }
}

export class ActionRegistryImpl implements ActionRegistry {
  private actions: Map<string, Action> = new Map();
  private context: AgentContext;

  constructor(context: AgentContext) {
    this.context = context;
    this.registerDefaultActions();
  }

  getAction(name: string): Action | undefined {
    return this.actions.get(name);
  }

  getDefinitions(): string[] {
    return Array.from(this.actions.values()).map(a => a.getDefinition());
  }

  private register(action: Action) {
    this.actions.set(action.name(), action);
  }

  /**
   * Helper to retrieve an element from the current browser state map
   */
  private async getElement(index: number): Promise<ScrapterElementNode> {
    const page = await this.context.browserContext.getCurrentPage();
    // We assume state was refreshed by the Agent before calling this action
    const state = await page.getCachedState();
    const element = state.map.get(index);

    if (!element) {
      throw new Error(`Element with Index [${index}] does not exist in the current view. It may have moved or is hidden.`);
    }
    return element;
  }

  private registerDefaultActions() {
    // --- 1. Basic Navigation ---

    this.register(new Action(async (input: z.infer<typeof doneActionSchema.schema>) => {
      this.context.emitEvent(Actors.AGENT, ExecutionState.ACT_OK, 'Task marked as done');
      return new ActionResult({ isDone: true, extractedContent: input.text });
    }, doneActionSchema));

    this.register(new Action(async (input: z.infer<typeof searchGoogleActionSchema.schema>) => {
      await this.context.browserContext.navigateTo(`https://www.google.com/search?q=${encodeURIComponent(input.query)}`);
      return new ActionResult({ extractedContent: `Searched for ${input.query}` });
    }, searchGoogleActionSchema));

    this.register(new Action(async (input: z.infer<typeof goToUrlActionSchema.schema>) => {
      await this.context.browserContext.navigateTo(input.url);
      return new ActionResult({ extractedContent: `Navigated to ${input.url}` });
    }, goToUrlActionSchema));

    this.register(new Action(async () => {
      const page = await this.context.browserContext.getCurrentPage();
      await page.goBack();
      return new ActionResult({ extractedContent: "Navigated back" });
    }, goBackActionSchema));

    // --- 2. Element Interaction (Using Map Lookup) ---

    this.register(new Action(async (input: z.infer<typeof clickElementActionSchema.schema>) => {
      const elementNode = await this.getElement(input.index);
      const page = await this.context.browserContext.getCurrentPage();

      if (elementNode.tagName === 'input' && elementNode.attributes.type === 'file') {
        return new ActionResult({ extractedContent: "Clicked file uploader (automated upload not supported yet)", includeInMemory: true });
      }

      await page.clickElementNode(this.context.options.useVision, elementNode);
      return new ActionResult({ extractedContent: `Clicked element [${input.index}]` });
    }, clickElementActionSchema, true));

    this.register(new Action(async (input: z.infer<typeof inputTextActionSchema.schema>) => {
      const elementNode = await this.getElement(input.index);
      const page = await this.context.browserContext.getCurrentPage();

      await page.inputTextElementNode(this.context.options.useVision, elementNode, input.text);
      return new ActionResult({ extractedContent: `Typed "${input.text}" into element [${input.index}]` });
    }, inputTextActionSchema, true));

    // --- 3. Keyboard & Scroll ---

    this.register(new Action(async (input: z.infer<typeof sendKeysActionSchema.schema>) => {
      const page = await this.context.browserContext.getCurrentPage();
      await page.sendKeys(input.keys);
      return new ActionResult({ extractedContent: `Sent keys: ${input.keys}` });
    }, sendKeysActionSchema));

    this.register(new Action(async (input: z.infer<typeof scrollToTextActionSchema.schema>) => {
      const page = await this.context.browserContext.getCurrentPage();
      const found = await page.scrollToText(input.text, input.nth);
      if (!found) return new ActionResult({ error: `Text "${input.text}" not found`, includeInMemory: true });
      return new ActionResult({ extractedContent: `Scrolled to "${input.text}"` });
    }, scrollToTextActionSchema));

    this.register(new Action(async (input: z.infer<typeof scrollToPercentActionSchema.schema>) => {
      const page = await this.context.browserContext.getCurrentPage();
      await page.scrollToPercent(input.yPercent);
      return new ActionResult({ extractedContent: `Scrolled to ${input.yPercent}%` });
    }, scrollToPercentActionSchema));

    this.register(new Action(async () => {
      const page = await this.context.browserContext.getCurrentPage();
      await page.scrollToPercent(0);
      return new ActionResult({ extractedContent: "Scrolled to top" });
    }, scrollToTopActionSchema));

    this.register(new Action(async () => {
      const page = await this.context.browserContext.getCurrentPage();
      await page.scrollToPercent(100);
      return new ActionResult({ extractedContent: "Scrolled to bottom" });
    }, scrollToBottomActionSchema));

    // --- 4. Tabs ---

    this.register(new Action(async (input: z.infer<typeof switchTabActionSchema.schema>) => {
      await this.context.browserContext.switchTab(input.tab_id);
      return new ActionResult({ extractedContent: `Switched to tab ${input.tab_id}` });
    }, switchTabActionSchema));

    this.register(new Action(async (input: z.infer<typeof openTabActionSchema.schema>) => {
      await this.context.browserContext.openTab(input.url);
      return new ActionResult({ extractedContent: `Opened ${input.url} in new tab` });
    }, openTabActionSchema));

    this.register(new Action(async (input: z.infer<typeof closeTabActionSchema.schema>) => {
      await this.context.browserContext.closeTab(input.tab_id);
      return new ActionResult({ extractedContent: `Closed tab ${input.tab_id}` });
    }, closeTabActionSchema));

    // --- 5. Utilities ---

    this.register(new Action(async (input: z.infer<typeof waitActionSchema.schema>) => {
      await new Promise(resolve => setTimeout(resolve, input.seconds * 1000));
      return new ActionResult({ extractedContent: `Waited ${input.seconds}s` });
    }, waitActionSchema));

    this.register(new Action(async (input: z.infer<typeof cacheContentActionSchema.schema>) => {
      const msg = wrapUntrustedContent(input.content);
      return new ActionResult({ extractedContent: "Content cached in memory", includeInMemory: true });
    }, cacheContentActionSchema));
  }
}