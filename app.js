import { extractTextFromFile, parseResumeText } from './parser.js';

const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('resume-file');
const statusEl = document.getElementById('hero-status');
const loginModal = document.getElementById('login-modal');
const loginForm = document.getElementById('login-form');
const loginSkip = document.getElementById('login-skip');

// ---- Very light local "account" gate ----
// NOTE: this is a demo-only stand-in for real auth. It stores a name in
// localStorage so the portfolio can greet the user by name. It is NOT secure
// and does NOT sync across devices — see README for upgrading to real auth.
function hasLocalAccount() {
  return !!localStorage.getItem('ppf_user');
}

function showLogin() {
  loginModal.classList.remove('hidden');
}
function hideLogin() {
  loginModal.classList.add('hidden');
}

if (!hasLocalAccount()) showLogin();

loginForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('login-name').value.trim();
  if (!name) return;
  localStorage.setItem('ppf_user', JSON.stringify({ name, createdAt: Date.now() }));
  hideLogin();
});

loginSkip?.addEventListener('click', () => {
  localStorage.setItem('ppf_user', JSON.stringify({ name: 'Guest', createdAt: Date.now() }));
  hideLogin();
});

// ---- Upload + parse ----
['dragover', 'dragenter'].forEach((evt) =>
  dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropzone.classList.add('drag');
  })
);
['dragleave', 'drop'].forEach((evt) =>
  dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropzone.classList.remove('drag');
  })
);
dropzone.addEventListener('drop', (e) => {
  const file = e.dataTransfer.files?.[0];
  if (file) handleFile(file);
});
dropzone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', () => {
  if (fileInput.files?.[0]) handleFile(fileInput.files[0]);
});

async function handleFile(file) {
  try {
    statusEl.textContent = `Reading ${file.name} …`;
    const text = await extractTextFromFile(file);
    statusEl.textContent = 'Extracting sections …';
    const data = parseResumeText(text);
    localStorage.setItem('ppf_resume_data', JSON.stringify(data));
    statusEl.textContent = 'Done — opening editor …';
    window.location.href = 'editor.html';
  } catch (err) {
    statusEl.textContent = err.message || 'Could not read that file.';
  }
}
