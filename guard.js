/**
 * LearnEx — guard.js
 * Folder: /Check/guard.js
 *
 * Flow:
 *  1. URL mein ?rcz_tok=... hai  →  token valid karo, localStorage mein save karo, 24hr access do
 *  2. localStorage mein valid token hai  →  page load hone do
 *  3. Kuch nahi hai  →  /generate.html pe redirect karo
 */

(function () {
  'use strict';

  /* ── Config ── */
  var STORAGE_KEY    = 'rcz_token';          // localStorage key
  var RETURN_KEY     = 'rcz_return';         // sessionStorage key (return URL)
  var GENERATE_PAGE  = '/generate.html';     // jahan bhejna hai agar no access
  var TOKEN_TTL      = 24 * 60 * 60 * 1000; // 24 hours in ms

  /* ── Helpers ── */

  function getUrlToken() {
    try {
      return new URLSearchParams(window.location.search).get('rcz_tok');
    } catch (e) { return null; }
  }

  function getStoredToken() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (data && typeof data.exp === 'number' && Date.now() < data.exp) {
        return data;
      }
      localStorage.removeItem(STORAGE_KEY); // expired, clean up
      return null;
    } catch (e) {
      return null;
    }
  }

  function saveToken() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        exp: Date.now() + TOKEN_TTL,
        grantedAt: Date.now()
      }));
    } catch (e) { /* storage blocked — ignore */ }
  }

  function removeTokenFromUrl() {
    try {
      var url = new URL(window.location.href);
      url.searchParams.delete('rcz_tok');
      var clean = url.toString();
      // history.replaceState so Back button bhi clean URL dikhaye
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', clean);
      }
    } catch (e) { /* old browser — ignore */ }
  }

  function saveReturnUrl() {
    try {
      sessionStorage.setItem(RETURN_KEY, window.location.href);
    } catch (e) { /* session storage blocked */ }
  }

  function redirectToGenerate() {
    saveReturnUrl();
    window.location.replace(GENERATE_PAGE);
  }

  /* ── Main Logic ── */

  // Step 1: URL mein token aaya? (shortlink se wapas aaya user)
  var urlToken = getUrlToken();
  if (urlToken && urlToken.length >= 8) {
    // Token valid length ka hai → grant access
    saveToken();
    removeTokenFromUrl();
    // Page load hone do (script yahan ruk jaata hai)
    return;
  }

  // Step 2: Pehle se valid token localStorage mein hai?
  if (getStoredToken()) {
    // Access hai → page load hone do
    return;
  }

  // Step 3: Koi access nahi → generate page pe bhejo
  redirectToGenerate();

})();
