// @mariachi/integration-google-analytics: the Google tag's setup, with Consent Mode v2.
//
// gtagSnippet() loads it from a <script> in the page's <head>, just before gtag.js. It reads its own data-
// attributes: data-measurement-id (the G- ID) and data-granted (the consent types the visitor already granted,
// space-separated). Serve it as a file, since a Mariachi page runs no inline script:
//
//   api.withStaticFile('/assets/lib/gtag.js', packageFile('@mariachi/integration-google-analytics/gtag.js'))
//
// It defines window.gtag, so the app's consent banner can call gtag('consent', 'update', { ... }).
(() => {
  const script = document.currentScript;
  const id = script?.getAttribute('data-measurement-id');
  if (!id || !/^G-[A-Z0-9]+$/.test(id)) return;
  window.dataLayer = window.dataLayer || [];
  // gtag.js reads the queue as `arguments` objects, exactly as Google's own snippet pushes them (so not an arrow function)
  window.gtag = function gtag() {
    // biome-ignore lint/style/noArguments: gtag.js needs the `arguments` object itself, not an array
    window.dataLayer.push(arguments);
  };
  const types = ['ad_storage', 'ad_user_data', 'ad_personalization', 'analytics_storage'];
  // Consent Mode v2: everything denied, before gtag.js loads and before anything is measured
  window.gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' });
  const granted = (script.getAttribute('data-granted') || '').split(/\s+/).filter((t) => types.indexOf(t) >= 0);
  if (granted.length) {
    const update = {};
    for (const t of granted) update[t] = 'granted';
    window.gtag('consent', 'update', update);
  }
  window.gtag('js', new Date());
  window.gtag('config', id);
})();
