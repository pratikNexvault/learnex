/**
 * LearnEx — guard.js
 *
 * Flow:
 *  1. localStorage mein valid token hai → page load hone do
 *  2. Kuch nahi hai → /generate.html pe redirect karo
 */

(function () {
  'use strict';

  var STORAGE_KEY = 'lx_token';
  var GENERATE_PAGE = '/generate.html';

  function getStoredToken() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (data && typeof data.exp === 'number' && Date.now() < data.exp) {
        return data;
      }
      localStorage.removeItem(STORAGE_KEY);
      return null;
    } catch (e) {
      return null;
    }
  }

  function redirectToGenerate() {
    try { sessionStorage.setItem('lx_return', window.location.href); } catch(e){}
    window.location.replace(GENERATE_PAGE);
  }

  // Valid token hai? → access do
  if (getStoredToken()) {
    return;
  }

  // Koi token nahi → generate pe bhejo
  redirectToGenerate();

})();
