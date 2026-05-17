document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('url-form');
    const urlInput = document.getElementById('url-input');
    const browserFrame = document.getElementById('browser-frame');
    const loadingOverlay = document.getElementById('loading-overlay');
    const welcomeScreen = document.getElementById('welcome-screen');
    const proxyModeToggle = document.getElementById('proxy-mode');
    const deepProxyToggle = document.getElementById('deep-proxy-mode');
    
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

    function loadUrl(targetUrl) {
        if (!targetUrl) return;

        const normalized = normalizeUrl(targetUrl);
        urlInput.value = normalized; // Update input with normalized

        // Hide welcome screen, show loading and iframe
        welcomeScreen.classList.add('hidden');
        loadingOverlay.classList.remove('hidden');
        browserFrame.style.display = 'block';

        let finalSource = normalized;

        if (proxyModeToggle.checked && deepProxyToggle.checked) {
            finalSource = PROXY_BASE + encodeURIComponent(normalized);
            console.log("Fetching via Deep Proxy:", finalSource);
            
            fetch(finalSource)
                .then(res => res.text())
                .then(html => {
                    let targetOrigin;
                    try {
                        targetOrigin = new URL(normalized).origin;
                    } catch (e) {
                        targetOrigin = normalized;
                    }
                    
                    const baseTag = `<base href="${targetOrigin}/">`;
                    let modifiedHtml = html;
                    
                    if (html.match(/<head>/i)) {
                        modifiedHtml = html.replace(/<head>/i, `<head>\n    ${baseTag}`);
                    } else {
                        modifiedHtml = baseTag + '\n' + html;
                    }
                    
                    // Clear src to use srcdoc
                    browserFrame.removeAttribute('src');
                    browserFrame.srcdoc = modifiedHtml;
                })
                .catch(err => {
                    console.error("Proxy fetch failed:", err);
                    browserFrame.removeAttribute('src');
                    browserFrame.srcdoc = `<h2 style="font-family:sans-serif;color:red;">Error loading page</h2><p>${err}</p>`;
                })
                .finally(() => {
                    setTimeout(() => loadingOverlay.classList.add('hidden'), 300);
                });
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

    // Auto-focus the URL input
    urlInput.focus();
});
