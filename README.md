# Srijan Bhattacharyya — Robotics & Embedded Systems Portfolio

A lightweight, responsive personal portfolio focused on robotics, embedded systems, software, and engineering projects. The site is built with vanilla HTML, CSS, and JavaScript, with profile content separated into JSON files so that most updates do not require editing the UI code.

**Live website:** https://srijan.76448.org  
**GitHub profile:** https://github.com/srijan-76448

## Features

- Responsive portfolio layout for desktop and mobile.
- Dark/light theme toggle.
- Content-driven profile, education, skills, projects, memberships, languages, and contact sections.
- Manually curated project cards controlled by `assets/info.json`; no automatic GitHub pinned-repository copying or sync workflow.
- CV generator with a role-relevance assessment, preview, and browser print-to-PDF workflow.
- Contact actions, including preparing an email through the visitor's configured email application.
- Reduced-motion-aware animation behavior.
- Plain HTML, CSS, and JavaScript—no frontend framework or build step required.

> The CV role assessment is a rule-based aid, not a hiring prediction or a substitute for reviewing the candidate's actual qualifications.

## Technology

- HTML5, CSS3, and vanilla JavaScript
- JSON for portfolio content and settings
- Browser print dialog for exporting the CV to PDF

## Project structure

```text
Resume/
├── index.html
├── index.css
├── index.js
├── README.md
└── assets/
    ├── info.json
    ├── settings.json
    └── imgs/
        ├── logo.webp
        └── pfp.jpg
```

The image files shown above are expected asset paths; make sure the actual files exist and match the paths in `assets/settings.json`.

## Configuration and content

### `assets/info.json`

This file contains the editable portfolio content. The V2 schema supports:

- `PROFILE` — name, title, biography, and short description.
- `CURRENT_FOCUS` — list of current priorities shown in the profile sidebar.
- `WORKING_PRINCIPLE` — list of engineering principles shown in the profile sidebar.
- `EDUCATION` — degree, institution, duration, and academic details.
- `SKILLS` — skill categories and their items.
- `PROJECTS` — projects curated by you.
- `MEMBERSHIPS` — organizations and communities.
- `LANGUAGES` — spoken or written languages.
- `CONTACT` — email, phone, location, and social links.

The JavaScript also supports the original V1 JSON shape for backward compatibility. Use the schema already present in your deployed `info.json`; do not mix V1 and V2 structures casually.

### Projects

Add, edit, or remove featured projects in the `PROJECTS` array in `assets/info.json`. Each entry can include a project name, description, longer description, technologies, and a URL. The site displays only the projects listed in this file. GitHub remains available as a profile/social link, but the portfolio does not fetch or copy pinned repositories automatically.

### `assets/settings.json`

This file controls supported site settings such as theme, navigation, animations, branding, academic-data configuration, and CV behavior. Edit the existing values you need and preserve unrelated settings.

## Run locally

From the project directory, start a simple static web server:

```bash
python -m http.server 8000
```

Then open <http://localhost:8000> in your browser. Serving the files over HTTP is recommended because browsers may block `fetch()` when the page is opened directly using a `file://` URL.

## Deployment

Upload the site files to your static hosting provider, preserving the `assets/` directory structure. No Node.js runtime, GitHub Actions workflow, personal access token, or build step is required for the portfolio itself.

## Maintenance notes

- Keep personal content in `assets/info.json` and site behavior/settings in `assets/settings.json` where possible.
- Check image paths after deployment.
- Test navigation, theme switching, contact links, project dialogs, and CV printing after making changes.
- Do not put private API keys or credentials in browser-delivered files.

## Author

- Portfolio: <https://srijan.76448.org>
- GitHub: <https://github.com/srijan-76448>
