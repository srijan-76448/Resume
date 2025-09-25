// --- Fetch JSON Helper ---
async function fetchJSON(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}`);
  }
  return response.json();
}

// --- Render Webpage Icon ---
function renderWebpageIcon(iconPath) {
  const webIcon = document.getElementById("web-icon");
  webIcon.href = iconPath;
}

// --- Show Loading Screen ---
async function loadingScreen() {
  let cssLink = null;
  let jsScript = null;
  try {
    const settings = await fetch("assets/settings.json").then((response) =>
      response.json()
    );
    const loadingScreenType = settings["loading-screen-type"];
    const loadingTimeLimit = settings["loadingTime"];
    const loadingScreenDir = `./loading-screens/${loadingScreenType}/`;
    const cssPath = `${loadingScreenDir}ls.css`;
    const jsPath = `${loadingScreenDir}ls.js`;

    const loadingScreenElement = document.getElementById("loadingScreen");
    loadingScreenElement.classList.remove("hidden");

    cssLink = document.createElement("link");
    cssLink.rel = "stylesheet";
    cssLink.href = cssPath;
    document.head.appendChild(cssLink);

    jsScript = document.createElement("script");
    jsScript.src = jsPath;
    document.body.appendChild(jsScript);

    await new Promise((resolve, reject) => {
      jsScript.onload = resolve;
      jsScript.onerror = reject;
    });

    setTimeout(() => {
      loadingScreenElement.classList.add("hidden");
      loadingScreenElement.innerHTML = "";
      if (cssLink) cssLink.remove();
      if (jsScript) jsScript.remove();
    }, loadingTimeLimit);
  } catch (error) {
    console.error("Failed to handle loading screen:", error);
    const loadingScreenElement = document.getElementById("loadingScreen");
    if (loadingScreenElement) {
      loadingScreenElement.classList.add("hidden");
    }
    if (cssLink) cssLink.remove();
    if (jsScript) jsScript.remove();
  }
}

// --- Particle Accelerator Effect ---
class ParticleAccelerator {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.particles = [];
    this.mouse = { x: 0, y: 0 };
    this.particleCount = 100;

    this.resize();
    this.init();
    this.animate();

    // Event listeners
    window.addEventListener("resize", () => this.resize());
    canvas.addEventListener("mousemove", (e) => this.handleMouseMove(e));
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  init() {
    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.3,
        color: this.getRandomColor(),
      });
    }
  }

  getRandomColor() {
    const colors = ["#00ffff", "#8a2be2", "#39ff14", "#0099ff"];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = e.clientX - rect.left;
    this.mouse.y = e.clientY - rect.top;
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles.forEach((particle, index) => {
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Mouse interaction
      const dx = this.mouse.x - particle.x;
      const dy = this.mouse.y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 100) {
        const force = (100 - distance) / 100;
        particle.vx += (dx / distance) * force * 0.01;
        particle.vy += (dy / distance) * force * 0.01;
      }

      // Boundary check
      if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;

      // Keep particles in bounds
      particle.x = Math.max(0, Math.min(this.canvas.width, particle.x));
      particle.y = Math.max(0, Math.min(this.canvas.height, particle.y));

      // Draw particle
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fillStyle =
        particle.color +
        Math.floor(particle.opacity * 255)
          .toString(16)
          .padStart(2, "0");
      this.ctx.fill();

      // Draw connections
      this.particles.forEach((otherParticle, otherIndex) => {
        if (index !== otherIndex) {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            this.ctx.beginPath();
            this.ctx.moveTo(particle.x, particle.y);
            this.ctx.lineTo(otherParticle.x, otherParticle.y);
            this.ctx.strokeStyle = `rgba(0, 255, 255, ${
              ((100 - distance) / 100) * 0.2
            })`;
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
          }
        }
      });
    });

    requestAnimationFrame(() => this.animate());
  }
}

// --- Render User Info ---
function renderUserInfo(userInfo) {
  document.getElementById("web-title").textContent = userInfo["user-name"];
  document.getElementById("user-name").textContent = userInfo["user-name"];
  document.getElementById("user-details").textContent =
    userInfo["user-details"];
  document.getElementById("user-short-description").textContent =
    userInfo["user-short-description"];

  const profilePicElement = document.getElementById("profile-pic");
  if (profilePicElement && userInfo["profile-pic"]) {
    profilePicElement.src = userInfo["profile-pic"];
  }
}

// --- Render About Section ---
function renderAbout(aboutText) {
  const aboutDescription = document.getElementById("about-description");
  if (aboutDescription && aboutText) {
    aboutDescription.textContent = aboutText;
  } else if (aboutDescription) {
    aboutDescription.textContent = "No description available.";
  }
}

// --- Render Skills Section ---
function renderSkills(skills) {
  const skillsListContainer = document.getElementById("skills-list");
  if (skillsListContainer && skills) {
    skillsListContainer.innerHTML = "";

    // Get all categories
    const categories = Object.keys(skills);

    // Shuffle categories
    for (let i = categories.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [categories[i], categories[j]] = [categories[j], categories[i]];
    }

    // Render each category
    categories.forEach((category) => {
      const skillCard = document.createElement("div");
      skillCard.className = "skill-card";

      // Category title
      const skillType = document.createElement("h3");
      skillType.className = "skill-type";
      skillType.textContent = category;
      skillCard.appendChild(skillType);

      // Sub-skills list
      const skillList = document.createElement("div");
      skillList.className = "skill-list";

      // Copy and shuffle skills
      const subSkills = [...skills[category]];
      for (let i = subSkills.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [subSkills[i], subSkills[j]] = [subSkills[j], subSkills[i]];
      }

      // Render each skill
      subSkills.forEach((skill) => {
        const skillItem = document.createElement("span");
        skillItem.textContent = skill;
        skillList.appendChild(skillItem);
      });

      skillCard.appendChild(skillList);
      skillsListContainer.appendChild(skillCard);
    });
  }
}
// --- Render Projects Section ---
function renderProjects(projects) {
  const projectsContainer = document.getElementById("projects-list");
  if (projectsContainer && projects && projects.length > 0) {
    projectsContainer.innerHTML = "";

    projects.forEach((project) => {
      const projectButton = document.createElement("button");
      projectButton.className = "project-card";

      // Open the popup when the button is clicked, passing the project object
      projectButton.onclick = () => {
        projectPopup(project);
      };

      projectButton.innerHTML = `
                ${
                  project.image
                    ? `<img src="${project.image}" alt="${project.name}" class="project-image" align="center"/>`
                    : ""
                }
                <span class="project-title">${project.name}</span>
                <div class="project-description">${
                  project.description || project.descripton || ""
                }</div>
            `;

      projectsContainer.appendChild(projectButton);
    });
  }
}

// --- Project Popup Functionality ---
function projectPopup(project) {
  const popup = document.getElementById("project-popup");
  const popupContent = document.getElementById("project-popup-content");

  if (project) {
    // Open the popup and populate with project data
    if (popup && popupContent) {
      popupContent.innerHTML = `
                <div class="popup-project-image-container">
                    <img src="${project.image}" alt="${
        project.name
      }" class="popup-project-image">
                </div>
                <h2 class="popup-project-title">${project.name}</h2>
                <p class="popup-project-long-description">${
                  project["long-description"] || project.description
                }</p>
                ${
                  project.link
                    ? `<a href="${project.link}" target="_blank" class="popup-project-link-btn">Visit Project</a>`
                    : ""
                }
            `;
      popup.classList.add("visible");
      document.body.classList.add("no-scroll");

      // Add event listener to close the popup when clicking the background
      popup.onclick = (event) => {
        if (event.target === popup) {
          projectPopup(); // Close the popup
        }
      };
    }
  } else {
    // Close the popup
    if (popup) {
      popup.classList.remove("visible");
      document.body.classList.remove("no-scroll");
      // Remove the event listener to avoid memory leaks
      popup.onclick = null;
    }
  }
}

// --- Render Contact Section (FIXED) ---
function renderContact(contact) {
  if (!contact) return;

  // Helper function to format array data into valid SVG transform strings
  const formatTransform = (key, value) => {
    if (!Array.isArray(value)) return value || '';
    if (key === 'matrix') {
      return `matrix(${value.join(',')})`;
    }
    // Assume other array transforms are simple translations (like the 'transform' key)
    if (key === 'transform') {
      return `translate(${value.join(',')})`;
    }
    return '';
  };

  const contactDescription = document.getElementById("contact-description");
  if (contactDescription) {
    contactDescription.textContent = contact["contact-text"] || "";
  }

  const contactEmail = document.getElementById("email-address");
  if (contactEmail && contact.socials && contact.socials.email) {
    const mail = document.createElement("span");
    mail.className = "mail-id";
    mail.textContent = contact.socials.email.url;
    contactEmail.innerHTML = "Email: ";
    contactEmail.appendChild(mail);
  }

  const socialLinksContainer = document.getElementById("social-links");
  if (socialLinksContainer && contact.socials) {
    socialLinksContainer.innerHTML = "";

    Object.entries(contact.socials).forEach(([key, value]) => {
      if (key === "email") return;

      const socialButton = document.createElement("button");
      socialButton.className = "social-link";
      socialButton.title = key;

      socialButton.onclick = () => {
        window.open(value.url, "_blank", "noopener,noreferrer");
      };

      // 1. Create the new wrapper div
      const btnContentDiv = document.createElement("div");
      btnContentDiv.className = "btn-content";

      // 2. Create the SVG element
      const iconSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      iconSVG.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      iconSVG.setAttribute('class', 'social-icon');
      iconSVG.setAttribute('viewBox', value.icon.viewBox || '0 0 24 24');

      // 3. Create the Outer G element (Mapped to 'matrix' data, now correctly formatted)
      const outerG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      if (value.icon.matrix) {
        outerG.setAttribute('transform', formatTransform('matrix', value.icon.matrix));
      }

      // 4. Create the Inner G element (Mapped to 'transform' data, now correctly formatted)
      const innerG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      if (value.icon.transform) {
        innerG.setAttribute('transform', formatTransform('transform', value.icon.transform));
      }

      // 5. Create the Path element
      const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      pathElement.setAttribute('d', value.icon.path || '');
      pathElement.setAttribute('fill', 'currentColor'); 
      
      // 6. Assemble the elements
      innerG.appendChild(pathElement);
      outerG.appendChild(innerG);
      iconSVG.appendChild(outerG);
      btnContentDiv.appendChild(iconSVG);
      socialButton.appendChild(btnContentDiv);
      socialLinksContainer.appendChild(socialButton);
    });
  }
}

function bindEnterKeyToSubmit() {
  const form = document.getElementById('contact-form');
  const submitButton = document.getElementById('submit');

  if (form && submitButton) {
    form.addEventListener('keydown', (event) => {
      // Check if the pressed key is the Enter key
      if (event.key === 'Enter') {
        // IMPORTANT: Prevent submission if the user is typing in the multiline message box (<textarea>)
        if (event.target.tagName !== 'TEXTAREA') {
          event.preventDefault(); // Stop default form submission/page refresh
          submitButton.click();   // Programmatically click the submit button
        }
      }
    });
  }
}

// --- Enable Card Animations on Scroll ---
function enableCardAnimations() {
  const cards = document.querySelectorAll(".card");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("roll-in");
          observer.unobserve(entry.target); // only animate once
        }
      });
    },
    { threshold: 0.3 }
  );

  cards.forEach((card) => observer.observe(card));
}

// --- Main App Function ---
async function main() {
  try {
    // Show loading screen
    await loadingScreen();

    // Fetch settings and info data
    const settingsData = await fetchJSON("assets/settings.json");
    const infoData = await fetchJSON("assets/info.json");

    // Render webpage icon
    renderWebpageIcon(settingsData["icon"]);

    // Initialize particle accelerator effect
    const canvas = document.getElementById("particleAccelerator");
    if (canvas) {
      new ParticleAccelerator(canvas);
    }

    // Render all sections
    window.scrollTo(0, 0);
    renderUserInfo(infoData["user-info"]);
    renderAbout(infoData["user-info"]["about-me"]);
    renderSkills(infoData.skills);
    renderProjects(infoData.projects);
    renderContact(infoData.contact);
    bindEnterKeyToSubmit();

    // Enable barrel roll animations
    // enableCardAnimations();
  } catch (error) {
    console.error("Error loading data:", error);
    // Ensure loading screen is hidden in case of error
    hideLoadingScreen(0);
  }
}

// --- Run app on DOM load ---
document.addEventListener("DOMContentLoaded", main);
