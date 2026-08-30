// share.js — encodes/decodes portfolio JSON into a URL fragment so a portfolio
// can be shared as a single link with NO backend/database required.
// (The link itself carries the data — that's the trade-off of static hosting.
//  See README for how to swap this for real server-side storage later.)

export function encodeDataToHash(dataObj) {
  const json = JSON.stringify(dataObj);
  const base64 = btoa(unescape(encodeURIComponent(json)));
  return base64;
}

export function decodeDataFromHash(base64) {
  const json = decodeURIComponent(escape(atob(base64)));
  return JSON.parse(json);
}

export function buildPortfolioUrl(dataObj, layout) {
  const encoded = encodeURIComponent(encodeDataToHash(dataObj));
  const url = new URL('portfolio.html', window.location.href);
  url.hash = `layout=${layout}&d=${encoded}`;
  return url.toString();
}

export function readHashParams() {
  const hash = window.location.hash.replace(/^#/, '');
  const params = new URLSearchParams(hash);
  return {
    layout: params.get('layout') || 'classic',
    data: params.get('d')
  };
}
