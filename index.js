(() => {
  "use strict";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [
    ...root.querySelectorAll(selector),
  ];
  const escapeHTML = (value) =>
    String(value ?? "").replace(
      /[&<>"']/g,
      (ch) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[ch],
    );
  const safeUrl = (value) => {
    try {
      const u = new URL(value, location.href);
      return ["http:", "https:", "mailto:"].includes(u.protocol) ? u.href : "";
    } catch {
      return "";
    }
  };
  let info = null,
    settings = null,
    projects = [],
    education = [],
    experience = [],
    achievements = [],
    skills = {},
    memberships = [],
    languages = [],
    contact = {};
  const STORAGE_THEME = "portfolio-theme-v2";
  function announce(message) {
    const status = $("#app-status");
    if (status) status.textContent = message;
  }
  async function fetchJSON(path) {
    const response = await fetch(path, { cache: "no-cache" });
    if (!response.ok)
      throw new Error(`Unable to load ${path} (${response.status})`);
    return response.json();
  }
  function normalizeData(rawInfo, rawSettings) {
    // Supports the V2 schema and the original V1 JSON so existing content remains usable.
    const v2 = Boolean(
      rawInfo.PROFILE || rawInfo.EDUCATION || rawInfo.PROJECTS,
    );
    const oldUser = rawInfo["user-info"] || {};
    const profile = v2
      ? rawInfo.PROFILE || {}
      : {
          name: oldUser["user-name"],
          title: oldUser["user-details"],
          "about-me": oldUser["about-me"],
          "short-description": oldUser["user-short-description"],
          "profile-image": oldUser["profile-pic"],
        };
    projects = v2 ? rawInfo.PROJECTS || [] : rawInfo.projects || [];
    projects = projects.map((p) => ({
      ...p,
      url: p.url || p.link || "",
      description: p.description || p.descripton || "",
      image: p.image || "",
    }));
    education = v2 ? rawInfo.EDUCATION || [] : [];
    experience =
      v2 && Array.isArray(rawInfo.EXPERIENCE) ? rawInfo.EXPERIENCE : [];
    achievements =
      v2 && Array.isArray(rawInfo.ACHIEVEMENTS) ? rawInfo.ACHIEVEMENTS : [];
    skills = v2 ? rawInfo.SKILLS || {} : rawInfo.skills || {};
    memberships = v2 ? rawInfo.MEMBERSHIPS || [] : [];
    languages = v2 ? rawInfo.LANGUAGES || [] : [];
    contact = v2 ? rawInfo.CONTACT || {} : rawInfo.contact || {};
    if (!v2 && contact.socials) {
      contact = {
        ...contact,
        email: contact.socials.email?.url,
        socials: Object.fromEntries(
          Object.entries(contact.socials)
            .filter(([k]) => k !== "email")
            .map(([k, v]) => [k, { url: v.url, icon: k }]),
        ),
      };
      contact.message = contact["contact-text"] || "";
    }
    return { profile, rawInfo, v2, rawSettings };
  }
  function applyTheme() {
    const saved = localStorage.getItem(STORAGE_THEME);
    const configured = settings?.THEME?.mode || "dark";
    const theme = saved || configured;
    document.documentElement.dataset.theme =
      theme === "light" ? "light" : "dark";
    const button = $("#theme-toggle");
    if (button) {
      button.setAttribute(
        "aria-label",
        theme === "light" ? "Switch to dark theme" : "Switch to light theme",
      );
      button.textContent = theme === "light" ? "☼" : "◐";
    }
  }
  function setupTheme() {
    applyTheme();
    $("#theme-toggle")?.addEventListener("click", () => {
      const next =
        document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      localStorage.setItem(STORAGE_THEME, next);
      applyTheme();
    });
  }
  function setupNavigation() {
    const toggle = $("#nav-toggle"),
      nav = $("#site-nav");
    toggle?.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    $$("#site-nav a").forEach((link) =>
      link.addEventListener("click", () => {
        nav.classList.remove("open");
        toggle?.setAttribute("aria-expanded", "false");
      }),
    );
  }
  function hideLoadingScreen() {
    const screen = $("#loadingScreen");
    if (screen) {
      screen.classList.add("hidden");
      window.setTimeout(() => screen.remove(), 550);
    }
  }
  function renderProfile(profile) {
    const name = profile.name || "Portfolio";
    document.title = `${name}${settings?.BRANDING?.pageTitleSuffix || " | Robotics & Embedded Systems"}`;
    const icon = settings?.BRANDING?.logo || settings?.icon;
    if (icon) $("#web-icon").href = icon;
    const authoredShort = (
      profile["short-description"] ||
      profile["user-short-description"] ||
      ""
    ).trim();
    // Only use an authored short description when it is genuinely distinct from the long bio.
    const about = String(profile["about-me"] || "").trim();
    const shortDescription =
      authoredShort && authoredShort.toLowerCase() !== about.toLowerCase()
        ? authoredShort
        : buildShortDescription(profile);
    $("#user-short-description").textContent = shortDescription;
    $("#about-description").textContent =
      profile["about-me"] || "Profile details will be available soon.";
    const focus = Array.isArray(info?.CURRENT_FOCUS) ? info.CURRENT_FOCUS : [];
    const principle = Array.isArray(info?.WORKING_PRINCIPLE)
      ? info.WORKING_PRINCIPLE
      : [];
    $("#current-focus").textContent = focus.join("\n");
    $("#working-principle").textContent = principle.join("\n");
    $("#footer-name").textContent = name;
    $("#current-year").textContent = new Date().getFullYear();
  }
  function buildShortDescription(profile) {
    const name = String(profile.name || "").trim();
    const title = String(profile.title || "engineering professional").trim();
    const skillNames = Object.values(skills)
      .flat()
      .map(String)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 5);
    const projectNames = projects
      .map((p) => String(p.name || "").trim())
      .filter(Boolean)
      .slice(0, 2);
    const field = education
      .map((e) =>
        [e.degree, e["field-of-study"] || e.stream]
          .filter(Boolean)
          .join(" in "),
      )
      .filter(Boolean)[0];
    const opening = name
      ? `${name} is a ${title.toLowerCase()} interested in building practical, reliable systems.`
      : `A ${title.toLowerCase()} interested in building practical, reliable systems.`;
    const parts = [opening];
    if (field) parts.push(`Academic background: ${field}.`);
    if (skillNames.length)
      parts.push(`Technical toolkit includes ${skillNames.join(", ")}.`);
    if (projectNames.length)
      parts.push(`Selected projects include ${projectNames.join(" and ")}.`);
    parts.push(
      "Prefers open, maintainable engineering and hands-on problem solving.",
    );
    let result = parts.join(" ").replace(/\s+/g, " ").trim();
    const words = result.split(/\s+/);
    if (words.length > 60)
      result =
        words
          .slice(0, 60)
          .join(" ")
          .replace(/[,:;—-]+$/, "") + ".";
    return result;
  }

  function renderEducation() {
    const host = $("#education-list");
    host.replaceChildren();
    if (!education.length) {
      host.innerHTML =
        '<p class="muted">Education details are not configured in info.json yet.</p>';
      return;
    }
    education.forEach((item) => {
      const duration = item.duration;
      const date =
        typeof duration === "string"
          ? duration
          : [duration?.start, duration?.end].filter(Boolean).join(" — ");
      const card = document.createElement("article");
      card.className = "education-card";
      const left = document.createElement("div"),
        right = document.createElement("div");
      const degree = document.createElement("h3");
      degree.textContent =
        [item.degree, item["field-of-study"] || item.stream]
          .filter(Boolean)
          .join(" · ") || "Education";
      const school = document.createElement("p");
      school.textContent = [item.college, item.university]
        .filter(Boolean)
        .join(" · ");
      left.append(degree, school);
      const dates = document.createElement("div");
      dates.className = "education-date";
      dates.textContent = date || "";
      right.append(dates);
      // Public portfolio rule: show CGPA only when the numeric value is strictly above 6.5.
      const cgpaValue = Number.parseFloat(String(item.cgpa ?? "").trim());
      if (
        String(item.cgpa ?? "").trim() !== "" &&
        Number.isFinite(cgpaValue) &&
        cgpaValue > 6.5
      ) {
        const score = document.createElement("p");
        score.className = "education-cgpa";
        score.textContent = `CGPA: ${cgpaValue}`;
        right.append(score);
      }
      card.append(left, right);
      host.append(card);
    });
  }
  function renderExperience() {
    const host = $("#experience-list");
    host.replaceChildren();
    experience.forEach((item) => {
      const card = document.createElement("article");
      card.className = "education-card";
      const left = document.createElement("div"),
        right = document.createElement("div");
      const title = document.createElement("h3");
      title.textContent =
        [item.position, item.company].filter(Boolean).join(" · ") ||
        "Experience";
      left.append(title);
      if (item.description) {
        const description = document.createElement("p");
        description.textContent = item.description;
        left.append(description);
      }
      const duration = item.duration;
      const dates = document.createElement("div");
      dates.className = "education-date";
      dates.textContent =
        typeof duration === "string"
          ? duration
          : [
              duration?.start,
              duration?.end || (duration?.start ? "Present" : ""),
            ]
              .filter(Boolean)
              .join(" — ");
      right.append(dates);
      card.append(left, right);
      host.append(card);
    });
    if (!experience.length)
      host.innerHTML =
        '<p class="muted">No professional experience has been added yet.</p>';
  }
  function renderAchievements() {
    const host = $("#achievements-list");
    host.replaceChildren();
    achievements.forEach((item) => {
      const entry = typeof item === "string" ? { title: item } : item;
      const card = document.createElement("article");
      card.className = "education-card";
      const left = document.createElement("div"),
        right = document.createElement("div");
      const title = document.createElement("h3");
      title.textContent =
        entry.title || entry.name || entry.achievement || "Achievement";
      left.append(title);
      const details = [entry.organization, entry.category]
        .filter(Boolean)
        .join(" · ");
      if (details) {
        const meta = document.createElement("p");
        meta.textContent = details;
        left.append(meta);
      }
      if (entry.description) {
        const description = document.createElement("p");
        description.textContent = entry.description;
        left.append(description);
      }
      const date = document.createElement("div");
      date.className = "education-date";
      date.textContent = entry.date || entry.year || "";
      right.append(date);
      card.append(left, right);
      host.append(card);
    });
    if (!achievements.length)
      host.innerHTML =
        '<p class="muted">No achievements have been added yet.</p>';
  }
  function updateOptionalSections() {
    // Empty optional sections should not occupy space or appear in the navigation.
    const optional = [
      { id: "experience", hasItems: experience.length > 0 },
      { id: "achievements", hasItems: achievements.length > 0 },
    ];
    optional.forEach(({ id, hasItems }) => {
      const section = document.getElementById(id);
      const navLink = document.querySelector(`#site-nav a[href="#${id}"]`);
      if (section) section.hidden = !hasItems;
      if (navLink) navLink.hidden = !hasItems;
    });
  }
  async function syncAcademicData() {
    const config = settings?.ACADEMIC_DATA;
    if (
      !config?.spreadsheetId ||
      config.provider !== "googleSheetsPublishedCsv"
    )
      return;
    const field = config.fields?.BTech;
    if (!field?.sheet || !field?.cell || !education[0]) return;
    const cacheKey = `academic-cache:${config.spreadsheetId}:${field.sheet}:${field.cell}`;
    const cached = (() => {
      try {
        return JSON.parse(localStorage.getItem(cacheKey) || "null");
      } catch {
        return null;
      }
    })();
    if (cached && cached.value !== undefined && cached.value !== null)
      education[0].cgpa = cached.value;
    const status = $("#academic-status");
    // Public sheet must be published to CSV. The cell coordinate is mapped to a CSV row/column.
    const cellToIndex = (cell) => {
      const m = /^([A-Z]+)(\d+)$/i.exec(cell || "");
      if (!m) return null;
      let col = 0;
      for (const c of m[1].toUpperCase()) col = col * 26 + c.charCodeAt(0) - 64;
      return { row: Number(m[2]) - 1, col: col - 1 };
    };
    const index = cellToIndex(field.cell);
    if (!index) {
      if (status)
        status.textContent =
          "Academic data mapping needs a valid spreadsheet cell.";
      return;
    }
    const gid = field.gid ?? config.gid;
    const url =
      gid !== undefined
        ? `https://docs.google.com/spreadsheets/d/${encodeURIComponent(config.spreadsheetId)}/export?format=csv&gid=${encodeURIComponent(gid)}`
        : `https://docs.google.com/spreadsheets/d/${encodeURIComponent(config.spreadsheetId)}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(field.sheet)}`;
    try {
      const response = await fetch(url, { mode: "cors", cache: "no-store" });
      if (!response.ok) throw new Error("Sheet is not publicly readable");
      const csv = await response.text();
      if (/<!doctype html|<html/i.test(csv))
        throw new Error("Google Sheets returned a page instead of CSV data");
      const rows = parseCSV(csv),
        value = rows[index.row]?.[index.col];
      const number = Number(
        String(value ?? "")
          .replace(/,/g, "")
          .trim(),
      );
      if (
        value === undefined ||
        String(value).trim() === "" ||
        !Number.isFinite(number)
      )
        throw new Error("Configured cell has no numeric value");
      education[0].cgpa = Number(
        number.toFixed(Number(field.displayPrecision ?? 2)),
      );
      localStorage.setItem(
        cacheKey,
        JSON.stringify({ value: education[0].cgpa, updatedAt: Date.now() }),
      );
      if (status)
        status.textContent = `Academic data synced from Google Sheets · ${new Date().toLocaleString()}`;
    } catch (error) {
      if (status)
        status.textContent = cached
          ? "Showing the last cached academic value; live sync was unavailable."
          : "Live CGPA sync is not available. Check that the sheet is publicly published and the tab/cell mapping is correct.";
      console.info("Academic data sync skipped:", error.message);
    }
    renderEducation();
  }
  function parseCSV(text) {
    const rows = [];
    let row = [],
      value = "",
      quoted = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (quoted) {
        if (c === '"' && text[i + 1] === '"') {
          value += '"';
          i++;
        } else if (c === '"') quoted = false;
        else value += c;
      } else if (c === '"') quoted = true;
      else if (c === ",") {
        row.push(value);
        value = "";
      } else if (c === "\n") {
        row.push(value.replace(/\r$/, ""));
        rows.push(row);
        row = [];
        value = "";
      } else value += c;
    }
    if (value.length || row.length) {
      row.push(value.replace(/\r$/, ""));
      rows.push(row);
    }
    return rows;
  }
  function renderSkills() {
    const host = $("#skills-list");
    host.replaceChildren();
    Object.entries(skills).forEach(([category, items]) => {
      const card = document.createElement("article");
      card.className = "skill-card";
      const title = document.createElement("h3");
      title.textContent = category;
      const list = document.createElement("div");
      list.className = "skill-list";
      (Array.isArray(items) ? items : []).forEach((item) => {
        const chip = document.createElement("span");
        chip.className = "skill-chip";
        chip.textContent = item;
        list.append(chip);
      });
      card.append(title, list);
      host.append(card);
    });
  }
  function renderProjects() {
    const host = $("#projects-list");
    host.replaceChildren();
    projects.forEach((project, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "project-card";
      button.setAttribute(
        "aria-label",
        `View details for ${project.name || "project"}`,
      );
      const art = document.createElement("div");
      art.className = "project-art";
      const number = document.createElement("span");
      number.textContent = `PROJECT / ${String(index + 1).padStart(2, "0")}`;
      const symbol = document.createElement("span");
      symbol.className = "project-symbol";
      symbol.textContent = ["⌘", "⌁", "⌬", "⟡"][index % 4];
      art.append(number, symbol);
      const body = document.createElement("div");
      body.className = "project-body";
      const title = document.createElement("strong");
      title.className = "project-title";
      title.textContent = project.name || "Untitled project";
      const description = document.createElement("p");
      description.className = "project-description";
      description.textContent = project.description || "";
      body.append(title, description);
      const footer = document.createElement("div");
      footer.className = "project-footer";
      const kind = document.createElement("span");
      kind.textContent =
        (project.technologies || []).slice(0, 3).join(" / ") || "ENGINEERING";
      const more = document.createElement("span");
      more.textContent = "VIEW DETAILS ↗";
      footer.append(kind, more);
      button.append(art, body, footer);
      button.addEventListener("click", () => openProject(project, index));
      host.append(button);
    });
    if (!projects.length)
      host.innerHTML =
        '<p class="muted">Projects will appear here when added to info.json.</p>';
  }
  function openProject(project, index) {
    const dialog = $("#project-dialog"),
      host = $("#project-dialog-content");
    host.replaceChildren();
    const label = document.createElement("p");
    label.className = "dialog-project-number";
    label.textContent = `PROJECT / ${String(index + 1).padStart(2, "0")}`;
    const title = document.createElement("h2");
    title.textContent = project.name || "Project";
    const description = document.createElement("p");
    description.className = "dialog-project-description";
    description.textContent =
      project["long-description"] ||
      project.description ||
      "No description available.";
    host.append(label, title, description);
    const tech = project.technologies || [];
    if (tech.length) {
      const p = document.createElement("p");
      p.className = "muted";
      p.textContent = `TECHNOLOGIES · ${tech.join(" · ")}`;
      host.append(p);
    }
    const url = safeUrl(project.url);
    if (url) {
      const link = document.createElement("a");
      link.className = "dialog-project-link";
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Open project ↗";
      host.append(link);
    }
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }
  function renderCommunity() {
    const list = $("#memberships-list");
    list.replaceChildren();
    memberships.forEach((item) => {
      const li = document.createElement("li");
      li.textContent =
        typeof item === "string"
          ? item
          : [item.name, item.organization].filter(Boolean).join(" · ");
      list.append(li);
    });
    const languageHost = $("#languages-list");
    languageHost.replaceChildren();
    languages.forEach((item) => {
      const span = document.createElement("span");
      span.textContent = item;
      languageHost.append(span);
    });
    if (!memberships.length)
      list.innerHTML =
        "<li>Add community memberships in info.json to show them here.</li>";
    if (!languages.length)
      languageHost.innerHTML = "<span>Languages not configured</span>";
  }
  function normalizeEmail(value) {
    return String(value || "")
      .trim()
      .replace(/^mailto:/i, "")
      .split(/[?;]/, 1)[0];
  }
  function renderContact() {
    const email = normalizeEmail(
      contact.email || contact.socials?.email?.url || "",
    );
    $("#contact-description").textContent =
      contact.message ||
      contact["contact-text"] ||
      "Reach out for engineering conversations, open-source collaboration, and robotics projects.";
    const emailHost = $("#email-address");
    emailHost.replaceChildren();
    if (email) {
      const a = document.createElement("a");
      a.href = `mailto:${email}`;
      a.textContent = email;
      a.className = "email-address";
      emailHost.append(a);
    }
    const host = $("#social-links");
    host.replaceChildren();
    Object.entries(contact.socials || {}).forEach(([name, item]) => {
      const url = safeUrl(typeof item === "string" ? item : item.url);
      if (!url) return;
      const a = document.createElement("a");
      a.className = "social-link";
      a.href = url;
      a.target = url.startsWith("mailto:") ? "" : "_blank";
      a.rel = "noopener noreferrer";
      a.textContent =
        name === "x" ? "X" : name.charAt(0).toUpperCase() + name.slice(1);
      host.append(a);
    });
    $("#contact-form").addEventListener("submit", (event) => {
      event.preventDefault();
      if (!email) {
        announce("Contact email is not configured in assets/info.json.");
        return;
      }
      const name = $("#name").value.trim(),
        sender = $("#email").value.trim(),
        message = $("#message").value.trim();
      const subject = encodeURIComponent(`Portfolio enquiry from ${name}`);
      const body = encodeURIComponent(
        `Name: ${name}\nReply email: ${sender}\n\n${message}`,
      );
      const mailto = `mailto:${email}?subject=${subject}&body=${body}`;
      announce("Opening your email application…");
      // Navigate directly from the user gesture; synthetic clicks on hidden anchors are blocked by some browsers.
      window.location.href = mailto;
    });
  }
  function assessRole(role) {
    const searchable = [
      ...Object.keys(skills),
      ...Object.values(skills).flat(),
      ...projects.map(
        (p) =>
          `${p.name || ""} ${p.description || ""} ${(p.technologies || []).join(" ")}`,
      ),
      ...education.map(
        (e) =>
          `${e.degree || ""} ${e["field-of-study"] || ""} ${e.stream || ""}`,
      ),
      ...experience.map(
        (e) => `${e.position || ""} ${e.company || ""} ${e.description || ""}`,
      ),
      ...achievements.map((a) =>
        typeof a === "string"
          ? a
          : `${a.title || a.name || a.achievement || ""} ${a.organization || ""} ${a.description || ""}`,
      ),
      ...memberships.map((m) =>
        typeof m === "string" ? m : `${m.name || ""} ${m.organization || ""}`,
      ),
    ]
      .join(" ")
      .toLowerCase();
    const normalizedRole = role.toLowerCase().trim();
    const roleWords = normalizedRole
      .split(/[^a-z0-9+#.]+/)
      .filter(
        (w) =>
          w.length > 2 &&
          ![
            "engineer",
            "engineering",
            "developer",
            "development",
            "junior",
            "senior",
            "associate",
            "intern",
            "the",
            "and",
            "for",
            "with",
            "role",
            "job",
            "teacher",
          ].includes(w),
      );
    const matched = roleWords.filter((w) => searchable.includes(w));
    const roleFamilies = {
      engineering: [
        "embedded",
        "firmware",
        "robotics",
        "microcontroller",
        "electronics",
        "pcb",
        "linux",
        "python",
        "c++",
        "computer vision",
        "opencv",
        "iot",
        "frontend",
        "backend",
        "machine learning",
        "software",
        "hardware",
        "control",
        "autonomous",
        "systems",
        "developer",
        "programmer",
      ],
      teaching: [
        "teacher",
        "teaching",
        "education",
        "instructor",
        "tutor",
        "curriculum",
        "classroom",
        "pedagogy",
      ],
      history: [
        "history",
        "historian",
        "historical",
        "archives",
        "archival",
        "social studies",
      ],
    };
    const roleTerms = Object.values(roleFamilies)
      .flat()
      .filter((term) => normalizedRole.includes(term));
    const profileSkills = Object.values(skills)
      .flat()
      .map((s) => String(s).toLowerCase());
    const mapped = roleTerms.filter(
      (term) =>
        profileSkills.some(
          (skill) => skill.includes(term) || term.includes(skill),
        ) ||
        projects.some((p) =>
          `${p.name || ""} ${p.description || ""} ${(p.technologies || []).join(" ")}`
            .toLowerCase()
            .includes(term),
        ),
    );
    const isTeachingRole =
      /\b(teacher|teaching|educator|instructor|tutor)\b/.test(normalizedRole);
    const isHistoryRole =
      /\b(history|historian|historical|social studies|archivist)\b/.test(
        normalizedRole,
      );
    const hasTeachingEvidence =
      /teaching|education|instructor|tutor|pedagog|curriculum|classroom/.test(
        searchable,
      );
    const hasHistoryEvidence =
      /history|historian|historical|archive|social studies/.test(searchable);
    const clearlyNonmatching =
      (isTeachingRole && !hasTeachingEvidence) ||
      (isHistoryRole && !hasHistoryEvidence);
    let level = "poor",
      headline = "Limited documented overlap";
    if (
      !clearlyNonmatching &&
      roleTerms.length &&
      mapped.length / roleTerms.length >= 0.5
    ) {
      level = "good";
      headline = "Good apparent match";
    } else if (
      !clearlyNonmatching &&
      (matched.length >= 1 || mapped.length >= 1)
    ) {
      level = "partial";
      headline = "Partial documented match";
    }
    const notes = [];
    if (
      clearlyNonmatching ||
      (roleTerms.length === 0 && matched.length === 0)
    ) {
      notes.push(
        `The profile does not currently document clear evidence for “${role}”. Consider adding relevant, truthful experience or qualifications before using this CV for that role.`,
      );
    }
    if (roleTerms.length) {
      const gaps = roleTerms.filter((t) => !mapped.includes(t));
      if (gaps.length)
        notes.push(
          `Not clearly documented in the profile: ${gaps.join(", ")}.`,
        );
    } else if (!clearlyNonmatching)
      notes.push(
        "This role title uses terms the keyword assessor does not fully recognize; review the profile manually.",
      );
    notes.push(
      "This is a simple evidence/keyword check, not a hiring prediction. Missing information means undocumented, not necessarily absent. You can still preview the CV.",
    );
    return { level, headline, notes };
  }
  function renderCV(role) {
    const assessment = assessRole(role),
      box = $("#cv-assessment");
    box.hidden = false;
    box.dataset.level = assessment.level;
    box.replaceChildren();
    const heading = document.createElement("strong");
    heading.textContent = assessment.headline;
    box.append(heading);
    const ul = document.createElement("ul");
    assessment.notes.forEach((note) => {
      const li = document.createElement("li");
      li.textContent = note;
      ul.append(li);
    });
    box.append(ul);
    const profile = currentProfile;
    const name = profile.name || "Candidate",
      title = profile.title || "Embedded Systems Engineer";
    const email = normalizeEmail(
        contact.email || contact.socials?.email?.url || "",
      ),
      socials = Object.entries(contact.socials || {})
        .filter(([k]) => k !== "email")
        .map(([k, v]) => `${k}: ${typeof v === "string" ? v : v.url || ""}`)
        .filter((x) => !x.endsWith(": "));
    const about = buildShortDescription(profile);
    const skillSections = Object.entries(skills);
    // CV intentionally omits all academic scores (CGPA, marks, percentages, and grades).
    const educationHTML = education
      .map(
        (e) =>
          `<h4>${escapeHTML([e.degree, e["field-of-study"] || e.stream].filter(Boolean).join(" · "))}</h4><p class="cv-muted">${escapeHTML([e.college, e.university].filter(Boolean).join(" · "))} · ${escapeHTML(typeof e.duration === "string" ? e.duration : [e.duration?.start, e.duration?.end].filter(Boolean).join(" — "))}</p>`,
      )
      .join("");
    const experienceHTML = experience
      .map(
        (e) =>
          `<h4>${escapeHTML([e.position, e.company].filter(Boolean).join(" · "))}</h4><p class="cv-muted">${escapeHTML(typeof e.duration === "string" ? e.duration : [e.duration?.start, e.duration?.end || (e.duration?.start ? "Present" : "")].filter(Boolean).join(" — "))}</p>${e.description ? `<p>${escapeHTML(e.description)}</p>` : ""}`,
      )
      .join("");
    const achievementsHTML = achievements
      .map((a) => {
        const e = typeof a === "string" ? { title: a } : a;
        return `<h4>${escapeHTML(e.title || e.name || e.achievement || "Achievement")}</h4><p>${escapeHTML([e.organization, e.date || e.year, e.description].filter(Boolean).join(" · "))}</p>`;
      })
      .join("");
    const projectHTML = projects
      .map(
        (p) =>
          `<h4>${escapeHTML(p.name)}</h4><p>${escapeHTML(p.description || "")}</p>`,
      )
      .join("");
    const skillsHTML = skillSections
      .map(
        ([category, items]) =>
          `<h4>${escapeHTML(category)}</h4><p>${escapeHTML((Array.isArray(items) ? items : []).join(" · "))}</p>`,
      )
      .join("");
    const memberHTML = memberships
      .map((m) =>
        escapeHTML(
          typeof m === "string"
            ? m
            : [m.name, m.organization].filter(Boolean).join(" · "),
        ),
      )
      .join("<br>");
    const cv = `<article class="cv-sheet"><header class="cv-header"><h2>${escapeHTML(name)}</h2><p>${escapeHTML(role)} · ${escapeHTML(title)}</p><p>${escapeHTML([email, contact.phone, contact.location].filter(Boolean).join(" | "))}</p><p>${escapeHTML(socials.join(" | "))}</p></header><div class="cv-columns"><aside><h3>Skills</h3>${skillsHTML}<h3>Community</h3><p>${memberHTML || "Not listed"}</p><h3>Languages</h3><p>${escapeHTML(languages.join(" · "))}</p></aside><div><h3>Professional Summary</h3><p>${escapeHTML(about)}</p><h3>Education</h3>${educationHTML || "<p>Education not configured.</p>"}${experienceHTML ? `<h3>Experience</h3>${experienceHTML}` : ""}${achievementsHTML ? `<h3>Achievements</h3>${achievementsHTML}` : ""}<h3>Projects</h3>${projectHTML || "<p>Projects not configured.</p>"}</div></div></article>`;
    $("#cv-preview").innerHTML = cv;
    $("#cv-preview").hidden = false;
    $("#print-cv").disabled = false;
    $("#close-cv").hidden = false;
    announce("CV preview generated.");
  }
  let currentProfile = {};
  function setupCV() {
    $("#generate-cv").addEventListener("click", () => {
      const role = $("#cv-role").value.trim();
      if (!role) {
        $("#cv-role").focus();
        $("#cv-assessment").hidden = false;
        $("#cv-assessment").textContent = "Enter a target job role first.";
        return;
      }
      renderCV(role);
    });
    $("#cv-role").addEventListener("keydown", (event) => {
      if (event.key === "Enter") $("#generate-cv").click();
    });
    $("#print-cv").addEventListener("click", () => window.print());
    $("#close-cv").addEventListener("click", () => {
      $("#cv-preview").hidden = true;
      $("#cv-assessment").hidden = true;
      $("#print-cv").disabled = true;
      $("#close-cv").hidden = true;
    });
  }
  function startParticles() {
    const canvas = $("#particleAccelerator"),
      ctx = canvas?.getContext("2d");
    if (
      !canvas ||
      !ctx ||
      settings?.ANIMATIONS?.enabled === false ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const count = Math.min(55, settings?.PARTICLES?.count || 35),
      particles = [];
    let width = 0,
      height = 0,
      frame = 0;
    const resize = () => {
      width = canvas.width = innerWidth * devicePixelRatio;
      height = canvas.height = innerHeight * devicePixelRatio;
      canvas.style.width = innerWidth + "px";
      canvas.style.height = innerHeight + "px";
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    };
    resize();
    for (let i = 0; i < count; i++)
      particles.push({
        x: Math.random() * innerWidth,
        y: Math.random() * innerHeight,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
      });
    const draw = () => {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > innerWidth) p.vx *= -1;
        if (p.y < 0 || p.y > innerHeight) p.vy *= -1;
        ctx.fillStyle = "rgba(54,214,208,.65)";
        ctx.fillRect(p.x, p.y, 2, 2);
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j],
            dx = p.x - q.x,
            dy = p.y - q.y,
            d = Math.hypot(dx, dy);
          if (d < 105) {
            ctx.strokeStyle = `rgba(54,214,208,${(1 - d / 105) * 0.12})`;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }
      frame = requestAnimationFrame(draw);
    };
    const onResize = () => resize();
    addEventListener("resize", onResize);
    draw();
  }
  async function main() {
    setupTheme();
    setupNavigation();
    setupCV();
    try {
      const [rawInfo, rawSettings] = await Promise.all([
        fetchJSON("assets/info.json"),
        fetchJSON("assets/settings.json"),
      ]);
      info = rawInfo;
      settings = rawSettings;
      const normalized = normalizeData(rawInfo, rawSettings);
      currentProfile = normalized.profile;
      renderProfile(currentProfile);
      renderEducation();
      renderExperience();
      renderAchievements();
      updateOptionalSections();
      renderSkills();
      renderProjects();
      renderCommunity();
      renderContact();
      startParticles();
      await syncAcademicData();
    } catch (error) {
      console.error("Portfolio initialization failed:", error);
      $("#user-short-description").textContent =
        "Portfolio data could not be loaded. Serve this site over HTTP and check assets/info.json and assets/settings.json.";
      announce("Portfolio data failed to load.");
    } finally {
      window.setTimeout(
        hideLoadingScreen,
        settings?.LOADING_SCREEN?.durationMs || 500,
      );
    }
  }
  $("#project-dialog-close").addEventListener("click", () =>
    $("#project-dialog").close(),
  );
  $("#project-dialog").addEventListener("click", (event) => {
    if (event.target === $("#project-dialog")) $("#project-dialog").close();
  });
  document.addEventListener("DOMContentLoaded", main);
})();
