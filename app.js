import { BareMuxConnection } from "./uv/bare-mux/index.mjs";

const basePath = location.pathname.replace(/\/[^\/]*$/, '/');
const connection = new BareMuxConnection(basePath + "uv/bare-mux/worker.js");
connection.setTransport(basePath + "uv/bare-transport/index.mjs", ["https://bare-server-106043020272.northamerica-northeast1.run.app/bare/"])
    .then(() => console.log("Bare transport successfully initialized!"))
    .catch(err => console.error("Failed to set Bare transport:", err));

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('url-form');
    const urlInput = document.getElementById('url-input');
    const browserFrame = document.getElementById('browser-frame');
    const loadingOverlay = document.getElementById('loading-overlay');
    const welcomeScreen = document.getElementById('welcome-screen');
    const proxyModeToggle = document.getElementById('proxy-mode');
    const uvProxyToggle = document.getElementById('uv-proxy-mode');

    // Clean up old Service Workers (like COI) and Register Ultraviolet
    let swReady = Promise.resolve();
    if ('serviceWorker' in navigator) {
        swReady = navigator.serviceWorker.getRegistrations().then((registrations) => {
            const uvScope = new URL(__uv$config.prefix, window.location).href;
            for (let reg of registrations) {
                if (reg.scope !== uvScope) {
                    console.log('Unregistering old service worker at', reg.scope);
                    reg.unregister();
                }
            }
        }).then(() => {
            return navigator.serviceWorker.register('sw.js', {
                scope: __uv$config.prefix
            });
        }).then((registration) => {
            // Wait for the service worker to be active
            return new Promise((resolve) => {
                if (registration.active) {
                    resolve();
                } else {
                    const worker = registration.installing || registration.waiting;
                    worker.addEventListener('statechange', (e) => {
                        if (e.target.state === 'activated') resolve();
                    });
                }
            });
        }).then(() => {
            console.log('UV Service worker registered and ready');
        }).catch(err => {
            console.error('UV Service worker registration failed:', err);
        });
    }
    
    // Buttons
    const btnBack = document.getElementById('btn-back');
    const btnForward = document.getElementById('btn-forward');
    const btnRefresh = document.getElementById('btn-refresh');
    const btnGo = document.getElementById('btn-go');
    const btnFullscreen = document.getElementById('btn-fullscreen');

    // Proxy service (CORS proxy)
    // corsproxy.io is a popular free proxy for this purpose
    const PROXY_BASE = 'https://corsproxy.io/?';

    function normalizeUrl(url) {
        let finalUrl = url.trim();
        // If no protocol is specified, default to https://
        if (!/^https?:\/\//i.test(finalUrl)) {
            finalUrl = 'https://' + finalUrl;
        }
        return finalUrl;
    }

    async function loadUrl(targetUrl) {
        if (!targetUrl) return;

        const normalized = normalizeUrl(targetUrl);
        urlInput.value = normalized; // Update input with normalized

        // Hide welcome screen, show loading and iframe
        welcomeScreen.classList.add('hidden');
        loadingOverlay.classList.remove('hidden');
        browserFrame.style.display = 'block';

        let finalSource = normalized;

        if (uvProxyToggle.checked) {
            console.log("Loading via Ultraviolet Proxy");
            await swReady;
            browserFrame.removeAttribute('srcdoc');
            // Route through UV SW
            browserFrame.src = __uv$config.prefix + __uv$config.encodeUrl(normalized);
        } else if (proxyModeToggle.checked) {
            // Standard proxy: Use direct iframe src to the proxy service
            finalSource = PROXY_BASE + encodeURIComponent(normalized);
            console.log("Loading via Standard Proxy:", finalSource);
            browserFrame.removeAttribute('srcdoc');
            browserFrame.src = finalSource;
        } else {
            console.log("Loading Direct:", finalSource);
            browserFrame.removeAttribute('srcdoc');
            browserFrame.src = finalSource;
        }
    }

    // Event Listeners
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        loadUrl(urlInput.value);
    });

    btnGo.addEventListener('click', () => {
        loadUrl(urlInput.value);
    });

    btnRefresh.addEventListener('click', () => {
        // Reload current URL in input
        loadUrl(urlInput.value);
    });

    // Handle iframe load event
    browserFrame.addEventListener('load', () => {
        // Iframe has finished loading (or failed, but we can't reliably detect failures cross-origin)
        loadingOverlay.classList.add('hidden');
    });

    // Note: btnBack and btnForward are tricky with cross-origin iframes.
    // We can attempt to call history methods on the iframe window, but it may be blocked.
    btnBack.addEventListener('click', () => {
        try {
            browserFrame.contentWindow.history.back();
        } catch (e) {
            console.warn("Cannot access iframe history due to cross-origin restrictions.");
        }
    });

    btnForward.addEventListener('click', () => {
        try {
            browserFrame.contentWindow.history.forward();
        } catch (e) {
            console.warn("Cannot access iframe history due to cross-origin restrictions.");
        }
    });

    btnFullscreen.addEventListener('click', () => {
        const browserWindow = document.querySelector('.browser-window');
        if (!document.fullscreenElement) {
            if (browserWindow.requestFullscreen) {
                browserWindow.requestFullscreen();
            } else if (browserWindow.webkitRequestFullscreen) { /* Safari */
                browserWindow.webkitRequestFullscreen();
            } else if (browserWindow.msRequestFullscreen) { /* IE11 */
                browserWindow.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) { /* Safari */
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { /* IE11 */
                document.msExitFullscreen();
            }
        }
    });

    const btnStealth = document.getElementById('stealth-btn');
    if (btnStealth) {
        btnStealth.addEventListener('click', () => {
            let win = window.open('about:blank', '_blank');
            if (win) {
                let doc = win.document;
                let iframe = doc.createElement('iframe');
                iframe.style.width = '100vw';
                iframe.style.height = '100vh';
                iframe.style.border = 'none';
                iframe.style.margin = '0';
                iframe.src = window.location.href;
                doc.body.style.margin = '0';
                doc.body.appendChild(iframe);
                window.location.replace('https://classroom.google.com'); // Redirect current tab to hide evidence
            } else {
                alert("Popup blocked! Please allow popups to use Stealth Mode.");
            }
        });
    }

    // Auto-focus the URL input
    urlInput.focus();
});
