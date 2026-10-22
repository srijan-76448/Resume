# Srijan Bhattacharyya — Robotics & Embedded Systems Portfolio

A lightweight, responsive personal portfolio focused on robotics, embedded systems, software, and engineering projects. The site is built with vanilla HTML, CSS, and JavaScript, with profile content separated into JSON files so that most updates do not require editing the UI code.

**Live website:** https://srijan.76448.org  
**GitHub profile:** https://github.com/srijan-76448

---

## Features

- Responsive portfolio layout for desktop and mobile.
- Dark/light theme toggle.
- Content-driven profile, education, skills, projects, memberships, languages, and contact sections.
- Project cards that combine manually curated entries with automatically synchronized pinned GitHub repositories.
- Manual project entries take priority over automatically discovered GitHub entries when they refer to the same project.
- CV generator with a role-relevance assessment, preview, and browser print-to-PDF workflow.
- Contact actions, including preparing an email through the visitor's configured email application.
- Reduced-motion-aware animation behavior.
- Plain HTML, CSS, and JavaScript—no frontend framework or build step required.

> Some features depend on the site's configuration and deployment environment. The CV role assessment is a rule-based aid, not a hiring prediction or a substitute for reviewing the candidate's actual qualifications.

## Technology

- HTML5
- CSS3
- Vanilla JavaScript
- JSON for portfolio and settings data
- GitHub GraphQL API for retrieving pinned repositories
- GitHub Actions for scheduled project-feed updates
- Browser print dialog for exporting the CV to PDF

---

## Project structure

```text
Resume/
├── index.html
├── index.css
├── index.js
├── README.md
├── assets/
│   ├── info.json
│   ├── settings.json
│   ├── github-projects.json
│   └── imgs/
│       ├── logo.webp
│       └── pfp.jpg
├── scripts/
│   └── sync-pinned-projects.mjs
└── .github/
    └── workflows/
        └── sync-pinned-projects.yml
```

The image files shown above are expected asset paths; keep the actual filenames and paths consistent with your configuration.

## Configuration and content

### `assets/info.json`

This file contains the portfolio's editable content. The V2 schema supports fields such as:

- `PROFILE` — name, title, biography, and short description.
- `EDUCATION` — degree, institution, duration, and academic details.
- `SKILLS` — skill categories and their items.
- `PROJECTS` — projects curated by the portfolio owner.
- `MEMBERSHIPS` — organizations and communities.
- `LANGUAGES` — spoken or written languages.
- `CONTACT` — email, phone, location, and social links.

The JavaScript also supports the original V1 JSON shape for backward compatibility. Use the schema already present in your deployed `info.json`; do not mix V1 and V2 structures casually.

### Manually curated projects

Add projects you explicitly want to feature in the `PROJECTS` array in `assets/info.json`. These entries are the source of truth for your custom descriptions and presentation. When a manually curated project duplicates a pinned GitHub repository, the manual entry should be displayed instead of a second copy.

### `assets/settings.json`

Controls supported site settings such as theme, navigation, animations, branding, and data synchronization. If you use the V2 settings schema and want the GitHub feed enabled, ensure the GitHub sync setting is enabled, for example:

```json
{
  "DATA_SYNC": {
    "github": {
      "enabled": true,
      "refreshIntervalMinutes": 60,
      "publicDataOnly": true
    }
  }
}
```

Merge this into the existing settings file rather than replacing unrelated settings.

### `assets/github-projects.json`

This is the generated feed consumed by the portfolio. The synchronization workflow updates it from the GitHub profile's pinned repositories. Avoid manually editing this file because the next successful workflow run can overwrite it.

---

## GitHub pinned-project synchronization

The project feed is updated by the Node.js script at `scripts/sync-pinned-projects.mjs`. The workflow in `.github/workflows/sync-pinned-projects.yml` can be run manually and is configured for scheduled runs.

### One-time setup

1. Push the portfolio files to your GitHub repository.
2. In the repository, open **Settings → Secrets and variables → Actions**.
3. Add a repository secret named `PROFILE_READ_TOKEN` containing a GitHub token suitable for the GraphQL query used by the sync script. Never put this token in `index.js`, `assets/settings.json`, or any browser-delivered file.
4. Confirm that Actions are enabled for the repository.
5. Under **Settings → Actions → General**, allow the workflow to write repository contents if required by the repository's policy. The workflow requests `contents: write` so it can commit the refreshed JSON feed.
6. Open **Actions → Sync pinned GitHub projects** and select **Run workflow**.
7. Check the workflow run and confirm that `assets/github-projects.json` is updated and committed.

The workflow is configured to run every six hours. GitHub may delay scheduled jobs, and schedule availability can be affected by repository activity or platform policies. Manual runs are useful for testing.

### What gets synchronized?

The generated feed includes public repository metadata returned by the script, such as repository name, URL, description, last update time, stars, archived/fork/template flags, and topics when available.

- Pinned repositories are included automatically after a successful sync.
- Manually curated entries remain in control and take precedence over duplicates.
- If a repository is unpinned, it should disappear from the automatic feed on the next successful sync unless it is also manually listed.
- If the workflow fails, the last committed feed remains available.

### Troubleshooting

- **No GitHub projects appear:** Check that the workflow completed successfully, the secret is configured, the generated JSON file was committed, and the deployed site serves `assets/github-projects.json`.
- **The feed is empty:** Confirm that the GitHub account has pinned repositories and inspect the workflow logs for GraphQL errors.
- **Workflow cannot push a commit:** Check the workflow's `contents: write` permission and the repository's Actions permission settings.
- **Projects do not update on the live website:** Verify that your deployment publishes the updated JSON file and that the host/CDN is not serving a stale cached copy.
- **V2 settings disable the feed:** Check `DATA_SYNC.github.enabled` in `assets/settings.json`.

---

## CV generator

The CV generator lets a visitor enter a target role, review the available role-relevance assessment, preview the CV, and use the browser's print dialog to save it as a PDF.

- The assessment is heuristic and depends on the profile data currently supplied.
- A warning means that the portfolio data does not show enough relevant evidence; it does not prove that the person is incapable of doing the job.
- Review the preview before exporting. Browser print settings, fonts, and paper settings can affect the final PDF.
- Keep all qualifications, dates, grades, and experience accurate. The generator should not be treated as permission to invent credentials.

## Local development

No package installation or frontend build is required for the static site.

1. Clone or download the repository.
2. Edit `assets/info.json` and `assets/settings.json` as needed.
3. Serve the repository root with a local static HTTP server. For example, if Python is installed:

   ```bash
   python -m http.server 8000
   ```

4. Open `http://localhost:8000` in your browser.

Using a local HTTP server is recommended because browser security rules can prevent `fetch()` from loading JSON when the HTML file is opened directly using a `file://` URL.

To test the pinned-project synchronization script locally, use a supported Node.js version with `fetch` available (Node.js 18+ is a practical baseline; Node.js 22 is recommended for consistency with the workflow), set the required environment variables, and run:

```bash
GITHUB_PROFILE_USERNAME=srijan-76448 GITHUB_TOKEN=YOUR_TOKEN node scripts/sync-pinned-projects.mjs
```

Do not commit the token or paste it into source files. If the script's environment-variable names differ in your checked-in version, follow the names defined in that script and workflow.

## Accessibility and performance notes

- Prefer semantic HTML and keyboard-operable controls.
- Respect reduced-motion preferences.
- Keep image sizes optimized and provide meaningful alternative text.
- Avoid exposing API tokens or private data to client-side code.
- The portfolio is static-first; any feature that needs secrets or privileged API access belongs in a server-side script or CI workflow, not in browser JavaScript.

## License

No license is specified here. Add a `LICENSE` file and update this section if you want to grant explicit reuse, modification, or redistribution rights.

## Author

**Srijan Bhattacharyya**

- Portfolio: https://srijan.76448.org
- GitHub: https://github.com/srijan-76448
