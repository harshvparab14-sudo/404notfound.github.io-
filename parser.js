// parser.js — turns an uploaded resume file into a structured JS object.
// Supports .pdf (via pdf.js, loaded globally as pdfjsLib) and .txt.
// This is a heuristic parser, not a perfect one — the editor page lets the user fix any misreads.

const SECTION_HEADERS = {
  education: /^(education|academic background|qualifications)$/i,
  experience: /^(experience|work experience|professional experience|employment)$/i,
  projects: /^(projects|personal projects|academic projects)$/i,
  skills: /^(skills|technical skills|core competencies)$/i,
  achievements: /^(achievements|awards|honou?rs|certifications?)$/i,
  links: /^(links|profiles|contact)$/i
};

export async function extractTextFromFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  if (ext === 'pdf') return extractFromPDF(file);
  if (ext === 'txt') return file.text();
  throw new Error('Please upload a .pdf or .txt resume for this demo parser.');
}

async function extractFromPDF(file) {
  const buf = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data: buf }).promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map((item) => item.str);
    text += strings.join('\n') + '\n';
  }
  return text;
}

function matchHeader(line) {
  const clean = line.trim();
  for (const [key, regex] of Object.entries(SECTION_HEADERS)) {
    if (regex.test(clean)) return key;
  }
  return null;
}

export function parseResumeText(rawText) {
  const lines = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const data = {
    name: '',
    title: '',
    summary: '',
    email: '',
    phone: '',
    education: [],
    experience: [],
    projects: [],
    skills: [],
    achievements: [],
    links: []
  };

  // Contact info heuristics from the top of the file
  const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) data.email = emailMatch[0];
  const phoneMatch = rawText.match(/(\+?\d[\d\s-]{8,14}\d)/);
  if (phoneMatch) data.phone = phoneMatch[0].trim();
  const urlMatches = rawText.match(/(https?:\/\/[^\s,]+)/g);
  if (urlMatches) data.links = [...new Set(urlMatches)].map((u) => ({ label: guessLinkLabel(u), url: u }));

  data.name = lines[0] || 'Your Name';
  data.title = lines[1] && lines[1].length < 60 ? lines[1] : '';

  // Walk lines, bucket into sections
  let currentSection = 'summary';
  let buffer = [];

  function flush(section) {
    const text = buffer.join(' ').trim();
    buffer = [];
    if (!text) return;
    switch (section) {
      case 'summary':
        data.summary += (data.summary ? ' ' : '') + text;
        break;
      case 'education':
        data.education.push({ school: text.slice(0, 80), detail: text });
        break;
      case 'experience':
        data.experience.push({ role: text.slice(0, 80), detail: text });
        break;
      case 'projects':
        data.projects.push({ name: text.slice(0, 80), detail: text });
        break;
      case 'achievements':
        data.achievements.push(text);
        break;
      case 'skills':
        text.split(/,|;|\u2022|\|/).map((s) => s.trim()).filter(Boolean).forEach((s) => data.skills.push(s));
        break;
      default:
        break;
    }
  }

  for (let i = 2; i < lines.length; i++) {
    const line = lines[i];
    const header = matchHeader(line);
    if (header) {
      flush(currentSection);
      currentSection = header;
      continue;
    }
    // Blank-ish separators between entries in experience/education/projects create new items
    if (['education', 'experience', 'projects'].includes(currentSection) && buffer.length && looksLikeNewEntry(line)) {
      flush(currentSection);
    }
    buffer.push(line);
  }
  flush(currentSection);

  data.skills = [...new Set(data.skills)];
  return data;
}

function looksLikeNewEntry(line) {
  // crude signal: line starts with a capitalized word and contains a year, or is short (likely a title line)
  return /\b(19|20)\d{2}\b/.test(line) || (line.length < 60 && /^[A-Z]/.test(line));
}

function guessLinkLabel(url) {
  if (/github/i.test(url)) return 'GitHub';
  if (/linkedin/i.test(url)) return 'LinkedIn';
  if (/leetcode/i.test(url)) return 'LeetCode';
  return 'Link';
}
