export class SecurityManager {
  private static instance: SecurityManager;
  private requestCounts = new Map<string, { count: number; resetTime: number }>();

  public static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.initialize();
      } catch (error) {
        console.warn('Security initialization failed:', error);
      }
    }
  }

  private initialize() {
    try {
      this.setupSecurityMeasures();
      this.obfuscateGlobals();
      this.blockExtensions();
      this.preventBypass();
    } catch (error) {
      console.warn('Security setup failed:', error);
    }
  }

  private setupSecurityMeasures() {
    // Disable right-click context menu
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      return false;
    });

    // Disable common developer shortcuts
    document.addEventListener('keydown', (e) => {
      // F12 (Dev Tools)
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+I (Dev Tools)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault();
        return false;
      }

      // Ctrl+U (View Source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+K (Console in Firefox)
      if (e.ctrlKey && e.shiftKey && e.key === 'K') {
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+C (Inspect Element)
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        return false;
      }
    });

    // Detect dev tools opening
    this.detectDevTools();

    // Clear console periodically
    setInterval(() => {
      try {
        console.clear();
      } catch(e) {}
    }, 5000);

    // Override console methods
    this.overrideConsole();

    // Detect source viewing attempts
    this.detectSourceViewing();
  }

  private detectDevTools() {
    const threshold = 160;
    let devtools = {
      open: false,
      warningShown: false
    };

    const checkMethods = [
      () => {
        const heightDiff = window.outerHeight - window.innerHeight;
        const widthDiff = window.outerWidth - window.innerWidth;
        return (heightDiff > threshold && heightDiff < 800) || (widthDiff > threshold && widthDiff < 800);
      },

      () => {
        let devtoolsOpen = false;
        const element = new Image();
        Object.defineProperty(element, 'id', {
          get: function() {
            devtoolsOpen = true;
            return 'devtools-detector';
          }
        });
        console.log('%c', element);
        return devtoolsOpen;
      },

      () => {
        const start = performance.now();
        debugger;
        const end = performance.now();
        return (end - start) > 100;
      }
    ];

    setInterval(() => {
      const isDetected = checkMethods.some(method => {
        try {
          return method();
        } catch(e) {
          return false;
        }
      });

      if (isDetected && !devtools.open && !devtools.warningShown) {
        devtools.open = true;
        devtools.warningShown = true;
        this.showDevToolsWarning();
        this.triggerSecurityAction();
      } else if (!isDetected) {
        devtools.open = false;
        setTimeout(() => {
          devtools.warningShown = false;
        }, 3000);
      }
    }, 1000);
  }

  private triggerSecurityAction() {
    document.body.style.filter = 'blur(5px)';
    document.body.style.pointerEvents = 'none';

    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.8); z-index: 999999;
      display: flex; align-items: center; justify-content: center;
      color: white; font-size: 24px; text-align: center;
    `;
    overlay.innerHTML = `
      <div>
        <h2>🔒 Access Restricted</h2>
        <p>Developer tools detected. Please close them to continue.</p>
        <button onclick="location.reload()" style="
          margin-top: 20px; padding: 10px 20px; background: #007bff; 
          color: white; border: none; border-radius: 5px; cursor: pointer;
        ">Reload Page</button>
      </div>
    `;

    document.body.appendChild(overlay);

    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.remove();
      }
      document.body.style.filter = '';
      document.body.style.pointerEvents = '';
    }, 10000);
  }

  private showDevToolsWarning() {
    const warning = document.createElement('div');
    warning.style.cssText = `
      position: fixed; top: 20px; right: 20px; width: 300px; 
      background: rgba(255, 0, 0, 0.9); color: white; padding: 15px; 
      border-radius: 8px; z-index: 999999; font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    warning.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span>⚠️ Developer tools detected</span>
        <button onclick="this.parentElement.parentElement.remove()" 
                style="background: none; border: none; color: white; cursor: pointer; font-size: 18px;">×</button>
      </div>
    `;

    document.body.appendChild(warning);

    setTimeout(() => {
      if (warning.parentNode) {
        warning.remove();
      }
    }, 5000);
  }

  private overrideConsole() {
    const noop = () => {};
    const originalConsole = { ...console };

    Object.defineProperty(window, 'console', {
      value: {
        ...originalConsole,
        log: noop,
        warn: noop,
        error: noop,
        info: noop,
        debug: noop,
        clear: originalConsole.clear, // Keep clear functionality
      },
      writable: false,
      configurable: false,
    });
  }

  public sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .replace(/script/gi, '')
      .trim();
  }

  // XSS protection
  public escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private detectSourceViewing() {
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        this.showSourceAccessWarning();
        return false;
      }
    });
  }

  private showSourceAccessWarning() {
    alert('Source code viewing is restricted for this application.');
  }

  public checkRateLimit(identifier: string, maxRequests = 10, windowMs = 60000): boolean {
    const now = Date.now();
    const record = this.requestCounts.get(identifier);

    if (!record || now > record.resetTime) {
      this.requestCounts.set(identifier, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (record.count >= maxRequests) {
      return false;
    }

    record.count++;
    return true;
  }

  private obfuscateGlobals() {
    try {
      delete (window as any).React;
      delete (window as any).ReactDOM;
      delete (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
      delete (window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__;
      delete (window as any).__REDUX_DEVTOOLS_EXTENSION__;

      Function.prototype.toString = function() {
        return `function ${this.name}() { [native code] }`;
      };

      Object.defineProperty(window, 'chrome', { value: undefined, writable: false });
      Object.defineProperty(window, 'safari', { value: undefined, writable: false });

      if (window.top !== window.self) {
        window.top.location = window.self.location;
      }

    } catch(e) {
      // Silently fail
    }
  }

  private blockExtensions() {
    try {
      Object.defineProperty(window, 'DevTools', { value: undefined, writable: false });
      Object.defineProperty(window, '__REDUX_DEVTOOLS_EXTENSION__', { value: undefined, writable: false });
    } catch(e) {
      // Silently fail
    }

    // Check for common extension patterns
    const extensionPatterns = [
      'chrome-extension://',
      'moz-extension://',
      'webkit-extension://',
      'ms-browser-extension://'
    ];

    // Block extension access attempts
    try {
      const originalFetch = window.fetch;
      window.fetch = function(...args) {
        try {
          const url = args[0]?.toString() || '';
          if (extensionPatterns.some(pattern => url.includes(pattern))) {
            return Promise.reject(new Error('Extension access blocked'));
          }
          return originalFetch.apply(this, args);
        } catch (error) {
          return Promise.reject(error);
        }
      };
    } catch (error) {
      console.warn('Failed to setup fetch blocking:', error);
    }
  }

  private preventBypass() {
    setInterval(() => {
      try {
        if ((window as any).eruda || (window as any).vconsole) {
          location.reload();
        }
      } catch(e) {
        // Silently fail
      }
    }, 1000);

      // Block common bypass methods
    const blockedProperties = ['__proto__', 'constructor', 'prototype'];

    blockedProperties.forEach(prop => {
      try {
        Object.defineProperty(Object.prototype, prop, {
          get() { return undefined; },
          set() { return false; },
          configurable: false
        });
      } catch(e) {}
    });

    // Prevent eval and Function constructor
    window.eval = function() { throw new Error('eval() is disabled'); };
    window.Function = function() { throw new Error('Function constructor is disabled'); };
  }
}

// Initialize immediately if in browser
if (typeof window !== 'undefined') {
  try {
    SecurityManager.getInstance();
  } catch (error) {
    // Silently fail if security can't initialize
  }
}

// Initialize immediately if in browser
if (typeof window !== 'undefined') {
  try {
    SecurityManager.getInstance();
  } catch (error) {
    // Silently fail if security can't initialize
  }
}