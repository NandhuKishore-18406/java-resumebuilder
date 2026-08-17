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
    --accent:#6ea8fe;
}

html{
    scroll-behavior:smooth;
    scroll-padding-top:80px;
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
    left:0;
    right:0;
    width:100%;
    z-index:99999;
    display:flex;
    justify-content:space-between;
    align-items:center;
    padding:1.2rem 3rem;
    backdrop-filter:blur(20px);
    -webkit-backdrop-filter:blur(20px);
    background:rgba(5,8,22,0.65);
    border-bottom:1px solid rgba(255,255,255,0.08);
    transition:all 0.3s ease;
}

.navbar.scrolled{
    padding:0.9rem 3rem;
    background:rgba(5,8,22,0.92);
    box-shadow:0 10px 30px rgba(0,0,0,0.5);
}

.logo{
    font-weight:800;
    letter-spacing:0.12em;
    font-size:1.15rem;
    background:linear-gradient(90deg, #ffffff, var(--accent));
    -webkit-background-clip:text;
    -webkit-text-fill-color:transparent;
}

.nav-links{
    display:flex;
    gap:2rem;
    align-items:center;
}

.nav-links a{
    text-decoration:none;
    color:var(--muted);
    font-weight:500;
    font-size:0.95rem;
    transition:all 0.25s ease;
    position:relative;
    padding:0.4rem 0;
}

.nav-links a:hover,
.nav-links a.active{
    color:#ffffff;
}

.nav-links a::after{
    content:'';
    position:absolute;
    bottom:0;
    left:0;
    width:0;
    height:2px;
    background:linear-gradient(90deg, #6ea8fe, #c084fc);
    transition:width 0.3s ease;
    border-radius:2px;
}

.nav-links a:hover::after,
.nav-links a.active::after{
    width:100%;
}

.nav-toggle{
    display:none;
    flex-direction:column;
    justify-content:space-around;
    width:30px;
    height:24px;
    background:transparent;
    border:none;
    cursor:pointer;
    padding:0;
    z-index:100000;
}

.hamburger-bar{
    width:100%;
    height:2px;
    background-color:var(--text);
    border-radius:2px;
    transition:all 0.3s ease;
}

.nav-toggle.open .hamburger-bar:nth-child(1){
    transform:translateY(8px) rotate(45deg);
}

.nav-toggle.open .hamburger-bar:nth-child(2){
    opacity:0;
}

.nav-toggle.open .hamburger-bar:nth-child(3){
    transform:translateY(-8px) rotate(-45deg);
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
    filter:brightness(0.4) saturate(1.1);
    animation:heroZoom 16s ease-in-out infinite alternate;
}

.hero-overlay{
    position:absolute;
    inset:0;
    background:linear-gradient(to bottom, rgba(0,0,0,0.25), rgba(5,8,22,0.96));
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
    background:rgba(255,255,255,0.06);
    border:1px solid rgba(255,255,255,0.1);
    color:var(--accent);
    margin-bottom:2rem;
    letter-spacing:0.16em;
    font-size:0.78rem;
    font-weight:600;
}

.hero h1{
    font-size:clamp(3.2rem,8vw,7rem);
    line-height:0.95;
    margin-bottom:1.5rem;
    font-weight:800;
    letter-spacing:-0.02em;
}

.hero p{
    color:var(--muted);
    font-size:1.2rem;
    line-height:1.6;
}

.section-container{
    width:min(1400px,95%);
}

.section-label{
    letter-spacing:0.2em;
    font-size:0.8rem;
    font-weight:700;
    color:var(--accent);
    margin-bottom:2rem;
}

.about-grid{
    display:grid;
    grid-template-columns:1.2fr 1fr;
    gap:5rem;
    align-items:start;
}

.about-grid h2{
    font-size:clamp(2.5rem,4.5vw,5rem);
    line-height:1.05;
    font-weight:800;
}

.about-grid p{
    color:var(--muted);
    line-height:1.9;
    font-size:1.15rem;
}

.fullscreen-section.project-section{
    padding:6rem 2rem 4rem 2rem;
    align-items:stretch;
}

.project-layout{
    width:100%;
    max-width:1400px;
    margin:0 auto;
    min-height:calc(100vh - 10rem);
    display:grid;
    grid-template-columns:380px 1fr;
    gap:2rem;
    background:rgba(255,255,255,0.02);
    border:1px solid rgba(255,255,255,0.06);
    border-radius:28px;
    overflow:hidden;
}

.project-sidebar{
    border-right:1px solid rgba(255,255,255,0.06);
    padding:2.5rem 1.8rem;
    overflow-y:auto;
    max-height:calc(100vh - 10rem);
}

.project-item{
    padding:1.2rem 1.2rem;
    border-radius:16px;
    margin-bottom:0.8rem;
    cursor:pointer;
    transition:all 0.3s ease;
    border:1px solid transparent;
}

.project-item:hover{
    background:rgba(255,255,255,0.04);
}

.project-item.active{
    background:rgba(110,168,254,0.12);
    border-color:rgba(110,168,254,0.3);
}

.project-item h3{
    margin-bottom:0.4rem;
    font-size:1.05rem;
    font-weight:600;
}

.project-item p{
    color:var(--muted);
    font-size:0.88rem;
    line-height:1.5;
}

.project-preview{
    display:flex;
    flex-direction:column;
    justify-content:center;
    padding:2.5rem 3rem;
}

.project-preview-image-wrapper{
    width:100%;
    height:400px;
    max-height:45vh;
    border-radius:20px;
    overflow:hidden;
    margin-bottom:1.8rem;
    background:rgba(255,255,255,0.04);
    border:1px solid rgba(255,255,255,0.08);
}

.project-preview-image{
    width:100%;
    height:100%;
    object-fit:cover;
    transition:opacity 0.3s ease;
}

.project-preview-content{
    width:min(800px,100%);
}

.project-preview-content h2{
    font-size:clamp(1.8rem,3.5vw,3rem);
    margin-bottom:0.8rem;
    font-weight:700;
}

.project-preview-content p{
    color:var(--muted);
    line-height:1.8;
    font-size:1.05rem;
}

.preview-links{
    display:flex;
    gap:1rem;
    margin-top:1.5rem;
}

.preview-links a{
    text-decoration:none;
    color:white;
    padding:0.8rem 1.4rem;
    border-radius:12px;
    background:rgba(255,255,255,0.06);
    border:1px solid rgba(255,255,255,0.1);
    transition:all 0.25s ease;
    font-weight:600;
    font-size:0.9rem;
}

.preview-links a:hover{
    transform:translateY(-2px);
    background:rgba(110,168,254,0.2);
    border-color:rgba(110,168,254,0.4);
}

.skills-container{
    width:min(1400px,95%);
    display:grid;
    grid-template-columns:0.8fr 1.2fr;
    gap:6rem;
    align-items:start;
}

.skills-heading{
    font-size:clamp(2.5rem,4.5vw,4.8rem);
    line-height:1.05;
    font-weight:800;
}

.skills-right{
    display:flex;
    flex-direction:column;
    gap:1.5rem;
}

.skill-category{
    border:1px solid rgba(255,255,255,0.06);
    border-radius:24px;
    background:rgba(255,255,255,0.03);
    overflow:hidden;
    backdrop-filter:blur(20px);
}

.skill-category-header{
    padding:1.2rem 1.8rem;
    border-bottom:1px solid rgba(255,255,255,0.05);
    font-size:0.95rem;
    letter-spacing:0.15em;
    font-weight:700;
    color:var(--accent);
}

.skill-list{
    display:flex;
    flex-direction:column;
}

.skill-item{
    padding:1.2rem 1.8rem;
    cursor:pointer;
    transition:0.25s ease;
    border-bottom:1px solid rgba(255,255,255,0.04);
}

.skill-item:last-child{
    border-bottom:none;
}

.skill-item:hover{
    background:rgba(255,255,255,0.04);
}

.skill-top{
    display:flex;
    justify-content:space-between;
    align-items:center;
}

.skill-main{
    display:flex;
    align-items:center;
    gap:1rem;
}

.skill-icon{
    font-size:1.4rem;
    width:42px;
    height:42px;
    border-radius:12px;
    display:flex;
    justify-content:center;
    align-items:center;
    background:rgba(255,255,255,0.05);
    border:1px solid rgba(255,255,255,0.06);
    font-family:'Symbols Nerd Font Mono', 'Nerd Fonts Symbol', 'Inter', monospace, sans-serif;
    color:var(--accent);
}

.skill-name{
    font-size:1rem;
    font-weight:500;
}

.skill-percent{
    color:rgba(255,255,255,0.45);
    font-size:0.9rem;
}

.skill-bar-wrapper{
    width:100%;
    height:7px;
    border-radius:999px;
    overflow:hidden;
    background:rgba(255,255,255,0.06);
    margin-top:0.8rem;
}

.skill-bar{
    height:100%;
    border-radius:999px;
    background:linear-gradient(90deg, #6ea8fe, #c084fc);
    transition:width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.contact-wrapper{
    width:min(1400px,95%);
    display:flex;
    justify-content:space-between;
    align-items:center;
    gap:5rem;
}

.contact-wrapper h2{
    font-size:clamp(2.5rem,4.5vw,5rem);
    line-height:1.05;
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
    background:rgba(255,255,255,0.05);
    border:1px solid rgba(255,255,255,0.08);
    transition:0.25s ease;
    font-weight:600;
}

.contact-links a:hover{
    transform:translateY(-3px);
    background:rgba(110,168,254,0.15);
    border-color:rgba(110,168,254,0.3);
}

@keyframes heroZoom{
    from{ transform:scale(1.08); }
    to{ transform:scale(1.16); }
}

@media(max-width:1100px){
    .skills-container,
    .about-grid,
    .contact-wrapper{
        grid-template-columns:1fr;
        gap:3rem;
    }

    .project-layout{
        grid-template-columns:1fr;
        height:auto;
        min-height:auto;
    }

    .project-sidebar{
        border-right:none;
        border-bottom:1px solid rgba(255,255,255,0.06);
        max-height:300px;
    }

    .project-preview{
        padding:2rem 1.5rem;
    }

    .project-preview-image-wrapper{
        height:280px;
    }
}

@media(max-width:768px){
    .fullscreen-section{
        padding:5rem 1.5rem 3rem 1.5rem;
    }

    .navbar{
        padding:1rem 1.5rem;
    }

    .navbar.scrolled{
        padding:0.8rem 1.5rem;
    }

    .nav-toggle{
        display:flex;
    }

    .nav-links{
        position:fixed;
        top:0;
        right:-100%;
        width:75%;
        max-width:300px;
        height:100vh;
        background:rgba(5,8,22,0.96);
        backdrop-filter:blur(25px);
        -webkit-backdrop-filter:blur(25px);
        flex-direction:column;
        justify-content:center;
        align-items:center;
        gap:2.5rem;
        transition:right 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        border-left:1px solid rgba(255,255,255,0.08);
        box-shadow:-10px 0 30px rgba(0,0,0,0.5);
    }

    .nav-links.open{
        right:0;
    }

    .nav-links a{
        font-size:1.25rem;
    }

    .hero h1{
        font-size:3.2rem;
    }

    .skills-heading,
    .about-grid h2,
    .contact-wrapper h2{
        font-size:2.4rem;
    }
}
`;

export const JS_TEMPLATE = `
function loadProject(index){
    if (typeof projects === 'undefined' || !projects || projects.length === 0) return;
    if (index < 0 || index >= projects.length) return;

    const project = projects[index];
    const previewImage = document.getElementById('preview-image');
    const previewTitle = document.getElementById('preview-title');
    const previewDescription = document.getElementById('preview-description');
    const previewGithub = document.getElementById('preview-github');
    const previewLive = document.getElementById('preview-live');

    if (previewImage) {
        previewImage.style.opacity = '0';
        setTimeout(() => {
            const fallbackImg = (typeof DEFAULT_IMAGE !== 'undefined') ? DEFAULT_IMAGE : "";
            const imgSrc = (project.images && project.images.length > 0 && project.images[0]) ? project.images[0] : fallbackImg;
            previewImage.src = imgSrc;
            previewImage.style.opacity = '1';
        }, 150);
    }

    if (previewTitle) previewTitle.textContent = project.title || "Untitled Project";
    if (previewDescription) previewDescription.textContent = project.description || project.short_description || "";

    if (previewGithub) {
        if (project.github && project.github !== "#") {
            previewGithub.href = project.github;
            previewGithub.style.display = "inline-flex";
        } else {
            previewGithub.style.display = "none";
        }
    }

    if (previewLive) {
        if (project.live && project.live !== "#") {
            previewLive.href = project.live;
            previewLive.style.display = "inline-flex";
        } else {
            previewLive.style.display = "none";
        }
    }

    const projectItems = document.querySelectorAll('.project-item');
    projectItems.forEach((item, i) => {
        if (i === index) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

function initPortfolioScript() {
    // Intercept clicks on links to prevent iframe location changes
    document.addEventListener('click', (e) => {
        const anchor = e.target.closest('a');
        if (!anchor) return;

        const href = anchor.getAttribute('href');

        if (href && href.startsWith('#')) {
            e.preventDefault();
            e.stopPropagation();
            const targetId = href.substring(1);
            const targetEl = document.getElementById(targetId);
            if (targetEl) {
                targetEl.scrollIntoView({ behavior: 'smooth' });
            }
            return;
        }

        if (!href || href === '#' || href === 'javascript:void(0)') {
            e.preventDefault();
            e.stopPropagation();
            return;
        }

        if (href.startsWith('http://') || href.startsWith('https://')) {
            anchor.target = '_blank';
            anchor.rel = 'noopener noreferrer';
        }
    }, true);

    // Project Click Listeners
    const projectItems = document.querySelectorAll('.project-item');
    projectItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            loadProject(index);
        });
    });

    if (typeof projects !== 'undefined' && projects.length > 0) {
        loadProject(0);
    }

    // Navbar Scroll Effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            navbar?.classList.add('scrolled');
        } else {
            navbar?.classList.remove('scrolled');
        }
    });

    // Mobile Navbar Toggle
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.getElementById('nav-links');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('open');
            navLinks.classList.toggle('open');
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('open');
                navLinks.classList.remove('open');
            });
        });
    }

    // Active Link ScrollSpy
    const sections = document.querySelectorAll('section[id]');
    const navLinkItems = document.querySelectorAll('.nav-links a');

    if (sections.length > 0 && navLinkItems.length > 0) {
        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -60% 0px',
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const currentId = entry.target.getAttribute('id');
                    navLinkItems.forEach(link => {
                        if (link.getAttribute('href') === \`#\${currentId}\`) {
                            link.classList.add('active');
                        } else {
                            link.classList.remove('active');
                        }
                    });
                }
            });
        }, observerOptions);

        sections.forEach(section => observer.observe(section));
    }

    // Skill Bar Interaction
    const skillItems = document.querySelectorAll('.skill-item');
    skillItems.forEach(item => {
        item.addEventListener('click', () => {
            const isAlreadyActive = item.classList.contains('active');
            skillItems.forEach(s => s.classList.remove('active'));
            if (!isAlreadyActive) {
                item.classList.add('active');
            }
        });
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPortfolioScript);
} else {
    initPortfolioScript();
}
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
    <div class="project-item ${idx === 0 ? "active" : ""}" data-index="${idx}">
      <h3>${p.title || "Project"}</h3>
      <p>${p.description || ""}</p>
    </div>
  `).join("");

  // Build Skills HTML
  const skillsCategories = data.skills || {};
  const skillsHtml = Object.entries(skillsCategories).map(([category, items]) => {
    const itemsHtml = items.map(skill => `
      <div class="skill-item" data-level="${skill.level || 80}">
        <div class="skill-top">
          <div class="skill-main">
            <div class="skill-icon">${skill.icon || "⚡"}</div>
            <div class="skill-name">${skill.name}</div>
          </div>
          <div class="skill-percent">${skill.level || 80}%</div>
        </div>
        <div class="skill-bar-wrapper">
          <div class="skill-bar" style="width: ${skill.level || 80}%"></div>
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
  const contactLinksHtml = Object.entries(contacts).map(([key, val]) => {
    let value = String(val).trim();
    let target = 'target="_blank" rel="noopener noreferrer"';
    if (value.startsWith("mailto:") || value.startsWith("tel:") || value.includes("@")) {
      target = "";
      if (value.includes("@") && !value.startsWith("mailto:")) {
        value = `mailto:${value}`;
      }
    } else if (!value.startsWith("http://") && !value.startsWith("https://")) {
      value = `https://${value}`;
    }
    return `<a href="${value}" ${target}>${key.toUpperCase()}</a>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name} | Personal Portfolio</title>
    <link rel="stylesheet" href="style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@nerdfonts/font@3.2.1/css/nerdfonts.min.css">
</head>
<body>
    <div class="noise"></div>
    <nav class="navbar" id="navbar">
        <div class="logo">${name}</div>
        <button class="nav-toggle" id="nav-toggle" aria-label="Toggle navigation">
            <span class="hamburger-bar"></span>
            <span class="hamburger-bar"></span>
            <span class="hamburger-bar"></span>
        </button>
        <div class="nav-links" id="nav-links">
            <a href="#hero" class="active">Home</a>
            <a href="#about">About</a>
            <a href="#projects">Projects</a>
            <a href="#skills">Skills</a>
            <a href="#contact">Contact</a>
        </div>
    </nav>

    <section class="hero fullscreen-section" id="hero">
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
                        <a id="preview-github" target="_blank" rel="noopener noreferrer">GitHub</a>
                        <a id="preview-live" target="_blank" rel="noopener noreferrer">Live Demo</a>
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
      const DEFAULT_IMAGE = "${heroImage}";
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
