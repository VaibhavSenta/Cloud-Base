if (typeof window !== 'undefined') {
  // Create log console overlay
  const setupLogBox = () => {
    if (document.getElementById('browser-log-box')) return;
    const logBox = document.createElement('div');
    logBox.id = 'browser-log-box';
    logBox.style.cssText = 'position: fixed; bottom: 0; left: 0; right: 0; height: 160px; background: rgba(0,0,0,0.9); color: #00ff00; font-family: monospace; font-size: 11px; z-index: 100000; overflow-y: auto; border-top: 2px solid #0095f6; padding: 10px; box-sizing: border-box;';
    logBox.innerHTML = '<div style="font-weight: bold; border-bottom: 1px solid #333; padding-bottom: 4px; margin-bottom: 6px; color: #0095f6; display: flex; justify-content: space-between;"><span>🔍 Browser Console Mirror</span><button onclick="document.getElementById(\'browser-log-box\').style.display=\'none\'" style="background: none; border: none; color: #ff4444; cursor: pointer; font-family: monospace;">[Close]</button></div>';
    document.body.appendChild(logBox);
  };

  // Wait for body to be ready to append logBox
  if (document.body) {
    setupLogBox();
  } else {
    document.addEventListener('DOMContentLoaded', setupLogBox);
  }

  const appendLog = (type, args) => {
    setupLogBox();
    const logBox = document.getElementById('browser-log-box');
    if (!logBox) return;

    const msg = Array.from(args).map(arg => {
      if (arg instanceof Error) return arg.stack || arg.message;
      return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
    }).join(' ');

    const logLine = document.createElement('div');
    logLine.style.marginBottom = '4px';
    logLine.style.whiteSpace = 'pre-wrap';
    logLine.style.wordBreak = 'break-all';
    logLine.style.color = type === 'error' ? '#ff4444' : type === 'warn' ? '#ffaa00' : '#00ff00';
    logLine.innerText = `[${type.toUpperCase()}] ${msg}`;
    logBox.appendChild(logLine);
    logBox.scrollTop = logBox.scrollHeight;
  };

  const origLog = console.log;
  const origWarn = console.warn;
  const origError = console.error;

  console.log = function() { origLog.apply(console, arguments); appendLog('log', arguments); };
  console.warn = function() { origWarn.apply(console, arguments); appendLog('warn', arguments); };
  console.error = function() { origError.apply(console, arguments); appendLog('error', arguments); };

  window.addEventListener('error', (event) => {
    const errorMsg = event.error?.stack || event.message || 'Unknown error';
    appendLog('error', [new Error(`Global Uncaught: ${errorMsg}`)]);
  });

  window.addEventListener('unhandledrejection', (event) => {
    const errorMsg = event.reason?.stack || event.reason?.message || String(event.reason) || 'Promise rejection';
    appendLog('error', [new Error(`Unhandled Rejection: ${errorMsg}`)]);
  });
}
