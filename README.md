# My Portfolio

A responsive and interactive personal portfolio website.

![visitors](https://visitor-badge.laobi.icu/badge?page_id=srijan-76448/Resume)
![Website Visitors](https://visitor-badge.laobi.icu/badge?page_id=srijan.76448.org)

## 🚀 Features

  * **Dynamic Background:** A particle accelerator animation created with HTML Canvas provides a futuristic, interactive backdrop.
  * **Modular Design:** The project is structured with separate HTML, CSS, and JavaScript files for easy maintenance and scalability.
  * **Data-Driven Content:** All user information, projects, and skills are loaded from a JSON file (`info.json`), making content updates simple and efficient without touching the code.
  * **Responsive Layout:** The design adapts to different screen sizes, ensuring a consistent user experience on both desktop and mobile devices.
  * **Customizable:** Easily change portfolio content, including user details, projects, skills, and social media links, by editing `info.json`. The color scheme can be adjusted in `index.css` by changing CSS variables.

## ⚙️ Technologies Used

  * **HTML5:** For the website's structure and semantic content.
  * **CSS3:** For styling and layout, including a dark theme and modern card-based design.
  * **JavaScript (ES6+):** For the interactive particle animation and dynamically loading content from JSON files.
  * **JSON:** To store all portfolio data in a clean, organized format, separating content from presentation.

## 🛠️ Setup and Usage

1.  **Clone the Repository:** Download or clone this project to your local machine.
2.  **Open with a Live Server:** You'll need a local web server to run this project properly due to the `fetch()` API calls to `info.json` and `settings.json`. You can use a tool like VS Code's **Live Server** extension.
3.  **Customize Content:** Edit the `info.json` file to change the displayed information. You can add or remove skills, projects, and social links.
4.  **Customize Styling:** Modify the CSS variables in the `:root` section of `index.css` to adjust the color palette and overall look.

## 📂 File Structure

```
├── assets/
│   ├── imgs/
│   │   └── Face.jpg
│   └── settings.json
│   └── info.json
├── index.css
├── index.html
├── index.js
```

## 👨‍💻 Author

  * **Srijan Bhattacharyya** - Embedded Systems Engineer
