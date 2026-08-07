if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    const errorMsg = event.error?.stack || event.message || 'Unknown error';
    // Check if error banner is already rendered
    if (document.getElementById('global-error-banner')) return;

    const errorDiv = document.createElement('div');
    errorDiv.id = 'global-error-banner';
    errorDiv.style.cssText = 'padding: 20px; background: #3b0000; color: #ff8888; font-family: monospace; font-size: 13px; z-index: 99999; position: fixed; top: 0; left: 0; right: 0; bottom: 0; overflow: auto;';
    errorDiv.innerHTML = `<h2 style="margin: 0; color: #ff4444">🚨 Client-Side Hydration Crash</h2><pre style="white-space: pre-wrap; margin-top: 10px">${errorMsg}</pre><button onclick="window.location.reload()" style="margin-top: 15px; padding: 8px 16px; background: #ff4444; color: #fff; border: none; border-radius: 4px; cursor: pointer;">Reload Page</button>`;
    document.body.appendChild(errorDiv);
  });

  window.addEventListener('unhandledrejection', (event) => {
    const errorMsg = event.reason?.stack || event.reason?.message || String(event.reason) || 'Promise rejection';
    if (document.getElementById('global-error-banner')) return;

    const errorDiv = document.createElement('div');
    errorDiv.id = 'global-error-banner';
    errorDiv.style.cssText = 'padding: 20px; background: #3b0000; color: #ff8888; font-family: monospace; font-size: 13px; z-index: 99999; position: fixed; top: 0; left: 0; right: 0; bottom: 0; overflow: auto;';
    errorDiv.innerHTML = `<h2 style="margin: 0; color: #ff4444">🚨 Client-Side Promise Rejection</h2><pre style="white-space: pre-wrap; margin-top: 10px">${errorMsg}</pre><button onclick="window.location.reload()" style="margin-top: 15px; padding: 8px 16px; background: #ff4444; color: #fff; border: none; border-radius: 4px; cursor: pointer;">Reload Page</button>`;
    document.body.appendChild(errorDiv);
  });
}
