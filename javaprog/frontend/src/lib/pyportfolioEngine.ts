export interface PortfolioProject {
  title: string;
  description: string;
  github?: string;
  live?: string;
  images: string[];
}

export interface PortfolioSkillItem {
  name: string;
  icon?: string;
  level: number;
}

export interface PortfolioData {
  name: string;
  tagline: string;
  about: string;
  hero_image: string;
  skills: Record<string, PortfolioSkillItem[]>;
  projects: PortfolioProject[];
  contact: Record<string, string>;
}

const DEFAULT_HERO_IMAGE =
  "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=2000&auto=format&fit=crop";

export const CSS_TEMPLATE = `*{
    margin:0;
    padding:0;
    box-sizing:border-box;
}

:root{
    --bg:#050816;
    --surface:rgba(255,255,255,0.05);
    --border:rgba(255,255,255,0.08);
    --text:#ffffff;
    --muted:rgba(255,255,255,0.68);
    --primary:#12708c;
    --accent:#188cae;
}

html{
    scroll-behavior:smooth;
}

body{
    font-family:'Inter',sans-serif;
    background:var(--bg);
    color:var(--text);
    overflow-x:hidden;
}

.noise{
    position:fixed;
    inset:0;
    background-image:radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px);
    background-size:4px 4px;
    opacity:0.18;
    pointer-events:none;
    z-index:9999;
}

.fullscreen-section{
    min-height:100vh;
    width:100%;
    display:flex;
    align-items:center;
    justify-content:center;
    position:relative;
    padding:6rem 2rem;
}

.navbar{
    position:fixed;
    top:0;
    width:100%;
    z-index:99999;
    display:flex;
    justify-content:space-between;
    align-items:center;
    padding:1.3rem 3rem;
    backdrop-filter:blur(20px);
    background:rgba(5,8,22,0.6);
    border-bottom:1px solid rgba(255,255,255,0.08);
}

.logo{
    font-weight:800;
    letter-spacing:0.12em;
    font-size:1.1rem;
    background:linear-gradient(90deg, #ffffff, var(--accent));
    -webkit-background-clip:text;
    -webkit-text-fill-color:transparent;
}

.nav-links{
    display:flex;
    gap:2rem;
}

.nav-links a{
    text-decoration:none;
    color:var(--muted);
    font-weight:500;
    transition:0.25s ease;
}

.nav-links a:hover{
    color:white;
}

.hero{
    overflow:hidden;
    position:relative;
}

.hero-image{
    position:absolute;
    inset:0;
    width:100%;
    height:100%;
    object-fit:cover;
    transform:scale(1.08);
    filter:brightness(0.35) saturate(1.2);
    animation:heroZoom 16s ease-in-out infinite alternate;
}

.hero-overlay{
    position:absolute;
    inset:0;
    background:linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(5,8,22,0.95));
}

.hero-content{
    position:relative;
    z-index:5;
    text-align:center;
    max-width:900px;
    padding:0 1rem;
}

.hero-badge{
    display:inline-block;
    padding:0.6rem 1.2rem;
    border-radius:999px;
    background:rgba(18,112,140,0.2);
    border:1px solid rgba(24,140,174,0.4);
    color:#188cae;
    margin-bottom:2rem;
    letter-spacing:0.16em;
    font-size:0.75rem;
    font-weight:700;
}

.hero h1{
    font-size:clamp(3.5rem,8vw,7rem);
    line-height:1;
    margin-bottom:1.5rem;
    font-weight:800;
    letter-spacing:-0.02em;
}

.hero p{
    color:var(--muted);
    font-size:1.25rem;
    line-height:1.6;
}

.section-container{
    width:min(1400px,95%);
}

.section-label{
    letter-spacing:0.2em;
    font-size:0.8rem;
    font-weight:700;
    color:rgba(24,140,174,0.9);
    margin-bottom:2rem;
}

.about-grid{
    display:grid;
    grid-template-columns:1.2fr 1fr;
    gap:5rem;
}

.about-grid h2{
    font-size:clamp(2.5rem,4vw,5rem);
    line-height:1.1;
    font-weight:800;
}

.about-grid p{
    color:var(--muted);
    line-height:1.9;
    font-size:1.15rem;
}

.project-layout{
    width:100%;
    min-height:100vh;
    display:grid;
    grid-template-columns:380px 1fr;
    padding-top:5rem;
}

.project-sidebar{
    border-right:1px solid rgba(255,255,255,0.06);
    padding:4rem 2rem;
    overflow-y:auto;
}

.project-item{
    padding:1.4rem 1.2rem;
    border-radius:18px;
    margin-bottom:1rem;
    cursor:pointer;
    transition:0.3s ease;
    border:1px solid transparent;
}

.project-item:hover{
    background:rgba(255,255,255,0.04);
}

.project-item.active{
    background:rgba(18,112,140,0.15);
    border-color:rgba(24,140,174,0.4);
}

.project-item h3{
    margin-bottom:0.4rem;
    font-size:1.1rem;
    font-weight:700;
}

.project-item p{
    color:var(--muted);
    font-size:0.9rem;
    line-height:1.5;
}

.project-preview{
    display:flex;
    flex-direction:column;
    justify-content:center;
    padding:4rem;
}

.project-preview-image-wrapper{
    width:100%;
    height:50vh;
    border-radius:24px;
    overflow:hidden;
    margin-bottom:2rem;
    background:rgba(255,255,255,0.04);
    border:1px solid rgba(255,255,255,0.08);
}

.project-preview-image{
    width:100%;
    height:100%;
    object-fit:cover;
    transition:opacity 0.4s ease;
}

.project-preview-content{
    width:min(800px,100%);
}

.project-preview-content h2{
    font-size:clamp(2rem,4vw,3.5rem);
    margin-bottom:1rem;
    font-weight:800;
}

.project-preview-content p{
    color:var(--muted);
    line-height:1.8;
    font-size:1.05rem;
}

.preview-links{
    display:flex;
    gap:1rem;
    margin-top:2rem;
}

.preview-links a{
    text-decoration:none;
    color:white;
    padding:0.9rem 1.4rem;
    border-radius:14px;
    background:rgba(255,255,255,0.06);
    border:1px solid rgba(255,255,255,0.1);
    transition:0.25s ease;
    font-weight:600;
}

.preview-links a:hover{
    transform:translateY(-3px);
    background:rgba(18,112,140,0.3);
    border-color:rgba(24,140,174,0.5);
}

.skills-container{
    width:min(1400px,95%);
    display:grid;
    grid-template-columns:0.8fr 1.2fr;
    gap:6rem;
    align-items:start;
}

.skills-heading{
    font-size:clamp(2.5rem,4vw,4.5rem);
    line-height:1.1;
    font-weight:800;
}

.skills-right{
    display:flex;
    flex-direction:column;
    gap:1.5rem;
}

.skill-category{
    border:1px solid rgba(255,255,255,0.08);
    border-radius:24px;
    background:rgba(255,255,255,0.03);
    overflow:hidden;
    backdrop-filter:blur(20px);
    padding:1.5rem;
}

.skill-category-header{
    font-size:1.1rem;
    font-weight:700;
    margin-bottom:1rem;
    color:#188cae;
}

.skill-list{
    display:grid;
    grid-template-columns:repeat(auto-fill, minmax(180px, 1fr));
    gap:1rem;
}

.skill-item{
    padding:1rem;
    border-radius:16px;
    background:rgba(255,255,255,0.04);
    border:1px solid rgba(255,255,255,0.06);
}

.skill-item-header{
    display:flex;
    align-items:center;
    justify-content:space-between;

}

.skill-name{
    font-size:0.95rem;
    font-weight:600;
}

.skill-percent{
    color:rgba(255,255,255,0.45);
    font-size:0.85rem;
}

.skill-bar-wrapper{
    width:100%;
    height:6px;
    border-radius:999px;
    overflow:hidden;
    background:rgba(255,255,255,0.06);
    margin-top:0.8rem;
}

.skill-bar{
    height:100%;
    border-radius:999px;
    background:linear-gradient(90deg, #12708c, #188cae);
}

.contact-wrapper{
    width:min(1200px,95%);
    display:flex;
    justify-content:space-between;
    align-items:center;
    gap:4rem;
}

.contact-wrapper h2{
    font-size:clamp(2.5rem,4vw,4.5rem);
    line-height:1.1;
    font-weight:800;
}

.contact-links{
    display:flex;
    flex-wrap:wrap;
    gap:1rem;
}

.contact-links a{
    text-decoration:none;
    color:white;
    padding:1rem 1.6rem;
    border-radius:16px;
    background:rgba(18,112,140,0.15);
    border:1px solid rgba(24,140,174,0.3);
    transition:0.25s ease;
    font-weight:600;
}

.contact-links a:hover{
    transform:translateY(-3px);
    background:rgba(18,112,140,0.35);
}

@keyframes heroZoom{
    from{ transform:scale(1.08); }
    to{ transform:scale(1.15); }
}

@media(max-width:1100px){
    .skills-container, .project-layout, .about-grid, .contact-wrapper{
        grid-template-columns:1fr;
        gap:3rem;
    }
    .project-layout{ height:auto; }
}
`;

export const JS_TEMPLATE = `
let currentProject = 0;

function loadProject(index){
    if (!projects || projects.length === 0) return;
    const project = projects[index];
    const previewImage = document.getElementById('preview-image');
    const previewTitle = document.getElementById('preview-title');
    const previewDescription = document.getElementById('preview-description');
    const previewGithub = document.getElementById('preview-github');
    const previewLive = document.getElementById('preview-live');

    if (previewImage) {
        previewImage.style.opacity = 0;
        setTimeout(() => {
            previewImage.src = project.images && project.images.length > 0 ? project.images[0] : "https://images.unsplash.com/photo-1515879218367-8466d910aaa4";
            previewImage.style.opacity = 1;
        }, 150);
    }
    if (previewTitle) previewTitle.textContent = project.title || "Untitled Project";
    if (previewDescription) previewDescription.textContent = project.description || "";
    if (previewGithub) {
        previewGithub.href = project.github || "#";
        previewGithub.style.display = project.github ? "inline-block" : "none";
    }
    if (previewLive) {
        previewLive.href = project.live || "#";
        previewLive.style.display = project.live ? "inline-block" : "none";
    }

    const projectItems = document.querySelectorAll('.project-item');
    projectItems.forEach((item, i) => {
        if (i === index) item.classList.add('active');
        else item.classList.remove('active');
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const projectItems = document.querySelectorAll('.project-item');
    projectItems.forEach((item, index) => {
        item.addEventListener('click', () => loadProject(index));
    });
    if (typeof projects !== 'undefined' && projects.length > 0) {
        loadProject(0);
    }
});
`;

export function generatePortfolioHtml(data: PortfolioData): string {
  const name = data.name || "Portfolio";
  const tagline = data.tagline || "Software Developer & Researcher";
  const about = data.about || "Building innovative systems and web platforms.";
  const heroImage = data.hero_image || DEFAULT_HERO_IMAGE;
  const projects = data.projects || [];
  const defaultProjectImage = projects.length > 0 && projects[0].images?.[0] ? projects[0].images[0] : heroImage;

  // Build Project List HTML
  const projectListHtml = projects.map((p, idx) => `
    <div class="project-item ${idx === 0 ? "active" : ""}" onclick="loadProject(${idx})">
      <h3>${p.title}</h3>
      <p>${p.description}</p>
    </div>
  `).join("");

  // Build Skills HTML
  const skillsCategories = data.skills || {};
  const skillsHtml = Object.entries(skillsCategories).map(([category, items]) => {
    const itemsHtml = items.map(skill => `
      <div class="skill-item">
        <div class="skill-item-header">
          <span class="skill-name">${skill.name}</span>
          <span class="skill-percent">${skill.level}%</span>
        </div>
        <div class="skill-bar-wrapper">
          <div class="skill-bar" style="width: ${skill.level}%"></div>
        </div>
      </div>
    `).join("");

    return `
      <div class="skill-category">
        <div class="skill-category-header">${category}</div>
        <div class="skill-list">${itemsHtml}</div>
      </div>
    `;
  }).join("");

  // Build Contact Links HTML
  const contacts = data.contact || {};
  const contactLinksHtml = Object.entries(contacts).map(([key, val]) => `
    <a href="${val.startsWith("http") || val.includes("@") ? val : "https://" + val}" target="_blank" rel="noreferrer">
      ${key.toUpperCase()}: ${val}
    </a>
  `).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name} | Personal Portfolio</title>
    <link rel="stylesheet" href="style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body>
    <div class="noise"></div>
    <nav class="navbar">
        <div class="logo">${name}</div>
        <div class="nav-links">
            <a href="#hero">Home</a>
            <a href="#about">About</a>
            <a href="#projects">Projects</a>
            <a href="#skills">Skills</a>
            <a href="#contact">Contact</a>
        </div>
    </nav>

    <section className="hero fullscreen-section" id="hero">
        <img src="${heroImage}" class="hero-image" alt="Hero background">
        <div class="hero-overlay"></div>
        <div class="hero-content">
            <div class="hero-badge">AVAILABLE FOR WORK</div>
            <h1>${name}</h1>
            <p>${tagline}</p>
        </div>
    </section>

    <section class="fullscreen-section about-section" id="about">
        <div class="section-container">
            <div class="section-label">ABOUT</div>
            <div class="about-grid">
                <h2>Building modern digital experiences with clean engineering.</h2>
                <p>${about}</p>
            </div>
        </div>
    </section>

    <section class="fullscreen-section project-section" id="projects">
        <div class="project-layout">
            <div class="project-sidebar">
                <div class="section-label">PROJECTS</div>
                ${projectListHtml}
            </div>
            <div class="project-preview">
                <div class="project-preview-image-wrapper">
                    <img id="preview-image" src="${defaultProjectImage}" class="project-preview-image" alt="Project preview">
                </div>
                <div class="project-preview-content">
                    <h2 id="preview-title">Select a project</h2>
                    <p id="preview-description">Project details will appear here.</p>
                    <div class="preview-links">
                        <a id="preview-github" target="_blank" rel="noreferrer">GitHub</a>
                        <a id="preview-live" target="_blank" rel="noreferrer">Live Demo</a>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="fullscreen-section skills-section" id="skills">
        <div class="skills-container">
            <div class="skills-left">
                <div class="section-label">STACK</div>
                <h2 class="skills-heading">Technologies and tools I use to build scalable systems.</h2>
            </div>
            <div class="skills-right">
                ${skillsHtml}
            </div>
        </div>
    </section>

    <section class="fullscreen-section contact-section" id="contact">
        <div class="contact-wrapper">
            <div>
                <div class="section-label">CONTACT</div>
                <h2>Let's build something meaningful.</h2>
            </div>
            <div class="contact-links">
                ${contactLinksHtml}
            </div>
        </div>
    </section>

    <script>
      const projects = ${JSON.stringify(projects)};
    </script>
    <script src="script.js"></script>
</body>
</html>`;
}

export function generateSingleStandaloneHtml(data: PortfolioData): string {
  const html = generatePortfolioHtml(data);
  // Inject CSS & JS directly for 1-click single-file viewing
  return html
    .replace('<link rel="stylesheet" href="style.css">', `<style>${CSS_TEMPLATE}</style>`)
    .replace('<script src="script.js"></script>', `<script>${JS_TEMPLATE}</script>`);
}
