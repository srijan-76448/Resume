# [My Personal Resume Webpage](https://resume.76448.in)
This is a personal resume webpage, a simple static site designed to display my profile, projects, skills, etc. All the content is managed from a single JSON file, making it easy to update.

This site is built with standard web technologies: HTML for structure, CSS for looks, and JavaScript to pull in my info. <br> All my content is stored in `info.json`. The JavaScript reads this file and populates the different sections of the page. This way, I only need to edit `info.json` to change anything on the site.

### Simple Text Formatting:
I've set it up so I can use a few special characters in the text fields within `info.json` for basic styling:
  * `*text*`: **Bold**
  * `_text_`: *Italics*
  * `~text~`: \<ins\>Underline\</ins\>
