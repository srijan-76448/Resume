// Splash Screen
window.addEventListener("load", function () {
  const splashScreen = document.getElementById("splash-screen");
  if (splashScreen) {
    setTimeout(() => {
      splashScreen.classList.add("hidden");
    }, 500);
  }
});

// Dark Mode Toggle Functionality
const themeToggleButton = document.getElementById("themeToggleButton");
const body = document.body;
const sunEmoji = "☀️";
const moonEmoji = "🌙";

function setAndStoreTheme(isDarkMode) {
  if (isDarkMode) {
    body.classList.add("dark-mode");
    themeToggleButton.textContent = moonEmoji;
    localStorage.setItem("theme", "dark");
  } else {
    body.classList.remove("dark-mode");
    themeToggleButton.textContent = sunEmoji;
    localStorage.setItem("theme", "light");
  }
}

const storedTheme = localStorage.getItem("theme");
if (storedTheme) {
  setAndStoreTheme(storedTheme === "dark");
} else {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  setAndStoreTheme(prefersDark);
}

window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", (event) => {
    if (!localStorage.getItem("theme")) {
      setAndStoreTheme(event.matches);
    }
  });

themeToggleButton.addEventListener("click", () => {
  const isCurrentlyDark = body.classList.contains("dark-mode");
  setAndStoreTheme(!isCurrentlyDark);
});

// Text formatting
function applyTextFormatting(text) {
  let formattedText = text.replace(/\*(.*?)\*/g, "<strong>$1</strong>");
  formattedText = formattedText.replace(/_(.*?)_/g, "<em>$1</em>");
  formattedText = formattedText.replace(/~(.*?)~/g, "<u>$1</u>");
  return formattedText;
}

// load items from info.json
document.addEventListener("DOMContentLoaded", function () {
  fetch("info.json")
    .then((response) => response.json())
    .then((fullData) => {

      // Render Contact Info
      const personalInfo = fullData.personalInfo;
      const contactInfoContainer = document.getElementById(
        "contact-info-container"
      );
      if (personalInfo) {
        const emailP = document.createElement("p");
        emailP.innerHTML = `<strong>Mail:</strong> <a href="mailto:${personalInfo.email}">${personalInfo.email}</a>`;
        contactInfoContainer.appendChild(emailP);

        const phone1P = document.createElement("p");
        phone1P.innerHTML = `<strong>Phone 1:</strong> ${personalInfo.phone1}`;
        contactInfoContainer.appendChild(phone1P);

        if (personalInfo.phone2) {
          const phone2P = document.createElement("p");
          phone2P.innerHTML = `<strong>Phone 2:</strong> ${personalInfo.phone2}`;
          contactInfoContainer.appendChild(phone2P);
        }

        const websiteP = document.createElement("p");
        websiteP.innerHTML = `<strong>Website:</strong> <a href="${personalInfo.website.url}" target="_blank" rel="noreferrer noopener" aria-label="Home">${personalInfo.website.display}</a>`;
        contactInfoContainer.appendChild(websiteP);
      }

      // Render Summary
      const summaryData = fullData.summary;
      const summaryContainer = document.getElementById("summary-container");
      if (summaryData) {
        const summaryP = document.createElement("p");
        summaryP.innerHTML = applyTextFormatting(summaryData);
        summaryContainer.appendChild(summaryP);
      }

      // Render Projects
      const projectsData = fullData.projects;
      const projectsContainer = document.getElementById("projects-container");
      for (const projectName in projectsData) {
        if (projectsData.hasOwnProperty(projectName)) {
          const project = projectsData[projectName];
          const projectSection = document.createElement("section");
          projectSection.classList.add("project-item");

          const projectTitle = document.createElement("h3");
          if (project.link) {
            const projectLink = document.createElement("a");
            projectLink.href = project.link;
            projectLink.target = "_blank";
            projectLink.rel = "noreferrer noopener";
            projectLink.setAttribute("aria-label", projectName);
            projectLink.textContent = projectName;
            projectTitle.appendChild(projectLink);
          } else {
            projectTitle.textContent = projectName;
          }
          projectTitle.innerHTML += ` [${project.timeline}]`;

          const projectDescription = document.createElement("p");
          projectDescription.innerHTML = applyTextFormatting(
            project.descripton
          );

          const projectFeaturesTitle = document.createElement("p");
          projectFeaturesTitle.innerHTML = "Key features:";

          const featuresList = document.createElement("ul");
          for (const featureKey in project.features) {
            if (project.features.hasOwnProperty(featureKey)) {
              const featureItem = document.createElement("li");
              featureItem.innerHTML = `<strong>${featureKey}:</strong> ${applyTextFormatting(
                project.features[featureKey]
              )}`;
              featuresList.appendChild(featureItem);
            }
          }

          projectSection.appendChild(projectTitle);
          projectSection.appendChild(projectDescription);
          projectSection.appendChild(projectFeaturesTitle);
          projectSection.appendChild(featuresList);

          projectsContainer.appendChild(projectSection);
        }
      }

      // Render Skills
      const skillsData = fullData.skills;
      const skillsContainer = document.getElementById("skills-container");
      for (const skillCategory in skillsData) {
        if (skillsData.hasOwnProperty(skillCategory)) {
          const categoryItem = document.createElement("li");
          categoryItem.innerHTML = `<strong>${skillCategory}:</strong> ${skillsData[
            skillCategory
          ]
            .map((item) => applyTextFormatting(item))
            .join(", ")}`;
          skillsContainer.appendChild(categoryItem);
        }
      }

      // Render Education
      const educationData = fullData.education;
      const educationContainer = document.getElementById("education-container");
      for (const degreeName in educationData) {
        if (educationData.hasOwnProperty(degreeName)) {
          const education = educationData[degreeName];
          const educationSection = document.createElement("section");
          educationSection.classList.add("education-item");

          const educationTitle = document.createElement("h3");
          educationTitle.innerHTML = `${applyTextFormatting(degreeName)} [${
            education.timeline
          }]`;

          educationSection.appendChild(educationTitle);
          if (education.description) {
            const educationDescription = document.createElement("p");
            educationDescription.innerHTML = applyTextFormatting(
              education.description
            );
            educationSection.appendChild(educationDescription);
          }

          educationContainer.appendChild(educationSection);
        }
      }

      // Render Socials
      const socialsData = fullData.socials;
      const socialsContainer = document.getElementById("socials-container");
      for (const platform in socialsData) {
        if (socialsData.hasOwnProperty(platform)) {
          const social = socialsData[platform];
          const socialItem = document.createElement("li");
          const socialLink = document.createElement("a");
          socialLink.href = social.url;
          socialLink.target = "_blank";
          socialLink.rel = "noreferrer noopener";
          socialLink.setAttribute("aria-label", platform);
          socialLink.textContent = social.display;
          socialItem.innerHTML = `${platform}: `;
          socialItem.appendChild(socialLink);
          socialsContainer.appendChild(socialItem);
        }
      }
    })

    .catch((error) => console.error("Error fetching info.json:", error));
});
