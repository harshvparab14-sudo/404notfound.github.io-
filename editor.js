import { buildPortfolioUrl } from './share.js';

const raw = localStorage.getItem('ppf_resume_data');
let data = raw
  ? JSON.parse(raw)
  : {
      name: 'Your Name', title: '', summary: '', email: '', phone: '',
      education: [], experience: [], projects: [], skills: [], achievements: [], links: []
    };

const root = document.getElementById('editor-root');

function save() {
  localStorage.setItem('ppf_resume_data', JSON.stringify(data));
}

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'class') node.className = v;
    else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v);
  });
  children.forEach((c) => node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
  return node;
}

function textField(labelText, value, onInput, multiline = false) {
  const input = el(multiline ? 'textarea' : 'input', {
    oninput: (e) => onInput(e.target.value)
  });
  input.value = value || '';
  if (multiline) input.rows = 3;
  const wrap = el('div', {}, [el('label', {}, [labelText]), input]);
  return wrap;
}

function reorder(arr, index, dir) {
  const target = index + dir;
  if (target < 0 || target >= arr.length) return;
  [arr[index], arr[target]] = [arr[target], arr[index]];
}

function renderRepeatable(sectionKey, title, itemFactory, renderItemFields) {
  const block = el('div', { class: 'editor-block' });
  block.appendChild(el('h2', {}, [title]));

  const list = el('div');
  function draw() {
    list.innerHTML = '';
    data[sectionKey].forEach((item, i) => {
      const itemEl = el('div', { class: 'repeat-item' });
      itemEl.appendChild(renderItemFields(item, i, draw));
      const actions = el('div', { class: 'repeat-item-actions' }, [
        el('button', { class: 'icon-btn', onclick: () => { reorder(data[sectionKey], i, -1); save(); draw(); } }, ['↑ Up']),
        el('button', { class: 'icon-btn', onclick: () => { reorder(data[sectionKey], i, 1); save(); draw(); } }, ['↓ Down']),
        el('button', { class: 'icon-btn danger', onclick: () => { data[sectionKey].splice(i, 1); save(); draw(); } }, ['✕ Remove'])
      ]);
      itemEl.appendChild(actions);
      list.appendChild(itemEl);
    });
  }
  draw();
  block.appendChild(list);
  block.appendChild(el('button', {
    class: 'add-btn',
    onclick: () => { data[sectionKey].push(itemFactory()); save(); draw(); }
  }, [`+ Add ${title.slice(0, -1)}`]));
  root.appendChild(block);
}

function renderProfile() {
  const block = el('div', { class: 'editor-block' });
  block.appendChild(el('h2', {}, ['Profile']));
  const row1 = el('div', { class: 'field-row' }, [
    textField('Full name', data.name, (v) => { data.name = v; save(); }),
    textField('Headline / title', data.title, (v) => { data.title = v; save(); })
  ]);
  const row2 = el('div', { class: 'field-row' }, [
    textField('Email', data.email, (v) => { data.email = v; save(); }),
    textField('Phone', data.phone, (v) => { data.phone = v; save(); })
  ]);
  const row3 = el('div', { class: 'field-row full' }, [
    textField('Summary', data.summary, (v) => { data.summary = v; save(); }, true)
  ]);
  block.appendChild(row1);
  block.appendChild(row2);
  block.appendChild(row3);
  root.appendChild(block);
}

function renderSkills() {
  const block = el('div', { class: 'editor-block' });
  block.appendChild(el('h2', {}, ['Skills']));
  block.appendChild(textField(
    'Comma-separated list',
    data.skills.join(', '),
    (v) => { data.skills = v.split(',').map((s) => s.trim()).filter(Boolean); save(); },
    true
  ));
  root.appendChild(block);
}

function renderLinks() {
  renderRepeatable('links', 'Links', () => ({ label: 'Link', url: '' }), (item, i, draw) =>
    el('div', { class: 'field-row' }, [
      textField('Label', item.label, (v) => { item.label = v; save(); }),
      textField('URL', item.url, (v) => { item.url = v; save(); })
    ])
  );
}

renderProfile();

renderRepeatable('education', 'Education', () => ({ school: '', detail: '' }), (item) =>
  el('div', {}, [
    textField('School / Course', item.school, (v) => { item.school = v; save(); }),
    textField('Details (years, grade, etc.)', item.detail, (v) => { item.detail = v; save(); }, true)
  ])
);

renderRepeatable('experience', 'Experience', () => ({ role: '', detail: '' }), (item) =>
  el('div', {}, [
    textField('Role / Company', item.role, (v) => { item.role = v; save(); }),
    textField('Details', item.detail, (v) => { item.detail = v; save(); }, true)
  ])
);

renderRepeatable('projects', 'Projects', () => ({ name: '', detail: '' }), (item) =>
  el('div', {}, [
    textField('Project name', item.name, (v) => { item.name = v; save(); }),
    textField('Details', item.detail, (v) => { item.detail = v; save(); }, true)
  ])
);

renderSkills();

renderRepeatable('achievements', 'Achievements', () => '', (item, i) =>
  textField('Achievement', item, (v) => { data.achievements[i] = v; save(); })
);

renderLinks();

// ---- Generate & publish ----
document.getElementById('generate-btn').addEventListener('click', () => {
  const layout = document.querySelector('input[name="layout"]:checked')?.value || 'classic';
  save();
  const url = buildPortfolioUrl(data, layout);
  window.location.href = url;
});
