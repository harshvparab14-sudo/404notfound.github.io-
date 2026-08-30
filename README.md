# Resume → Living Portfolio

Built for **Guru Nanak Khalsa College Inter-Collegiate Hackathon 2026 — Problem Statement 02**
("Escape the PDF Prison").

A static, no-build website: plain HTML/CSS/JS + [Three.js](https://threejs.org/) for the
3D node-globe on the landing page. Everything runs in the browser — no server needed —
which means it hosts for free on **GitHub Pages**.

## What it does

1. **Landing page** (`index.html`) — 3D animated globe hero, drag-and-drop resume upload
   (PDF or TXT), lightweight local "sign-in" so the app can greet the user by name.
2. **Extraction** (`js/parser.js`) — reads the PDF text with `pdf.js` and heuristically
   sorts it into education, experience, projects, skills, achievements and links.
3. **Editor** (`editor.html`) — lets the user fix anything the parser guessed wrong, add
   or remove entries, reorder them, and pick a layout.
4. **Portfolio** (`portfolio.html`) — renders the final portfolio in one of two visual
   layouts (Classic / Orbit), toggle-able without losing data, responsive down to mobile,
   with a "Copy shareable link" button.

## How sharing works (read this before your demo)

GitHub Pages only serves static files — there's no database. So instead of storing each
published portfolio on a server, **the portfolio's data is encoded straight into its own
URL** (as base64 after the `#` in the link). Opening the link decodes the data client-side
and renders the page. This gives you a genuinely unique, working, shareable link per
portfolio with zero backend — which is enough to fully demo every core feature in the
problem statement.

Trade-offs to be upfront about with judges:
- Links are long (they contain the data).
- "Sign-in" on the landing page just stores a name in `localStorage` on that device —
  it's a stand-in for the "secure registration and login" feature, not real auth.
- If you have extra time before judging, the natural upgrade is a free tier of
  **Firebase** or **Supabase**: swap `localStorage`/URL-encoding for real auth + a
  database, and short IDs (`/p/abc123`) instead of data-in-the-link. The current code is
  structured so only `js/share.js` and the login block in `js/app.js` would need to change.

## Project structure

```
index.html          Landing page + globe + upload
editor.html          Review/edit extracted data
portfolio.html        Published portfolio (reads data from the URL)
css/style.css         All styling (design tokens at the top)
js/globe.js           Three.js node-globe animation
js/parser.js          PDF text extraction + heuristic section parsing
js/app.js             Landing page logic (login gate, upload, parse)
js/editor.js          Editor page logic (add/remove/reorder fields)
js/portfolio.js        Portfolio rendering + layout switching + copy link
js/share.js           Encode/decode portfolio data to/from a URL
```

## Hosting on GitHub Pages

1. Create a new repository on GitHub (e.g. `resume-portfolio`), and don't initialize it
   with a README (you already have one).
2. From inside this folder, run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: resume-to-portfolio site"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git push -u origin main
   ```
3. On GitHub, go to your repo → **Settings → Pages**.
4. Under **Build and deployment**, set **Source** to `Deploy from a branch`, branch
   `main`, folder `/ (root)`. Click **Save**.
5. Wait ~1 minute, then refresh — GitHub shows your live URL, typically:
   ```
   https://<your-username>.github.io/<your-repo>/
   ```
6. That's your demo link. `index.html` is picked up automatically as the homepage.

## Running it locally before you push

Because the pages use ES module `import`, opening `index.html` directly via
`file://` will be blocked by the browser. Serve it locally instead:

```bash
# from inside the project folder
python3 -m http.server 8000
# then open http://localhost:8000 in your browser
```

(Or, VS Code's "Live Server" extension works too.)

## Known limitations / good things to say in your presentation

- Parsing is heuristic — it looks for common section headings (Education, Experience,
  Projects, Skills, Achievements, Links). Unusual resume formats may need manual fixes
  in the editor, which is by design part of the flow ("review and edit" is a required
  feature, not just a fallback).
- DOCX upload isn't supported in this build (PDF and TXT are) — mention it as a
  "next up" item if asked.
- The globe is decorative (data density/lines are generated, not tied to real data) —
  it represents "your portfolio going live," matching the brief's "living digital
  presence" framing.
