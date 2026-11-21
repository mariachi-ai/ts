// @mariachi/integration-intercom: the Messenger's loader.
//
// widgetSnippet() loads it from a <script> on the page. It reads its own data- attributes: data-app-id (the
// workspace ID), data-api-base (the region's Messenger API), data-user-jwt (the signed identity from
// chatIdentity(), for a signed-in user) and data-hide-default-launcher. Serve it as a file, since a Mariachi page runs
// no inline script:
//
//   api.withStaticFile('/assets/lib/intercom.js', packageFile('@mariachi/integration-intercom/intercom.js'))
//
// It does what Intercom's install snippet does: sets window.intercomSettings, queues window.Intercom calls until the
// widget has loaded, and loads the widget from widget.intercom.io. The app's own scripts can then call
// window.Intercom('show'), window.Intercom('trackEvent', ...) and, at sign-out, window.Intercom('shutdown').
(() => {
  const script = document.currentScript;
  const appId = script?.getAttribute('data-app-id');
  if (!appId || !/^[A-Za-z0-9]+$/.test(appId)) return;
  const settings = { app_id: appId };
  const apiBase = script.getAttribute('data-api-base');
  if (apiBase && /^https:\/\/api-iam\.(eu\.|au\.)?intercom\.io$/.test(apiBase)) settings.api_base = apiBase;
  const jwt = script.getAttribute('data-user-jwt');
  if (jwt) settings.intercom_user_jwt = jwt;
  if (script.hasAttribute('data-hide-default-launcher')) settings.hide_default_launcher = true;
  window.intercomSettings = settings;

  const existing = window.Intercom;
  if (typeof existing === 'function') {
    // Already loaded (a page swapped in without a full load): pass the new settings to it
    existing('reattach_activator');
    existing('update', settings);
    return;
  }
  // Calls made before the widget arrives wait in a queue it reads, as Intercom's own snippet does (so not an arrow
  // function: the widget reads each call's `arguments` object)
  const queue = function intercom() {
    // biome-ignore lint/style/noArguments: the widget reads the `arguments` object itself, not an array
    queue.c(arguments);
  };
  queue.q = [];
  queue.c = (args) => {
    queue.q.push(args);
  };
  window.Intercom = queue;
  const widget = document.createElement('script');
  widget.async = true;
  widget.src = `https://widget.intercom.io/widget/${appId}`;
  document.head.appendChild(widget);
})();
