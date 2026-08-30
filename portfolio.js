import { readHashParams, buildPortfolioUrl } from './share.js';
import { decodeDataFromHash } from './share.js';

const wrap = document.getElementById('portfolio-wrap');
const { layout: initialLayout, data: encoded } = readHashParams();

let data;
try {
  data = encoded ? decodeDataFromHash(encoded) : null;
} catch (e) {
  data = null;
}

if (!data) {
  wrap.innerHTML = `<div style="padding:120px 24px;text-align:center;font-family:sans-serif;">
    <h1>No portfolio data found</h1>
    <p>This link is missing its data, or was typed in by hand. Generate a portfolio from the editor first.</p>
    <a href="index.html">← Back home</a>
  </div>`;
} else {
  render(initialLayout);
  setupToolbar(initialLayout);
}

function setupToolbar(activeLayout) {
  document.querySelectorAll('.layout-toggle button').forEach((btn) => {
    if (btn.dataset.layout === activeLayout) btn.classList.add('active');
    btn.addEventListener('click', () => {
      document.querySelectorAll('.layout-toggle button').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      render(btn.dataset.layout);
      const newUrl = buildPortfolioUrl(data, btn.dataset.layout);
      history.replaceState(null, '', newUrl);
    });
  });

  document.getElementById('copy-link-btn')?.addEventListener('click', async (e) => {
    await navigator.clipboard.writeText(window.location.href);
    const btn = e.target;
    const original = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => (btn.textContent = original), 1500);
  });
}

function render(layout) {
  wrap.className = `portfolio-wrap layout-${layout}`;
  wrap.innerHTML = `
    <header class="p-header">
      <h1 class="p-name">${escapeHtml(data.name)}</h1>
      ${data.title ? `<div class="p-title">${escapeHtml(data.title)}</div>` : ''}
      <div class="p-links">
        ${data.email ? `<a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a>` : ''}
        ${(data.links || []).map((l) => `<a href="${escapeHtml(l.url)}" target="_blank" rel="noopener">${escapeHtml(l.label)}</a>`).join('')}
      </div>
    </header>

    ${data.summary ? section('About', `<p>${escapeHtml(data.summary)}</p>`) : ''}
    ${listSection('Experience', data.experience, (i) => itemBlock(i.role, i.detail))}
    ${listSection('Projects', data.projects, (i) => itemBlock(i.name, i.detail))}
    ${listSection('Education', data.education, (i) => itemBlock(i.school, i.detail))}
    ${data.skills && data.skills.length ? section('Skills', data.skills.map((s) => `<span class="chip">${escapeHtml(s)}</span>`).join('')) : ''}
    ${data.achievements && data.achievements.length ? section('Achievements', `<ul>${data.achievements.map((a) => `<li>${escapeHtml(a)}</li>`).join('')}</ul>`) : ''}
  `;
}

function section(title, innerHtml) {
  return `<section class="p-section"><h2>${title}</h2>${innerHtml}</section>`;
}
function listSection(title, items, itemRenderer) {
  if (!items || !items.length) return '';
  return section(title, items.map(itemRenderer).join(''));
}
function itemBlock(top, sub) {
  return `<div class="p-item"><div class="p-item-top">${escapeHtml(top || '')}</div><div class="p-item-sub">${escapeHtml(sub || '')}</div></div>`;
}
function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
