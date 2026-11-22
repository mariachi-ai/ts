// @mariachi/integration-zendesk: the messaging Web Widget's setup.
//
// widgetSnippet() loads it from a <script> right after Zendesk's snippet (id="ze-snippet"), at the end of <body>. It
// reads its own data- attributes: data-cookies (all, functional or none), data-token (the signed-in user's messaging
// JWT, from chatIdentity) and data-token-url (a path on the app that answers { "token": "…" } with a fresh one). Serve
// it as a file, since a Mariachi page runs no inline script:
//
//   api.withStaticFile('/assets/lib/zendesk-messenger.js', packageFile('@mariachi/integration-zendesk/zendesk-messenger.js'))
//
// A page without a token, after one that signed someone in, signs them out of the widget, so the next person on the
// same browser doesn't see their conversations.
(() => {
  const script = document.currentScript;
  const zE = window.zE;
  if (!script || typeof zE !== 'function') return;
  const FLAG = 'mariachi-zendesk-signed-in';

  const cookies = script.getAttribute('data-cookies');
  if (cookies === 'all' || cookies === 'functional' || cookies === 'none') zE('messenger:set', 'cookies', cookies);
  // With nothing stored, the widget is hidden: there's no one to sign in
  if (cookies === 'none') return;

  let token = script.getAttribute('data-token');
  const tokenUrl = script.getAttribute('data-token-url');

  if (!token) {
    if (remembered()) {
      zE('messenger', 'logoutUser');
      remember(false);
    }
    return;
  }

  // Zendesk calls this to sign in, and again whenever it needs a new token (a 401): the page's token the first time
  // while it's still good, then a fresh one from tokenUrl.
  zE(
    'messenger',
    'loginUser',
    (callback) => {
      const fromPage = token;
      token = null;
      if (fromPage && !expired(fromPage)) {
        callback(fromPage);
        return;
      }
      if (!tokenUrl) return;
      fetch(tokenUrl, { credentials: 'same-origin', headers: { accept: 'application/json' } })
        .then((res) => (res.ok ? res.json() : null))
        .then((body) => {
          if (body && typeof body.token === 'string') callback(body.token);
        })
        .catch(() => {});
    },
    (error) => {
      if (!error) remember(true);
    },
  );

  function expired(jwt) {
    try {
      const part = jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const claims = JSON.parse(atob(part + '='.repeat((4 - (part.length % 4)) % 4)));
      return typeof claims.exp === 'number' && claims.exp * 1000 <= Date.now() + 5000;
    } catch {
      return true;
    }
  }

  function remembered() {
    try {
      return window.localStorage.getItem(FLAG) === '1';
    } catch {
      return false;
    }
  }

  function remember(signedIn) {
    try {
      if (signedIn) window.localStorage.setItem(FLAG, '1');
      else window.localStorage.removeItem(FLAG);
    } catch {
      // Storage is off: nothing is remembered, and nothing is signed out for it
    }
  }
})();
