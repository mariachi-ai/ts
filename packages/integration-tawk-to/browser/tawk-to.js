// @mariachi/integration-tawk-to: loads the Tawk.to chat widget and signs the user in to it.
//
// widgetSnippet() loads it from a <script> at the end of the page's <body>. It reads its own data- attributes:
// data-property-id and data-widget-id, and for a signed-in user data-user-id, data-hash (made on the server by
// chatIdentity), data-name, data-email and data-attributes (JSON). Serve it as a file, since a Mariachi page runs no
// inline script:
//
//   api.withStaticFile('/assets/lib/tawk-to.js', packageFile('@mariachi/integration-tawk-to/tawk-to.js'))
//
// It defines window.tawkTo for the page's own scripts:
//   tawkTo.onLoad(fn)               runs fn(Tawk_API) once the widget is ready (at once if it already is)
//   tawkTo.addEvent(name, metadata) records a custom event on the chat; resolves, or rejects with Tawk.to's error code
//   tawkTo.logout()                 signs the user out of the widget, when they sign out of the app
(() => {
  const script = document.currentScript;
  if (!script) return;
  const read = (name) => script.getAttribute(name);
  const ID = /^[A-Za-z0-9_-]+$/;
  const NAME = /^[A-Za-z0-9-]+$/;
  const propertyId = read('data-property-id');
  const widgetId = read('data-widget-id');
  if (!propertyId || !widgetId || !ID.test(propertyId) || !ID.test(widgetId)) return;

  window.Tawk_API = window.Tawk_API || {};
  window.Tawk_LoadStart = new Date();
  const api = window.Tawk_API;
  let ready = false;
  const waiting = [];

  function login() {
    const userId = read('data-user-id');
    const hash = read('data-hash');
    if (!userId || !hash) return;
    const data = {};
    try {
      const attributes = JSON.parse(read('data-attributes') || '{}');
      for (const key of Object.keys(attributes)) if (NAME.test(key) && typeof attributes[key] === 'string') data[key] = attributes[key];
    } catch (_) {
      // Unreadable attributes are left out; the user is still signed in
    }
    data.userId = userId;
    data.hash = hash;
    const name = read('data-name');
    const email = read('data-email');
    if (name) data.name = name;
    if (email) data.email = email;
    api.login(data, (error) => {
      // A 401 here means the hash doesn't match: the wrong API key, or Secure Mode is off for the property
      if (error) console.warn('Tawk.to login failed', error);
    });
  }

  const previous = api.onLoad;
  // An onLoad the page set before this script still runs, after the sign-in
  api.onLoad = function onLoad(...args) {
    ready = true;
    login();
    if (typeof previous === 'function') previous.apply(this, args);
    for (const fn of waiting.splice(0)) fn(api);
  };

  function onLoad(fn) {
    if (ready) fn(api);
    else waiting.push(fn);
  }

  function settle(resolve, reject) {
    return (error) => (error ? reject(error) : resolve());
  }

  window.tawkTo = {
    onLoad,
    addEvent(name, metadata) {
      if (typeof name !== 'string' || !NAME.test(name)) return Promise.reject('INVALID_EVENT_NAME');
      return new Promise((resolve, reject) =>
        onLoad(() => (metadata ? api.addEvent(name, metadata, settle(resolve, reject)) : api.addEvent(name, settle(resolve, reject)))),
      );
    },
    logout() {
      return new Promise((resolve, reject) => onLoad(() => api.logout(settle(resolve, reject))));
    },
  };

  const widget = document.createElement('script');
  widget.async = true;
  widget.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
  widget.charset = 'UTF-8';
  widget.setAttribute('crossorigin', '*');
  script.parentNode.insertBefore(widget, script.nextSibling);
})();
