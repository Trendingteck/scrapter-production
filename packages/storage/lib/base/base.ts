import { Storage } from "@plasmohq/storage";

// Better environment detection
const isBrowser = typeof window !== "undefined";
const isServiceWorker = typeof self !== "undefined" && "registration" in self;
const isExtension = (typeof chrome !== "undefined" && !!chrome.storage);

/**
 * Interface for the raw data stored in settings
 */
export interface StorageConfig {
  area?: "local" | "sync" | "session";
  allSecret?: boolean;
  storageEnum?: any; // Compatibility with legacy calls
}

/**
 * Base class for all storage operations.
 * Handles isomorphism between Chrome Extension storage and Web LocalStorage/API.
 */
export class BaseStorage<T> {
  private storage: Storage;
  private key: string;
  public readonly apiEndpoint: string | null;
  private defaultValue: T;
  private snapshot: T;
  private subscribers: Set<(newValue: T) => void> = new Set();

  constructor(key: string, defaultValue: T, config: StorageConfig = {}) {
    this.key = key;
    this.defaultValue = defaultValue;
    this.snapshot = defaultValue;
    // Map area: 'sync' to cloud API sync. We use the root settings endpoint.
    this.apiEndpoint = (config.area === 'sync' || config.storageEnum === 'sync') ? `/v1/me/settings` : null;

    // Use local area if sync is requested but not available
    const useArea = (config.area === 'sync' && !isExtension) ? 'local' : (config.area || 'local');

    this.storage = new Storage({
      area: useArea as any,
    } as any);

    // In monolithic extension, we want direct access from sidepanel/background
    // Plasmo's relay: true is mostly for content script communication.

    // Setup global change listener
    if (isExtension) {
      this.storage.watch({
        [this.key]: (c: any) => {
          const val = c.newValue as T;
          this.snapshot = val;
          this.notifySubscribers(val);
        }
      });
    } else if (isBrowser) {
      window.addEventListener('storage', (event: StorageEvent) => {
        if (event.key === this.key && event.newValue && event.newValue !== "[object Object]") {
          try {
            const val = JSON.parse(event.newValue);
            this.snapshot = val;
            this.notifySubscribers(val);
          } catch (e) { }
        }
      });
    }
  }

  private notifySubscribers(newValue: T) {
    this.subscribers.forEach(cb => {
      try { cb(newValue); } catch (e) { }
    });
  }

  /**
   * Get the last known value synchronously
   */
  getSnapshot(): T {
    return this.snapshot;
  }

  /**
   * Get the value from storage.
   * In Web: Uses native localStorage.
   * In Extension: Uses Chrome Storage via Plasmo.
   */
  async get(): Promise<T> {
    try {
      let data: T | null | undefined;

      if (isExtension) {
        // Extension context: use Plasmo storage
        data = await this.storage.get<T>(this.key);
      } else if (isBrowser) {
        // Web context: use native localStorage
        const stored = window.localStorage.getItem(this.key);
        if (stored) {
          try {
            data = JSON.parse(stored);
          } catch {
            data = null;
          }
        }
      }

      let value = (data !== null && data !== undefined) ? data : this.defaultValue;

      // 2. Proactive Pull: If it's the first time and we have API, pull from cloud
      const shouldPull = this.apiEndpoint && !this.hasPulledOnce;

      if (shouldPull) {
        this.hasPulledOnce = true;
        this.pullFromCloud().then(cloudValue => {
          if (cloudValue) {
            this.notifySubscribers(cloudValue);
          }
        }).catch(() => { });
      }

      this.snapshot = value;
      return value;
    } catch (error) {
      console.error(`[Storage] Failed to get ${this.key}:`, error);
      return this.defaultValue;
    }
  }

  private hasPulledOnce: boolean = false;

  /**
   * Explicitly pull from cloud and update local storage
   */
  async pullFromCloud(): Promise<T | null> {
    if (!this.apiEndpoint) return null;
    try {
      const token = await this.resolveToken();
      if (!token) return null;

      const API_URL = this.resolveApiUrl();
      const response = await fetch(`${API_URL}${this.apiEndpoint}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const body = await response.json();
        // The API returns the whole Settings object. We pick the key.
        const value = body[this.key];
        if (value !== undefined) {
          // Save to appropriate storage
          if (isExtension) {
            await this.storage.set(this.key, value);
          } else if (isBrowser) {
            window.localStorage.setItem(this.key, JSON.stringify(value));
          }
          this.snapshot = value;
          return value;
        }
      }
    } catch (e) {
      console.warn(`[Storage] Pull failed for ${this.key}`, e);
    }
    return null;
  }

  /**
   * Set the value in storage.
   * In Web: Saves to native localStorage, then attempts to sync to API.
   * In Extension: Saves to Chrome Storage via Plasmo.
   */
  async set(valueOrUpdater: T | ((prev: T) => T | Promise<T>)): Promise<void> {
    try {
      let newValue: T;
      if (typeof valueOrUpdater === 'function') {
        const current = await this.get();
        newValue = await (valueOrUpdater as any)(current);
      } else {
        newValue = valueOrUpdater;
      }

      this.snapshot = newValue;

      if (isExtension) {
        // Extension context: use Plasmo storage
        await this.storage.set(this.key, newValue);
      } else if (isBrowser) {
        // Web context: use native localStorage
        window.localStorage.setItem(this.key, JSON.stringify(newValue));
      }

      // Notify same-tab subscribers
      this.notifySubscribers(newValue);

      // If in Web Dashboard context, try to persist to Cloud Database via API
      if (!isExtension && isBrowser && this.apiEndpoint && newValue !== null && newValue !== undefined) {
        this.syncToCloud(newValue).catch(err =>
          console.warn(`[Storage] Background sync failed for ${this.key}`, err)
        );
      }
    } catch (error) {
      console.error(`[Storage] Failed to set ${this.key}:`, error);
    }
  }

  /**
   * Remove the key from storage
   */
  async remove(): Promise<void> {
    if (isExtension) {
      await this.storage.remove(this.key);
    } else if (isBrowser) {
      window.localStorage.removeItem(this.key);
    }
    this.snapshot = this.defaultValue;
    this.notifySubscribers(this.defaultValue);
  }

  /**
   * Internal method to sync settings to the backend API.
   */
  private async syncToCloud(value: T): Promise<void> {
    if (!this.apiEndpoint) return;

    try {
      const token = await this.resolveToken();
      if (!token) return;

      const API_URL = this.resolveApiUrl();

      await fetch(`${API_URL}${this.apiEndpoint}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ [this.key]: value })
      });
    } catch (error) {
      console.error(`[Storage] Failed to sync ${this.key} to cloud:`, error);
    }
  }

  private resolveApiUrl(): string {
    const globalObj = globalThis as any;
    return globalObj.process?.env?.NEXT_PUBLIC_API_URL
      || globalObj.NEXT_PUBLIC_API_URL
      || (isExtension ? 'http://localhost:3001' : 'http://localhost:3001'); // Fallback
  }

  private async resolveToken(): Promise<string | null> {
    if (isExtension) {
      // Try to get from Plasmo storage
      const authStorage = new Storage({ area: 'local' });
      const authData = await authStorage.get<any>('auth-state');
      return authData?.sessionToken || null;
    }

    if (isBrowser && typeof document !== 'undefined') {
      return document.cookie
        .split('; ')
        .find(row => row.startsWith('session_token='))
        ?.split('=')[1] || null;
    }
    return null;
  }

  /**
   * Subscribe to changes
   */
  subscribe(callback: (newValue: T) => void): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }
}

/**
 * Factory function to create a storage instance with a default value.
 * Maintained for backward compatibility with createStorage calls.
 */
export function createStorage<T>(
  key: string,
  defaultValue: T,
  config: StorageConfig & { liveUpdate?: boolean } = {}
): BaseStorage<T> {
  return new BaseStorage<T>(key, defaultValue, config);
}