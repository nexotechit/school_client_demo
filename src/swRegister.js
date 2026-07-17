// Service Worker Registration Utility - DISABLED AND UNREGISTERING ALL SW
class ServiceWorkerManager {
  constructor() {
    this.registration = null;
    this.updateAvailable = false;
    this.updateCallbacks = [];
  }

  async register() {
    if ('serviceWorker' in navigator) {
      try {
        console.log('[SW Manager] Registering service worker...');
        this.registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
        console.log('[SW Manager] Service worker registered:', this.registration);

        // Handle updates
        this.registration.addEventListener('updatefound', () => {
          const newWorker = this.registration.installing;
          console.log('[SW Manager] New service worker found');
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[SW Manager] New service worker available');
              this.updateAvailable = true;
              this.notifyUpdateCallbacks();
            }
          });
        });

        // Handle controller change (new SW activated)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('[SW Manager] Service worker controller changed');
          window.location.reload();
        });

        // Check for updates periodically
        this.startPeriodicUpdateCheck();

        return this.registration;
      } catch (error) {
        console.error('[SW Manager] Service worker registration failed:', error);
        throw error;
      }
    } else {
      console.warn('[SW Manager] Service workers not supported');
      return null;
    }
  }

  // Unregister the service worker
  async unregister() {
    if (this.registration) {
      try {
        const result = await this.registration.unregister();
        console.log('[SW Manager] Service worker unregistered:', result);
        this.registration = null;
        this.updateAvailable = false;
        return result;
      } catch (error) {
        console.error('[SW Manager] Service worker unregistration failed:', error);
        throw error;
      }
    }
  }

  // Unregister ALL service workers
  async unregisterAll() {
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        console.log(`[SW Manager] Found ${registrations.length} service worker(s) to unregister`);
        
        for (const registration of registrations) {
          const result = await registration.unregister();
          console.log('[SW Manager] Unregistered service worker:', result);
        }
        
        this.registration = null;
        this.updateAvailable = false;
        console.log('[SW Manager] All service workers unregistered successfully');
        return true;
      } catch (error) {
        console.error('[SW Manager] Failed to unregister all service workers:', error);
        return false;
      }
    }
    return false;
  }

  // Skip waiting and activate new service worker
  skipWaiting() {
    if (this.registration && this.registration.waiting) {
      console.log('[SW Manager] Skipping waiting for new service worker');
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }

  // Add callback for update notifications
  onUpdate(callback) {
    this.updateCallbacks.push(callback);
    if (this.updateAvailable) {
      callback();
    }
  }

  // Remove update callback
  offUpdate(callback) {
    this.updateCallbacks = this.updateCallbacks.filter(cb => cb !== callback);
  }

  // Notify all update callbacks
  notifyUpdateCallbacks() {
    this.updateCallbacks.forEach(callback => callback());
  }

  // Check for updates
  async checkForUpdates() {
    if (this.registration) {
      try {
        await this.registration.update();
        console.log('[SW Manager] Checked for updates');
      } catch (error) {
        console.error('[SW Manager] Update check failed:', error);
      }
    }
  }

  // Start periodic update checks
  startPeriodicUpdateCheck() {
    // Check for updates every 30 minutes
    setInterval(() => {
      this.checkForUpdates();
    }, 30 * 60 * 1000);
  }

  // Get service worker state
  getState() {
    if (!this.registration) return 'not-registered';

    const worker = this.registration.active || this.registration.waiting || this.registration.installing;
    if (!worker) return 'unknown';

    return worker.state;
  }

  // Send message to service worker
  async sendMessage(message) {
    if (navigator.serviceWorker.controller) {
      return new Promise((resolve) => {
        const messageChannel = new MessageChannel();
        messageChannel.port1.onmessage = (event) => {
          resolve(event.data);
        };
        navigator.serviceWorker.controller.postMessage(message, [messageChannel.port2]);
      });
    }
  }

  // Get cache names and sizes (for debugging)
  async getCacheInfo() {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      const cacheInfo = {};

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        cacheInfo[cacheName] = {
          name: cacheName,
          entries: keys.length,
          urls: keys.map(request => request.url)
        };
      }

      return cacheInfo;
    }
    return {};
  }

  // Clear all caches
  async clearAllCaches() {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('[SW Manager] All caches cleared');
    }
  }
}

// Create singleton instance
const swManager = new ServiceWorkerManager();

// Export for use in components
export default swManager;

// Auto-register service worker only in production (Turbopack/dev mode does not support SW)
if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => swManager.register().catch(console.error));
  } else {
    swManager.register().catch(console.error);
  }
} 
