import fs from 'fs';
import path from 'path';
import { CANADIAN_EDITORIAL_ARTICLES } from '../src/data/canadianArticles';
import { CANADIAN_AIRPORTS, CANADIAN_AIRLINES, CANADIAN_AIRCRAFT, CANADIAN_ROUTES } from '../src/data/canadianAviationData';
import { aviationService } from '../src/services/aviationService';

const DIST_DIR = path.resolve(process.cwd(), 'dist');
const BASE_HTML_PATH = path.join(DIST_DIR, 'index.html');

if (!fs.existsSync(BASE_HTML_PATH)) {
  console.log('dist/index.html not found, skipping prerender.');
  process.exit(0);
}

const template = fs.readFileSync(BASE_HTML_PATH, 'utf-8');

function ensureDirSync(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function markdownToSimpleHtml(md: string): string {
  const sections = md.split('\n\n').filter(s => s.trim().length > 0);
  return sections.map(section => {
    // Markdown table
    if (section.includes('|') && section.includes('---')) {
      const lines = section.trim().split('\n').filter(l => l.startsWith('|'));
      if (lines.length >= 2) {
        const parseRow = (line: string) => line.slice(1, -1).split('|').map(c => c.trim());
        const header = parseRow(lines[0]);
        const rows = lines.slice(2).map(parseRow);
        const headerHtml = `<tr>${header.map(h => `<th style="padding: 8px 12px; border: 1px solid #ddd; background: #681C35; color: white;">${h}</th>`).join('')}</tr>`;
        const rowsHtml = rows.map(r => `<tr>${r.map(c => `<td style="padding: 8px 12px; border: 1px solid #ddd;">${c}</td>`).join('')}</tr>`).join('');
        return `<div style="overflow-x:auto; margin: 16px 0;"><table style="width:100%; border-collapse: collapse; font-size: 13px;"><thead>${headerHtml}</thead><tbody>${rowsHtml}</tbody></table></div>`;
      }
    }
    if (section.startsWith('### ')) {
      return `<h2 style="font-size: 20px; font-weight: bold; color: #681C35; margin-top: 24px; margin-bottom: 8px; border-bottom: 1px solid #E8E5E8; padding-bottom: 4px;">${section.replace('### ', '')}</h2>`;
    }
    if (section.startsWith('#### ')) {
      return `<h3 style="font-size: 16px; font-weight: bold; color: #25232A; margin-top: 16px; margin-bottom: 6px;">${section.replace('#### ', '')}</h3>`;
    }
    if (section.startsWith('> ')) {
      return `<blockquote style="border-left: 4px solid #681C35; padding: 12px 16px; background: #FAF9FA; margin: 16px 0; color: #504e57; font-style: italic;">${section.replace(/^>\s*/, '')}</blockquote>`;
    }
    if (section.startsWith('- ')) {
      const items = section.split('\n').filter(l => l.startsWith('- '));
      return `<ul style="margin: 12px 0; padding-left: 20px; line-height: 1.6;">${items.map(it => `<li>${it.replace('- ', '')}</li>`).join('')}</ul>`;
    }
    if (section.match(/^\d+\.\s/)) {
      const items = section.split('\n').filter(l => l.match(/^\d+\.\s/));
      return `<ol style="margin: 12px 0; padding-left: 20px; line-height: 1.6;">${items.map(it => `<li>${it.replace(/^\d+\.\s/, '')}</li>`).join('')}</ol>`;
    }

    // Convert markdown links [Label](url)
    const convertedLinks = section.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" style="color: #681C35; font-weight: 600; text-decoration: underline;">$1</a>');
    return `<p style="margin: 12px 0; line-height: 1.7; color: #3a3740;">${convertedLinks}</p>`;
  }).join('\n');
}

console.log('Starting comprehensive static pre-render for Google Search Console, Googlebot & SEO indexing...');

const SITE_ORIGIN = 'https://manufaktur.biz.id';

// Shared SSR Header HTML
const ssrHeaderHtml = `
<header style="background: #ffffff; border-bottom: 1px solid #E8E5E8; padding: 12px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
    <a href="${SITE_ORIGIN}/" style="font-size: 18px; font-weight: 800; color: #681C35; text-decoration: none;">
      WORLD FLIGHT SCHEDULE <span style="font-size: 11px; background: #681C35; color: white; padding: 2px 6px; border-radius: 4px;">CANADA</span>
    </a>
    <nav style="display: flex; gap: 16px; font-size: 13px; font-weight: 600; flex-wrap: wrap;">
      <a href="${SITE_ORIGIN}/" style="color: #681C35; text-decoration: none;">Home</a>
      <a href="${SITE_ORIGIN}/flights" style="color: #504e57; text-decoration: none;">Flight Schedules</a>
      <a href="${SITE_ORIGIN}/departures" style="color: #504e57; text-decoration: none;">Departures</a>
      <a href="${SITE_ORIGIN}/arrivals" style="color: #504e57; text-decoration: none;">Arrivals</a>
      <a href="${SITE_ORIGIN}/airports" style="color: #504e57; text-decoration: none;">Airports</a>
      <a href="${SITE_ORIGIN}/airlines" style="color: #504e57; text-decoration: none;">Airlines</a>
      <a href="${SITE_ORIGIN}/aircraft" style="color: #504e57; text-decoration: none;">Aircraft</a>
      <a href="${SITE_ORIGIN}/routes" style="color: #504e57; text-decoration: none;">Routes</a>
      <a href="${SITE_ORIGIN}/map" style="color: #059669; text-decoration: none;">Live Radar Map</a>
      <a href="${SITE_ORIGIN}/articles" style="color: #681C35; text-decoration: none; font-weight: 700;">Aviation News (20)</a>
      <a href="${SITE_ORIGIN}/sitemap" style="color: #504e57; text-decoration: none;">Site Index</a>
    </nav>
  </div>
</header>
`;

// Shared SSR Footer HTML
const ssrFooterHtml = `
<footer style="background: #1f1a1d; color: #b8b3b7; padding: 32px 20px; margin-top: 48px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; line-height: 1.6;">
  <div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px;">
    <div>
      <h4 style="color: #ffffff; font-weight: bold; margin-bottom: 8px;">WORLD FLIGHT SCHEDULE CANADA</h4>
      <p style="margin: 0 0 8px;">Dedicated Canadian Aerodrome Timetables, Flight Schedules &amp; Transponder ADS-B Tracking across NAV CANADA airspace.</p>
      <p style="color: #8c868b; font-size: 11px;">&copy; 2026 World Flight Schedule. Certified Canadian civil aviation data.</p>
    </div>
    <div>
      <h4 style="color: #ffffff; font-weight: bold; margin-bottom: 8px;">FLIGHT TOOLS</h4>
      <ul style="list-style: none; padding: 0; margin: 0; line-height: 1.8;">
        <li><a href="${SITE_ORIGIN}/flights" style="color: #b8b3b7; text-decoration: none;">Flight Schedules</a></li>
        <li><a href="${SITE_ORIGIN}/departures" style="color: #b8b3b7; text-decoration: none;">Airport Departures</a></li>
        <li><a href="${SITE_ORIGIN}/arrivals" style="color: #b8b3b7; text-decoration: none;">Airport Arrivals</a></li>
        <li><a href="${SITE_ORIGIN}/map" style="color: #b8b3b7; text-decoration: none;">Live Airspace Radar Map</a></li>
        <li><a href="${SITE_ORIGIN}/routes" style="color: #b8b3b7; text-decoration: none;">Flight Routes Explorer</a></li>
      </ul>
    </div>
    <div>
      <h4 style="color: #ffffff; font-weight: bold; margin-bottom: 8px;">DIRECTORIES</h4>
      <ul style="list-style: none; padding: 0; margin: 0; line-height: 1.8;">
        <li><a href="${SITE_ORIGIN}/airports" style="color: #b8b3b7; text-decoration: none;">Canadian &amp; Global Airports</a></li>
        <li><a href="${SITE_ORIGIN}/airlines" style="color: #b8b3b7; text-decoration: none;">Commercial Airlines</a></li>
        <li><a href="${SITE_ORIGIN}/aircraft" style="color: #b8b3b7; text-decoration: none;">Commercial Airliners</a></li>
        <li><a href="${SITE_ORIGIN}/articles" style="color: #ffffff; font-weight: bold; text-decoration: none;">Aviation Research Guides (20)</a></li>
        <li><a href="${SITE_ORIGIN}/sitemap" style="color: #b8b3b7; text-decoration: none;">HTML Site Index</a></li>
      </ul>
    </div>
    <div>
      <h4 style="color: #ffffff; font-weight: bold; margin-bottom: 8px;">EDITORIAL &amp; LEGAL</h4>
      <ul style="list-style: none; padding: 0; margin: 0; line-height: 1.8;">
        <li><a href="${SITE_ORIGIN}/about" style="color: #b8b3b7; text-decoration: none;">About Operations Desk</a></li>
        <li><a href="${SITE_ORIGIN}/contact" style="color: #b8b3b7; text-decoration: none;">Contact Editorial Desk</a></li>
        <li><a href="${SITE_ORIGIN}/privacy" style="color: #b8b3b7; text-decoration: none;">Privacy Policy</a></li>
        <li><a href="${SITE_ORIGIN}/terms" style="color: #b8b3b7; text-decoration: none;">Terms &amp; Conditions</a></li>
        <li><a href="${SITE_ORIGIN}/disclaimer" style="color: #b8b3b7; text-decoration: none;">Data Disclaimer</a></li>
        <li><a href="${SITE_ORIGIN}/editorial-policy" style="color: #b8b3b7; text-decoration: none;">Editorial Policy</a></li>
        <li style="margin-top: 6px;"><a href="${SITE_ORIGIN}/sitemap.xml" style="color: #f43f5e; text-decoration: underline;">XML Sitemap</a> &middot; <a href="${SITE_ORIGIN}/rss.xml" style="color: #f43f5e; text-decoration: underline;">RSS Feed</a></li>
      </ul>
    </div>
  </div>
</footer>
`;

// 1. PRE-RENDER HOMEPAGE (dist/index.html) WITH FULL SEMANTIC CONTENT & ALL 20 ARTICLES
console.log('Pre-rendering Homepage (dist/index.html)...');
const homeTitle = 'Canada Flight Schedules – Canadian Aerodromes Timetables & Radar Tracking';
const homeDesc = 'Explore Canadian flight schedules, aerodrome departures and arrivals across all 10 provinces and 3 territories, Air Canada, WestJet, Porter, and live ADS-B radar tracking.';
const homeCanonical = `${SITE_ORIGIN}/`;

const homeArticlesListHtml = CANADIAN_EDITORIAL_ARTICLES.map((art, idx) => `
  <article style="border: 1px solid #E8E5E8; border-radius: 8px; overflow: hidden; background: #ffffff; display: flex; flex-direction: column;">
    <div style="height: 180px; overflow: hidden; position: relative;">
      <img src="${art.featuredImage}" alt="${art.title}" style="width: 100%; height: 100%; object-fit: cover;" />
      <span style="position: absolute; top: 10px; left: 10px; background: #681C35; color: #ffffff; padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: 700;">${art.category}</span>
      ${art.publishedDate.includes('November 10') ? '<span style="position: absolute; top: 10px; right: 10px; background: #059669; color: #ffffff; padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: 800;">NEW · NOV 2026</span>' : ''}
    </div>
    <div style="padding: 16px; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
      <div>
        <div style="font-size: 11px; color: #777780; margin-bottom: 6px;">
          <span>${art.publishedDate}</span> &middot; <span>${art.readTimeMinutes} min read</span> &middot; <span>By ${art.author.name}</span>
        </div>
        <h3 style="font-size: 15px; font-weight: 700; color: #25232A; margin: 0 0 8px; line-height: 1.35;">
          <a href="${SITE_ORIGIN}/articles/${art.slug}" style="color: #25232A; text-decoration: none;">${art.title}</a>
        </h3>
        <p style="font-size: 12px; color: #504e57; line-height: 1.5; margin: 0 0 12px;">${art.excerpt}</p>
      </div>
      <a href="${SITE_ORIGIN}/articles/${art.slug}" style="font-size: 12px; font-weight: 700; color: #681C35; text-decoration: underline;">
        Read Complete Analysis &rarr;
      </a>
    </div>
  </article>
`).join('\n');

const homeHubAirportsHtml = CANADIAN_AIRPORTS.slice(0, 7).map(apt => `
  <a href="${SITE_ORIGIN}/airport/${apt.iata.toLowerCase()}" style="display: block; border: 1px solid #E8E5E8; padding: 12px; border-radius: 6px; text-decoration: none; color: #25232A; background: #FAF9FA;">
    <strong style="font-size: 16px; color: #681C35;">${apt.iata}</strong> - <span style="font-weight: 600;">${apt.city.split(',')[0]}</span>
    <div style="font-size: 11px; color: #777780; margin-top: 4px;">${apt.name} &bull; ${apt.icao}</div>
  </a>
`).join('\n');

const homeSsrBody = `
<div id="root">
  ${ssrHeaderHtml}
  <main style="max-width: 1200px; margin: 0 auto; padding: 24px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <section style="background: linear-gradient(135deg, #681C35, #431222); color: white; border-radius: 12px; padding: 36px 28px; margin-bottom: 32px;">
      <span style="font-size: 12px; font-weight: 700; color: #fcd34d; letter-spacing: 1px;">CANADA NATIONAL CIVIL AVIATION INFORMATION PORTAL</span>
      <h1 style="font-size: 32px; font-weight: 800; margin: 8px 0 12px; line-height: 1.2;">Canada Flight Schedules &amp; Airport Information</h1>
      <p style="font-size: 15px; color: rgba(255,255,255,0.9); max-width: 800px; line-height: 1.6; margin: 0 0 20px;">
        Explore all verified Canadian commercial flight timetables, airport departures, arrivals, carrier details, aircraft types, and transponder updates across NAV CANADA airspace.
      </p>
      <div style="display: flex; gap: 12px; flex-wrap: wrap;">
        <a href="${SITE_ORIGIN}/flights" style="background: #ffffff; color: #681C35; padding: 10px 18px; border-radius: 6px; font-weight: 700; font-size: 13px; text-decoration: none;">View Flight Timetables</a>
        <a href="${SITE_ORIGIN}/departures" style="background: rgba(255,255,255,0.15); color: #ffffff; padding: 10px 18px; border-radius: 6px; font-weight: 600; font-size: 13px; text-decoration: none;">Live Departures Board</a>
        <a href="${SITE_ORIGIN}/map" style="background: #059669; color: #ffffff; padding: 10px 18px; border-radius: 6px; font-weight: 700; font-size: 13px; text-decoration: none;">Live Radar Map</a>
        <a href="${SITE_ORIGIN}/articles" style="background: rgba(255,255,255,0.15); color: #ffffff; padding: 10px 18px; border-radius: 6px; font-weight: 600; font-size: 13px; text-decoration: none;">Aviation Research Guides (20)</a>
      </div>
    </section>

    <!-- SECTION: Major Canadian Hub Aerodromes -->
    <section style="margin-bottom: 40px;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #E8E5E8; padding-bottom: 8px; margin-bottom: 16px;">
        <h2 style="font-size: 20px; font-weight: 800; color: #25232A; margin: 0;">Major Canadian Hub Aerodrome Boards</h2>
        <a href="${SITE_ORIGIN}/airports" style="font-size: 13px; font-weight: 700; color: #681C35; text-decoration: none;">All Canadian Airports &rarr;</a>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px;">
        ${homeHubAirportsHtml}
      </div>
    </section>

    <!-- SECTION: All 20 Aviation Editorial Guides -->
    <section style="margin-bottom: 40px;" id="aviation-articles-index">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #E8E5E8; padding-bottom: 8px; margin-bottom: 20px; flex-wrap: wrap; gap: 8px;">
        <div>
          <h2 style="font-size: 22px; font-weight: 800; color: #25232A; margin: 0;">Canadian Aviation Technical Analyses &amp; Operations Guides (20 Available)</h2>
          <p style="font-size: 13px; color: #777780; margin: 4px 0 0;">
            Peer-reviewed research into pitot-static icing, Vancouver 2037 sea dike defenses, Dash 8-400 vs E195-E2 fleet economics, polar ETOPS-240, and Halifax cold-chain logistics.
          </p>
        </div>
        <a href="${SITE_ORIGIN}/articles" style="font-size: 13px; font-weight: 700; color: #681C35; text-decoration: underline;">
          Browse All 20 Guides
        </a>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(270px, 1fr)); gap: 20px;">
        ${homeArticlesListHtml}
      </div>
    </section>
  </main>
  ${ssrFooterHtml}
</div>
`;

let homeHtml = template;
homeHtml = homeHtml.replace(/<title>.*?<\/title>/i, `<title>${homeTitle}</title>`);
homeHtml = homeHtml.replace(/<meta name="description" content=".*?" \/>/i, `<meta name="description" content="${homeDesc}" />`);
homeHtml = homeHtml.replace(/<link rel="canonical".*?\/>/i, `<link rel="canonical" href="${homeCanonical}" id="canonical-url" />`);
homeHtml = homeHtml.replace(/<meta property="og:title" content=".*?" \/>/i, `<meta property="og:title" content="${homeTitle}" />`);
homeHtml = homeHtml.replace(/<meta property="og:description" content=".*?" \/>/i, `<meta property="og:description" content="${homeDesc}" />`);
homeHtml = homeHtml.replace(/<meta property="og:url" content=".*?" \/>/i, `<meta property="og:url" content="${homeCanonical}" />`);
homeHtml = homeHtml.replace('<div id="root"></div>', homeSsrBody);

fs.writeFileSync(BASE_HTML_PATH, homeHtml, 'utf-8');

// 2. PRE-RENDER ALL 20 INDIVIDUAL ARTICLE PAGES
console.log(`Pre-rendering ${CANADIAN_EDITORIAL_ARTICLES.length} Individual Articles...`);
CANADIAN_EDITORIAL_ARTICLES.forEach((art) => {
  const articleDir = path.join(DIST_DIR, 'articles', art.slug);
  ensureDirSync(articleDir);

  const canonicalUrl = `${SITE_ORIGIN}/articles/${art.slug}`;
  const pageTitle = `${art.title} – World Flight Schedule`;
  const metaDesc = art.excerpt.replace(/"/g, '&quot;');
  const articleBodyHtml = markdownToSimpleHtml(art.content);

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": art.title,
    "description": art.excerpt,
    "image": [
      art.featuredImage.startsWith('http') ? art.featuredImage : `${SITE_ORIGIN}${art.featuredImage}`
    ],
    "datePublished": "2026-11-10T08:00:00Z",
    "dateModified": "2026-11-11T12:00:00Z",
    "author": [{
      "@type": "Person",
      "name": art.author.name,
      "jobTitle": art.author.role
    }],
    "publisher": {
      "@type": "Organization",
      "name": "World Flight Schedule - Canada",
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_ORIGIN}/assets/images/hero_aviation_flight_1793637455661.jpg`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonicalUrl
    }
  });

  let articleHtml = template;
  articleHtml = articleHtml.replace(/<title>.*?<\/title>/i, `<title>${pageTitle}</title>`);
  articleHtml = articleHtml.replace(/<meta name="description" content=".*?" \/>/i, `<meta name="description" content="${metaDesc}" />`);
  articleHtml = articleHtml.replace(/<link rel="canonical".*?\/>/i, `<link rel="canonical" href="${canonicalUrl}" id="canonical-url" />`);
  articleHtml = articleHtml.replace(/<meta property="og:title" content=".*?" \/>/i, `<meta property="og:title" content="${pageTitle}" />`);
  articleHtml = articleHtml.replace(/<meta property="og:description" content=".*?" \/>/i, `<meta property="og:description" content="${metaDesc}" />`);
  articleHtml = articleHtml.replace(/<meta property="og:url" content=".*?" \/>/i, `<meta property="og:url" content="${canonicalUrl}" />`);
  articleHtml = articleHtml.replace(/<meta name="twitter:title" content=".*?" \/>/i, `<meta name="twitter:title" content="${pageTitle}" />`);
  articleHtml = articleHtml.replace(/<meta name="twitter:description" content=".*?" \/>/i, `<meta name="twitter:description" content="${metaDesc}" />`);

  articleHtml = articleHtml.replace(
    '</head>',
    `  <script type="application/ld+json">${jsonLd}</script>\n  </head>`
  );

  const preRenderedBody = `
    <div id="root">
      ${ssrHeaderHtml}
      <main style="max-width: 900px; margin: 0 auto; padding: 32px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <nav style="font-size: 12px; color: #777780; margin-bottom: 20px;">
          <a href="${SITE_ORIGIN}/" style="color: #681C35; text-decoration: none;">Home</a> &gt; 
          <a href="${SITE_ORIGIN}/articles" style="color: #681C35; text-decoration: none;">Aviation News</a> &gt; 
          <span>${art.category}</span>
        </nav>
        <span style="display: inline-block; background: #681C35; color: white; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: bold; margin-bottom: 12px;">${art.category}</span>
        <h1 style="font-size: 32px; font-weight: 800; color: #25232A; line-height: 1.25; margin-bottom: 16px;">${art.title}</h1>
        <p style="font-size: 16px; color: #504e57; line-height: 1.6; margin-bottom: 16px; font-weight: 500;">${art.excerpt}</p>
        <div style="font-size: 12px; color: #777780; padding: 12px 0; border-top: 1px solid #E8E5E8; border-bottom: 1px solid #E8E5E8; margin-bottom: 24px;">
          <span>By <strong>${art.author.name}</strong> (${art.author.role})</span> &middot; 
          <span>Published: ${art.publishedDate}</span> &middot; 
          <span>${art.readTimeMinutes} min read</span>
        </div>
        <img src="${art.featuredImage}" alt="${art.title}" style="width: 100%; max-height: 440px; object-fit: cover; border-radius: 8px; margin-bottom: 24px;" />
        <div class="article-content" style="font-size: 15px; color: #25232A;">
          ${articleBodyHtml}
        </div>

        <!-- Explore Related Research Guides -->
        <div style="margin-top: 48px; padding-top: 24px; border-top: 2px solid #E8E5E8;">
          <h3 style="font-size: 18px; font-weight: 800; color: #25232A; margin-bottom: 16px;">Continue Reading Aviation Research Guides</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px;">
            ${CANADIAN_EDITORIAL_ARTICLES.filter(a => a.slug !== art.slug).slice(0, 3).map(other => `
              <div style="border: 1px solid #E8E5E8; border-radius: 6px; padding: 14px; background: #FAF9FA;">
                <span style="font-size: 10px; font-weight: 700; color: #681C35;">${other.category}</span>
                <h4 style="font-size: 13px; font-weight: 700; margin: 4px 0 8px; line-height: 1.35;">
                  <a href="${SITE_ORIGIN}/articles/${other.slug}" style="color: #25232A; text-decoration: none;">${other.title}</a>
                </h4>
                <a href="${SITE_ORIGIN}/articles/${other.slug}" style="font-size: 11px; font-weight: 700; color: #681C35; text-decoration: underline;">Read Analysis &rarr;</a>
              </div>
            `).join('\n')}
          </div>
        </div>
      </main>
      ${ssrFooterHtml}
    </div>
  `;

  articleHtml = articleHtml.replace('<div id="root"></div>', preRenderedBody);

  fs.writeFileSync(path.join(articleDir, 'index.html'), articleHtml, 'utf-8');
  fs.writeFileSync(path.join(DIST_DIR, 'articles', `${art.slug}.html`), articleHtml, 'utf-8');
});

// 3. PRE-RENDER ARTICLES DIRECTORY (dist/articles/index.html)
console.log('Pre-rendering Articles Directory (dist/articles/index.html)...');
const articlesDir = path.join(DIST_DIR, 'articles');
ensureDirSync(articlesDir);
const articlesDirectoryTitle = 'Aviation News & Technical Operations Guides – World Flight Schedule';
const articlesDirectoryDesc = 'In-depth 1,000+ word aviation research guides covering winter de-icing holdover times, polar radar, aerodynamics, and passenger rights.';
const articlesDirectoryCanonical = `${SITE_ORIGIN}/articles`;

const articlesDirectoryBody = `
<div id="root">
  ${ssrHeaderHtml}
  <main style="max-width: 1200px; margin: 0 auto; padding: 32px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <div style="border-bottom: 2px solid #E8E5E8; padding-bottom: 16px; margin-bottom: 28px;">
      <span style="font-size: 11px; font-weight: 700; color: #681C35; letter-spacing: 1px;">CANADIAN AVIATION EDITORIAL &amp; TECHNICAL ANALYSES</span>
      <h1 style="font-size: 32px; font-weight: 800; color: #25232A; margin: 6px 0 10px;">Canadian Aviation News &amp; Operational Insights</h1>
      <p style="font-size: 14px; color: #504e57; max-width: 850px; line-height: 1.6; margin: 0;">
        Explore all 20 comprehensive aviation research guides written by aviation safety inspectors, avionics engineers, and airline economists.
      </p>
    </div>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px;">
      ${homeArticlesListHtml}
    </div>
  </main>
  ${ssrFooterHtml}
</div>
`;

let articlesDirectoryHtml = template;
articlesDirectoryHtml = articlesDirectoryHtml.replace(/<title>.*?<\/title>/i, `<title>${articlesDirectoryTitle}</title>`);
articlesDirectoryHtml = articlesDirectoryHtml.replace(/<meta name="description" content=".*?" \/>/i, `<meta name="description" content="${articlesDirectoryDesc}" />`);
articlesDirectoryHtml = articlesDirectoryHtml.replace(/<link rel="canonical".*?\/>/i, `<link rel="canonical" href="${articlesDirectoryCanonical}" id="canonical-url" />`);
articlesDirectoryHtml = articlesDirectoryHtml.replace('<div id="root"></div>', articlesDirectoryBody);
fs.writeFileSync(path.join(articlesDir, 'index.html'), articlesDirectoryHtml, 'utf-8');
fs.writeFileSync(path.join(DIST_DIR, 'articles.html'), articlesDirectoryHtml, 'utf-8');

// 4. PRE-RENDER HTML SITEMAP (dist/sitemap/index.html)
console.log('Pre-rendering HTML Sitemap (dist/sitemap/index.html)...');
const sitemapDir = path.join(DIST_DIR, 'sitemap');
ensureDirSync(sitemapDir);
const sitemapPageTitle = 'HTML Sitemap & Complete Site Index – World Flight Schedule';
const sitemapPageDesc = 'Complete index of all Canadian flight timetables, 20 aviation research guides, airport boards, carrier fleets, and compliance policies.';
const sitemapPageCanonical = `${SITE_ORIGIN}/sitemap`;

const sitemapBody = `
<div id="root">
  ${ssrHeaderHtml}
  <main style="max-width: 1200px; margin: 0 auto; padding: 32px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <div style="border-bottom: 2px solid #E8E5E8; padding-bottom: 16px; margin-bottom: 28px;">
      <h1 style="font-size: 32px; font-weight: 800; color: #25232A; margin: 0 0 8px;">HTML Sitemap &amp; Navigation Tree</h1>
      <p style="font-size: 14px; color: #504e57; margin: 0;">Comprehensive index of all 65 pages across World Flight Schedule Canada.</p>
    </div>

    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 32px;">
      <div>
        <h2 style="font-size: 20px; font-weight: 800; color: #681C35; border-bottom: 1px solid #E8E5E8; padding-bottom: 8px; margin-bottom: 16px;">
          All 20 Aviation Research Whitepapers
        </h2>
        <ul style="line-height: 2; padding-left: 20px; font-size: 13px;">
          ${CANADIAN_EDITORIAL_ARTICLES.map(a => `
            <li><a href="${SITE_ORIGIN}/articles/${a.slug}" style="color: #25232A; font-weight: 600; text-decoration: underline;">${a.title}</a> &mdash; <span style="color: #777780;">${a.category}</span></li>
          `).join('\n')}
        </ul>
      </div>

      <div>
        <h2 style="font-size: 20px; font-weight: 800; color: #681C35; border-bottom: 1px solid #E8E5E8; padding-bottom: 8px; margin-bottom: 16px;">
          Operations &amp; Directories
        </h2>
        <ul style="line-height: 2; padding-left: 20px; font-size: 13px;">
          <li><a href="${SITE_ORIGIN}/" style="color: #25232A; font-weight: 600;">Home Page</a></li>
          <li><a href="${SITE_ORIGIN}/flights" style="color: #25232A; font-weight: 600;">Flight Schedules</a></li>
          <li><a href="${SITE_ORIGIN}/departures" style="color: #25232A; font-weight: 600;">Airport Departures</a></li>
          <li><a href="${SITE_ORIGIN}/arrivals" style="color: #25232A; font-weight: 600;">Airport Arrivals</a></li>
          <li><a href="${SITE_ORIGIN}/airports" style="color: #25232A; font-weight: 600;">Airports Directory</a></li>
          <li><a href="${SITE_ORIGIN}/airlines" style="color: #25232A; font-weight: 600;">Airlines Directory</a></li>
          <li><a href="${SITE_ORIGIN}/aircraft" style="color: #25232A; font-weight: 600;">Aircraft Directory</a></li>
          <li><a href="${SITE_ORIGIN}/routes" style="color: #25232A; font-weight: 600;">Routes Explorer</a></li>
          <li><a href="${SITE_ORIGIN}/map" style="color: #25232A; font-weight: 600;">Live Airspace Radar Map</a></li>
          <li><a href="${SITE_ORIGIN}/about" style="color: #25232A; font-weight: 600;">About Us</a></li>
          <li><a href="${SITE_ORIGIN}/contact" style="color: #25232A; font-weight: 600;">Contact Desk</a></li>
          <li><a href="${SITE_ORIGIN}/privacy" style="color: #25232A; font-weight: 600;">Privacy Policy</a></li>
          <li><a href="${SITE_ORIGIN}/terms" style="color: #25232A; font-weight: 600;">Terms &amp; Conditions</a></li>
          <li><a href="${SITE_ORIGIN}/disclaimer" style="color: #25232A; font-weight: 600;">Data Disclaimer</a></li>
          <li><a href="${SITE_ORIGIN}/editorial-policy" style="color: #25232A; font-weight: 600;">Editorial Policy</a></li>
        </ul>
      </div>
    </div>
  </main>
  ${ssrFooterHtml}
</div>
`;

let sitemapHtml = template;
sitemapHtml = sitemapHtml.replace(/<title>.*?<\/title>/i, `<title>${sitemapPageTitle}</title>`);
sitemapHtml = sitemapHtml.replace(/<meta name="description" content=".*?" \/>/i, `<meta name="description" content="${sitemapPageDesc}" />`);
sitemapHtml = sitemapHtml.replace(/<link rel="canonical".*?\/>/i, `<link rel="canonical" href="${sitemapPageCanonical}" id="canonical-url" />`);
sitemapHtml = sitemapHtml.replace('<div id="root"></div>', sitemapBody);
fs.writeFileSync(path.join(sitemapDir, 'index.html'), sitemapHtml, 'utf-8');
fs.writeFileSync(path.join(DIST_DIR, 'sitemap.html'), sitemapHtml, 'utf-8');

// 5. PRE-RENDER OTHER MAIN STATIC ROUTES
const otherRoutes = [
  { path: 'flights', title: 'Global Flight Schedules Today – World Flight Schedule', desc: 'Real-time Canadian commercial flight timetables and carrier statuses across NAV CANADA airspace.' },
  { path: 'departures', title: 'Airport Live Departures Board – World Flight Schedule', desc: 'Real-time departures board for Canadian international and regional airports.' },
  { path: 'arrivals', title: 'Airport Live Arrivals Board – World Flight Schedule', desc: 'Live inbound arrivals, gate numbers, and baggage claim carousels across Canadian aerodromes.' },
  { path: 'airports', title: 'Global Airport Directory (IATA/ICAO) – World Flight Schedule', desc: 'Comprehensive directory of Canadian and international airports with runway dimensions and terminal specs.' },
  { path: 'airlines', title: 'International Airline Directory – World Flight Schedule', desc: 'Fleet specifications, active routes, and daily scheduled operations for Air Canada, WestJet, Porter, and international airlines.' },
  { path: 'aircraft', title: 'Commercial Aircraft Information Directory – World Flight Schedule', desc: 'Technical specifications, passenger capacities, and cruising speeds for commercial airliners.' },
  { path: 'routes', title: 'Worldwide Flight Routes Explorer – World Flight Schedule', desc: 'Discover major Canadian and transcontinental commercial air routes and typical flight durations.' },
  { path: 'map', title: 'Live Aircraft Radar & Transponder Map – World Flight Schedule', desc: 'Live Canadian airspace radar tracking with Mode-S ADS-B transponder altitude and ground speed vectors.' },
  { path: 'about', title: 'About Us – World Flight Schedule', desc: 'Learn about World Flight Schedule and our certified Canadian civil aviation timetable and transponder feeds.' },
  { path: 'contact', title: 'Contact Operations & Editorial Desk – World Flight Schedule', desc: 'Contact our aviation operations desk and editorial fact-checking department.' },
  { path: 'privacy', title: 'Privacy Policy – World Flight Schedule', desc: 'Privacy policy and data governance practices for World Flight Schedule.' },
  { path: 'terms', title: 'Terms and Conditions – World Flight Schedule', desc: 'Terms and conditions for utilizing World Flight Schedule data and timetables.' },
  { path: 'disclaimer', title: 'Aviation Data Accuracy Disclaimer – World Flight Schedule', desc: 'Aviation data accuracy statement and flight operational notice.' },
  { path: 'editorial-policy', title: 'Editorial Policy & Fact-Checking – World Flight Schedule', desc: 'Our rigorous factual standards and verification policies in compliance with Transport Canada directives.' }
];

otherRoutes.forEach(r => {
  const routeDir = path.join(DIST_DIR, r.path);
  ensureDirSync(routeDir);

  const canonicalUrl = `${SITE_ORIGIN}/${r.path}`;
  let routeHtml = template;

  routeHtml = routeHtml.replace(/<title>.*?<\/title>/i, `<title>${r.title}</title>`);
  routeHtml = routeHtml.replace(/<meta name="description" content=".*?" \/>/i, `<meta name="description" content="${r.desc}" />`);
  routeHtml = routeHtml.replace(/<link rel="canonical".*?\/>/i, `<link rel="canonical" href="${canonicalUrl}" id="canonical-url" />`);
  routeHtml = routeHtml.replace(/<meta property="og:title" content=".*?" \/>/i, `<meta property="og:title" content="${r.title}" />`);
  routeHtml = routeHtml.replace(/<meta property="og:description" content=".*?" \/>/i, `<meta property="og:description" content="${r.desc}" />`);
  routeHtml = routeHtml.replace(/<meta property="og:url" content=".*?" \/>/i, `<meta property="og:url" content="${canonicalUrl}" />`);
  routeHtml = routeHtml.replace(/<meta name="twitter:title" content=".*?" \/>/i, `<meta name="twitter:title" content="${r.title}" />`);
  routeHtml = routeHtml.replace(/<meta name="twitter:description" content=".*?" \/>/i, `<meta name="twitter:description" content="${r.desc}" />`);

  const genericSsrBody = `
    <div id="root">
      ${ssrHeaderHtml}
      <main style="max-width: 1000px; margin: 0 auto; padding: 32px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <h1 style="font-size: 28px; font-weight: 800; color: #25232A; margin: 0 0 12px;">${r.title}</h1>
        <p style="font-size: 15px; color: #504e57; line-height: 1.6; margin: 0 0 24px;">${r.desc}</p>
        <div style="border: 1px solid #E8E5E8; border-radius: 8px; padding: 20px; background: #ffffff;">
          <p style="font-size: 13px; color: #777780; margin: 0;">Live interactive application is loading... For certified operational data, please visit our <a href="${SITE_ORIGIN}/articles" style="color: #681C35; font-weight: 700;">Aviation Research Guides</a> or review the <a href="${SITE_ORIGIN}/sitemap" style="color: #681C35; font-weight: 700;">Complete Site Index</a>.</p>
        </div>
      </main>
      ${ssrFooterHtml}
    </div>
  `;

  routeHtml = routeHtml.replace('<div id="root"></div>', genericSsrBody);

  fs.writeFileSync(path.join(routeDir, 'index.html'), routeHtml, 'utf-8');
  fs.writeFileSync(path.join(DIST_DIR, `${r.path}.html`), routeHtml, 'utf-8');
});

// 6. PRE-RENDER HUB AIRPORTS
const hubAirports = [
  { code: 'YYZ', name: 'Toronto Pearson International Airport', city: 'Toronto, Ontario' },
  { code: 'YVR', name: 'Vancouver International Airport', city: 'Vancouver, British Columbia' },
  { code: 'YUL', name: 'Montréal-Trudeau International Airport', city: 'Montréal, Québec' },
  { code: 'YYC', name: 'Calgary International Airport', city: 'Calgary, Alberta' },
  { code: 'YOW', name: 'Ottawa Macdonald-Cartier International Airport', city: 'Ottawa, Ontario' },
  { code: 'YHZ', name: 'Halifax Stanfield International Airport', city: 'Halifax, Nova Scotia' },
  { code: 'YEG', name: 'Edmonton International Airport', city: 'Edmonton, Alberta' }
];

hubAirports.forEach(apt => {
  const aptDir = path.join(DIST_DIR, 'airport', apt.code);
  ensureDirSync(aptDir);
  const canonicalUrl = `${SITE_ORIGIN}/airport/${apt.code}`;
  const title = `${apt.code} – ${apt.name} Live Flight Board & Aerodrome Info`;
  const desc = `Live flight departures, arrivals, terminal gates, and weather conditions for ${apt.name} (${apt.code}) in ${apt.city}.`;

  let aptHtml = template;
  aptHtml = aptHtml.replace(/<title>.*?<\/title>/i, `<title>${title}</title>`);
  aptHtml = aptHtml.replace(/<meta name="description" content=".*?" \/>/i, `<meta name="description" content="${desc}" />`);
  aptHtml = aptHtml.replace(/<link rel="canonical".*?\/>/i, `<link rel="canonical" href="${canonicalUrl}" id="canonical-url" />`);
  aptHtml = aptHtml.replace(/<meta property="og:title" content=".*?" \/>/i, `<meta property="og:title" content="${title}" />`);
  aptHtml = aptHtml.replace(/<meta property="og:description" content=".*?" \/>/i, `<meta property="og:description" content="${desc}" />`);
  aptHtml = aptHtml.replace(/<meta property="og:url" content=".*?" \/>/i, `<meta property="og:url" content="${canonicalUrl}" />`);

  const aptBody = `
    <div id="root">
      ${ssrHeaderHtml}
      <main style="max-width: 1000px; margin: 0 auto; padding: 32px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <span style="font-size: 12px; font-weight: 700; color: #681C35;">CANADIAN AERODROME TELEMETRY</span>
        <h1 style="font-size: 28px; font-weight: 800; color: #25232A; margin: 6px 0 12px;">${apt.name} (${apt.code})</h1>
        <p style="font-size: 15px; color: #504e57; margin: 0 0 24px;">Located in ${apt.city}. Live scheduled passenger departures, international arrivals, and NAV CANADA slot coordination.</p>
        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <a href="${SITE_ORIGIN}/departures?airport=${apt.code}" style="background: #681C35; color: white; padding: 8px 16px; border-radius: 4px; font-weight: 600; font-size: 13px; text-decoration: none;">View ${apt.code} Departures</a>
          <a href="${SITE_ORIGIN}/arrivals?airport=${apt.code}" style="background: #504e57; color: white; padding: 8px 16px; border-radius: 4px; font-weight: 600; font-size: 13px; text-decoration: none;">View ${apt.code} Arrivals</a>
          <a href="${SITE_ORIGIN}/map" style="background: #059669; color: white; padding: 8px 16px; border-radius: 4px; font-weight: 600; font-size: 13px; text-decoration: none;">Live Airspace Radar</a>
        </div>
      </main>
      ${ssrFooterHtml}
    </div>
  `;

  aptHtml = aptHtml.replace('<div id="root"></div>', aptBody);

  fs.writeFileSync(path.join(aptDir, 'index.html'), aptHtml, 'utf-8');
  fs.writeFileSync(path.join(DIST_DIR, 'airport', `${apt.code}.html`), aptHtml, 'utf-8');
});

// 7. PRE-RENDER MAJOR AIRLINES
const airlines = [
  { code: 'AC', name: 'Air Canada', hub: 'Toronto Pearson (YYZ)' },
  { code: 'WS', name: 'WestJet', hub: 'Calgary International (YYC)' },
  { code: 'PD', name: 'Porter Airlines', hub: 'Billy Bishop Toronto (YTZ) / YYZ' },
  { code: 'TS', name: 'Air Transat', hub: 'Montréal-Trudeau (YUL)' }
];

airlines.forEach(al => {
  const alDir = path.join(DIST_DIR, 'airline', al.code);
  ensureDirSync(alDir);
  const canonicalUrl = `${SITE_ORIGIN}/airline/${al.code}`;
  const title = `${al.name} (${al.code}) Fleet & Daily Flight Schedules`;
  const desc = `Track active flights, fleet specifications, and route networks for ${al.name} (${al.code}), operating out of ${al.hub}.`;

  let alHtml = template;
  alHtml = alHtml.replace(/<title>.*?<\/title>/i, `<title>${title}</title>`);
  alHtml = alHtml.replace(/<meta name="description" content=".*?" \/>/i, `<meta name="description" content="${desc}" />`);
  alHtml = alHtml.replace(/<link rel="canonical".*?\/>/i, `<link rel="canonical" href="${canonicalUrl}" id="canonical-url" />`);
  alHtml = alHtml.replace(/<meta property="og:title" content=".*?" \/>/i, `<meta property="og:title" content="${title}" />`);
  alHtml = alHtml.replace(/<meta property="og:description" content=".*?" \/>/i, `<meta property="og:description" content="${desc}" />`);
  alHtml = alHtml.replace(/<meta property="og:url" content=".*?" \/>/i, `<meta property="og:url" content="${canonicalUrl}" />`);

  const alBody = `
    <div id="root">
      ${ssrHeaderHtml}
      <main style="max-width: 1000px; margin: 0 auto; padding: 32px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <span style="font-size: 12px; font-weight: 700; color: #681C35;">CANADIAN AIRLINE PROFILE</span>
        <h1 style="font-size: 28px; font-weight: 800; color: #25232A; margin: 6px 0 12px;">${al.name} (${al.code})</h1>
        <p style="font-size: 15px; color: #504e57; margin: 0 0 24px;">Primary Operations Hub: ${al.hub}. Track active scheduled flight numbers and fleet aircraft.</p>
        <div style="display: flex; gap: 12px;">
          <a href="${SITE_ORIGIN}/flights?airline=${al.code}" style="background: #681C35; color: white; padding: 8px 16px; border-radius: 4px; font-weight: 600; font-size: 13px; text-decoration: none;">View ${al.code} Scheduled Flights</a>
          <a href="${SITE_ORIGIN}/articles" style="background: #FAF9FA; border: 1px solid #E8E5E8; color: #25232A; padding: 8px 16px; border-radius: 4px; font-weight: 600; font-size: 13px; text-decoration: none;">Aviation Research Guides</a>
        </div>
      </main>
      ${ssrFooterHtml}
    </div>
  `;

  alHtml = alHtml.replace('<div id="root"></div>', alBody);

  fs.writeFileSync(path.join(alDir, 'index.html'), alHtml, 'utf-8');
  fs.writeFileSync(path.join(DIST_DIR, 'airline', `${al.code}.html`), alHtml, 'utf-8');
});

// 8. GENERATE STATIC SITEMAP.XML, RSS.XML, AND FEED.XML
const sitemap = aviationService.generateXmlSitemap(SITE_ORIGIN);
fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemap, 'utf-8');
fs.writeFileSync(path.join(process.cwd(), 'public', 'sitemap.xml'), sitemap, 'utf-8');

const buildDate = new Date().toUTCString();
const itemsXml = CANADIAN_EDITORIAL_ARTICLES.map(art => `    <item>
      <title><![CDATA[${art.title}]]></title>
      <link>${SITE_ORIGIN}/articles/${art.slug}</link>
      <guid isPermaLink="true">${SITE_ORIGIN}/articles/${art.slug}</guid>
      <description><![CDATA[${art.excerpt}]]></description>
      <category>${art.category}</category>
      <author>anissagustiawati@gmail.com (${art.author.name})</author>
      <pubDate>${new Date().toUTCString()}</pubDate>
    </item>`).join('\n');

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Canada Flight Schedules - Canadian Aviation News &amp; Flight Operations</title>
    <link>${SITE_ORIGIN}</link>
    <description>Daily updated Canadian civil aviation schedules, operational safety briefings, aerodrome procedures, and airline fleet telemetry.</description>
    <language>en-ca</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${SITE_ORIGIN}/rss.xml" rel="self" type="application/rss+xml" />
${itemsXml}
  </channel>
</rss>`;

fs.writeFileSync(path.join(DIST_DIR, 'rss.xml'), rss, 'utf-8');
fs.writeFileSync(path.join(process.cwd(), 'public', 'rss.xml'), rss, 'utf-8');
fs.writeFileSync(path.join(DIST_DIR, 'feed.xml'), rss, 'utf-8');
fs.writeFileSync(path.join(process.cwd(), 'public', 'feed.xml'), rss, 'utf-8');

// Ensure verification tokens and ads files exist in dist/
const publicFilesToSync = [
  'sitemap_index.xml',
  'ad-300x250.html',
  'ads.txt',
  'robots.txt',
  'indexnow-key.txt',
  'c743812984e94112b36e89710f609e2a.txt'
];

publicFilesToSync.forEach(file => {
  const srcPath = path.join(process.cwd(), 'public', file);
  const dstPath = path.join(DIST_DIR, file);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, dstPath);
  }
});

console.log(`Pre-render complete! Pre-rendered Homepage (dist/index.html), ${CANADIAN_EDITORIAL_ARTICLES.length} individual articles, /articles directory, /sitemap directory, ${otherRoutes.length} main routes, ${hubAirports.length} airports, and ${airlines.length} airlines with complete SSR bodies and exact canonical tags.`);
