// @mariachi/integration-crisp: the Crisp chat widget's loader.
//
// crisp.widgetSnippet() loads it from a <script> in the page. It reads its own data- attributes, which the server
// wrote: data-website-id; for a signed-in user data-token-id (the session token), data-email and
// data-email-signature (identity verification), data-nickname, data-company and data-session-data (JSON); and
// data-locale and data-reset. It sets them before Crisp's l.js loads, as Crisp requires, then loads it. Serve it as a
// file, since a Mariachi page runs no inline script:
//
//   api.withStaticFile('/assets/lib/crisp.js', packageFile('@mariachi/integration-crisp/crisp.js'))
//
// It defines window.$crisp, so the app's own scripts can push commands (["do", "chat:open"]).
(() => {
  const script = document.currentScript;
  const id = script?.getAttribute('data-website-id');
  if (!id || !/^[A-Za-z0-9_-]{1,64}$/.test(id)) return;
  const attr = (name) => script.getAttribute(`data-${name}`) || undefined;
  window.$crisp = window.$crisp || [];
  window.CRISP_WEBSITE_ID = id;
  const token = attr('token-id');
  // A session token can only be set before l.js loads
  if (token) window.CRISP_TOKEN_ID = token;
  const locale = attr('locale');
  if (locale) window.CRISP_RUNTIME_CONFIG = { locale };
  if (!token && script.hasAttribute('data-reset')) {
    window.CRISP_TOKEN_ID = null;
    window.$crisp.push(['do', 'session:reset']);
  }
  const email = attr('email');
  const signature = attr('email-signature');
  if (email && signature) window.$crisp.push(['set', 'user:email', [email, signature]]);
  const nickname = attr('nickname');
  if (nickname) window.$crisp.push(['set', 'user:nickname', [nickname]]);
  const company = attr('company');
  if (company) window.$crisp.push(['set', 'user:company', [company]]);
  const data = attr('session-data');
  if (data) {
    try {
      const pairs = Object.entries(JSON.parse(data)).filter(([, v]) => ['string', 'number', 'boolean'].indexOf(typeof v) >= 0);
      if (pairs.length) window.$crisp.push(['set', 'session:data', [pairs]]);
    } catch {
      // Not JSON: the server didn't write it, so it's left out
    }
  }
  const loader = document.createElement('script');
  loader.src = 'https://client.crisp.chat/l.js';
  loader.async = true;
  document.head.appendChild(loader);
})();
