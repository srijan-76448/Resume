// --- Fetch JSON Helper ---
async function fetchJSON(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}`);
  }
  return response.json();
}

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
      const projectDiv = document.createElement("div");
      projectDiv.className = "project-card";

      projectDiv.innerHTML = `
        ${
          project.link
            ? ` <img src="${project.image}" alt="${project.name}" class="project-image" align="center"/>`
            : ""
        }
        <span class="project-title">${project.name}</span>
        <p class="project-description">${
          project.description || project.descripton || ""
        }</p>
        ${
          project.link
            ? `<a href="${project.link}" target="_blank">View Project</a>`
            : ""
        }
      `;

      projectsContainer.appendChild(projectDiv);
    });
  }
}

// --- Render Contact Section ---
function renderContact(contact) {
  if (!contact) return;

  // Contact description text
  const contactDescription = document.getElementById("contact-description");
  if (contactDescription) {
    contactDescription.textContent = contact["contact-text"] || "";
  }

  // Email address
  const contactEmail = document.getElementById("email-address");
  if (contactEmail && contact.socials && contact.socials.email) {
    const mail = document.createElement("span");
    mail.className = "mail-id";
    mail.textContent = contact.socials.email.url;
    contactEmail.innerHTML = "Email: ";
    contactEmail.appendChild(mail);
  }

  // Social links
  const socialLinksContainer = document.getElementById("social-links");
  if (socialLinksContainer && contact.socials) {
    socialLinksContainer.innerHTML = ""; // clear old content

    Object.entries(contact.socials).forEach(([key, value]) => {
      if (key === "email") return; // already handled separately

      const link = document.createElement("a");
      link.href = value.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.className = "social-link";
      link.title = key;

      // Icon (SVG data URI from JSON)
      const iconImg = document.createElement("svg");
      iconImg.className = "social-icon";
      iconImg.setAttribute("viewBox", "0 0 24 24");
      iconImg.innerHTML = `<path d="${value.icon}"/>`;

      link.appendChild(iconImg);
      socialLinksContainer.appendChild(link);
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
    { threshold: 0.3 } // trigger when 30% of card is visible
  );

  cards.forEach((card) => observer.observe(card));
}

// --- Main App Function ---
async function main() {
  try {
    const canvas = document.getElementById("particleAccelerator");
    if (canvas) {
      new ParticleAccelerator(canvas);
    }

    const settingsData = await fetchJSON("assets/settings.json");
    const infoData = await fetchJSON("assets/info.json");

    renderUserInfo(infoData["user-info"]);
    renderAbout(infoData["user-info"]["about-me"]);
    renderSkills(infoData.skills);
    renderProjects(infoData.projects);
    renderContact(infoData.contact);

    // Enable barrel roll animations
    // enableCardAnimations();
  } catch (error) {
    console.error("Error loading data:", error);
  }
}

// --- Run app on DOM load ---
document.addEventListener("DOMContentLoaded", main);
