import fs from 'fs';
import path from 'path';
import { CANADIAN_EDITORIAL_ARTICLES } from '../src/data/canadianArticles';
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

console.log('Starting static pre-render for Google Search Console & SEO indexing...');

// 1. Pre-render All 11 Articles
CANADIAN_EDITORIAL_ARTICLES.forEach((art) => {
  const articleDir = path.join(DIST_DIR, 'articles', art.slug);
  ensureDirSync(articleDir);

  const canonicalUrl = `https://manufaktur.biz.id/articles/${art.slug}`;
  const pageTitle = `${art.title} – World Flight Schedule`;
  const metaDesc = art.excerpt.replace(/"/g, '&quot;');
  const articleBodyHtml = markdownToSimpleHtml(art.content);

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": art.title,
    "description": art.excerpt,
    "image": [
      `https://manufaktur.biz.id${art.featuredImage}`
    ],
    "datePublished": "2026-11-02T08:00:00Z",
    "dateModified": "2026-11-07T12:00:00Z",
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
        "url": "https://manufaktur.biz.id/assets/images/hero_aviation_flight_1793637455661.jpg"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonicalUrl
    }
  });

  let articleHtml = template;

  // Replace Title
  articleHtml = articleHtml.replace(
    /<title>.*?<\/title>/i,
    `<title>${pageTitle}</title>`
  );

  // Replace Meta Description
  articleHtml = articleHtml.replace(
    /<meta name="description" content=".*?" \/>/i,
    `<meta name="description" content="${metaDesc}" />`
  );

  // Replace Canonical Link
  articleHtml = articleHtml.replace(
    /<link rel="canonical".*?\/>/i,
    `<link rel="canonical" href="${canonicalUrl}" id="canonical-url" />`
  );

  // Replace OpenGraph
  articleHtml = articleHtml.replace(
    /<meta property="og:title" content=".*?" \/>/i,
    `<meta property="og:title" content="${pageTitle}" />`
  );
  articleHtml = articleHtml.replace(
    /<meta property="og:description" content=".*?" \/>/i,
    `<meta property="og:description" content="${metaDesc}" />`
  );
  articleHtml = articleHtml.replace(
    /<meta property="og:url" content=".*?" \/>/i,
    `<meta property="og:url" content="${canonicalUrl}" />`
  );

  // Replace Twitter
  articleHtml = articleHtml.replace(
    /<meta name="twitter:title" content=".*?" \/>/i,
    `<meta name="twitter:title" content="${pageTitle}" />`
  );
  articleHtml = articleHtml.replace(
    /<meta name="twitter:description" content=".*?" \/>/i,
    `<meta name="twitter:description" content="${metaDesc}" />`
  );

  // Inject Article JSON-LD Schema
  articleHtml = articleHtml.replace(
    '</head>',
    `  <script type="application/ld+json">${jsonLd}</script>\n  </head>`
  );

  // Inject Full Server-Side Pre-rendered Content inside #root for Instant Googlebot Scraping
  const preRenderedBody = `
    <div id="root">
      <div style="max-width: 900px; margin: 0 auto; padding: 32px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <nav style="font-size: 12px; color: #777780; margin-bottom: 20px;">
          <a href="https://manufaktur.biz.id" style="color: #681C35; text-decoration: none;">Home</a> &gt; 
          <a href="https://manufaktur.biz.id/articles" style="color: #681C35; text-decoration: none;">Aviation News</a> &gt; 
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
      </div>
    </div>
  `;

  articleHtml = articleHtml.replace('<div id="root"></div>', preRenderedBody);

  // Write both /articles/slug/index.html and /articles/slug.html for complete Vercel compatibility
  fs.writeFileSync(path.join(articleDir, 'index.html'), articleHtml, 'utf-8');
  fs.writeFileSync(path.join(DIST_DIR, 'articles', `${art.slug}.html`), articleHtml, 'utf-8');
});

// 2. Pre-render Main Static Routes
const mainRoutes = [
  { path: 'flights', title: 'Global Flight Schedules Today – World Flight Schedule', desc: 'Real-time Canadian commercial flight timetables and carrier statuses across NAV CANADA airspace.' },
  { path: 'departures', title: 'Airport Live Departures Board – World Flight Schedule', desc: 'Real-time departures board for Canadian international and regional airports.' },
  { path: 'arrivals', title: 'Airport Live Arrivals Board – World Flight Schedule', desc: 'Live inbound arrivals, gate numbers, and baggage claim carousels across Canadian aerodromes.' },
  { path: 'airports', title: 'Global Airport Directory (IATA/ICAO) – World Flight Schedule', desc: 'Comprehensive directory of Canadian and international airports with runway dimensions and terminal specs.' },
  { path: 'airlines', title: 'International Airline Directory – World Flight Schedule', desc: 'Fleet specifications, active routes, and daily scheduled operations for Air Canada, WestJet, Porter, and international airlines.' },
  { path: 'aircraft', title: 'Commercial Aircraft Information Directory – World Flight Schedule', desc: 'Technical specifications, passenger capacities, and cruising speeds for commercial airliners.' },
  { path: 'routes', title: 'Worldwide Flight Routes Explorer – World Flight Schedule', desc: 'Discover major Canadian and transcontinental commercial air routes and typical flight durations.' },
  { path: 'map', title: 'Live Aircraft Radar & Transponder Map – World Flight Schedule', desc: 'Live Canadian airspace radar tracking with Mode-S ADS-B transponder altitude and ground speed vectors.' },
  { path: 'articles', title: 'Aviation News & Technical Operations Guides – World Flight Schedule', desc: 'In-depth 1,000+ word aviation research guides covering winter de-icing holdover times, polar radar, and passenger rights.' },
  { path: 'about', title: 'About Us – World Flight Schedule', desc: 'Learn about World Flight Schedule and our certified Canadian civil aviation timetable and transponder feeds.' },
  { path: 'contact', title: 'Contact Operations & Editorial Desk – World Flight Schedule', desc: 'Contact our aviation operations desk and editorial fact-checking department.' },
  { path: 'privacy', title: 'Privacy Policy – World Flight Schedule', desc: 'Privacy policy and data governance practices for World Flight Schedule.' },
  { path: 'terms', title: 'Terms and Conditions – World Flight Schedule', desc: 'Terms and conditions for utilizing World Flight Schedule data and timetables.' },
  { path: 'disclaimer', title: 'Aviation Data Accuracy Disclaimer – World Flight Schedule', desc: 'Aviation data accuracy statement and flight operational notice.' },
  { path: 'editorial-policy', title: 'Editorial Policy & Fact-Checking – World Flight Schedule', desc: 'Our rigorous factual standards and verification policies in compliance with Transport Canada directives.' }
];

mainRoutes.forEach(r => {
  const routeDir = path.join(DIST_DIR, r.path);
  ensureDirSync(routeDir);

  const canonicalUrl = `https://manufaktur.biz.id/${r.path}`;
  let routeHtml = template;

  routeHtml = routeHtml.replace(/<title>.*?<\/title>/i, `<title>${r.title}</title>`);
  routeHtml = routeHtml.replace(/<meta name="description" content=".*?" \/>/i, `<meta name="description" content="${r.desc}" />`);
  routeHtml = routeHtml.replace(/<link rel="canonical".*?\/>/i, `<link rel="canonical" href="${canonicalUrl}" id="canonical-url" />`);
  routeHtml = routeHtml.replace(/<meta property="og:title" content=".*?" \/>/i, `<meta property="og:title" content="${r.title}" />`);
  routeHtml = routeHtml.replace(/<meta property="og:description" content=".*?" \/>/i, `<meta property="og:description" content="${r.desc}" />`);
  routeHtml = routeHtml.replace(/<meta property="og:url" content=".*?" \/>/i, `<meta property="og:url" content="${canonicalUrl}" />`);
  routeHtml = routeHtml.replace(/<meta name="twitter:title" content=".*?" \/>/i, `<meta name="twitter:title" content="${r.title}" />`);
  routeHtml = routeHtml.replace(/<meta name="twitter:description" content=".*?" \/>/i, `<meta name="twitter:description" content="${r.desc}" />`);

  fs.writeFileSync(path.join(routeDir, 'index.html'), routeHtml, 'utf-8');
  fs.writeFileSync(path.join(DIST_DIR, `${r.path}.html`), routeHtml, 'utf-8');
});

// 3. Pre-render Hub Airports
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
  const canonicalUrl = `https://manufaktur.biz.id/airport/${apt.code}`;
  const title = `${apt.code} – ${apt.name} Live Flight Board & Aerodrome Info`;
  const desc = `Live flight departures, arrivals, terminal gates, and weather conditions for ${apt.name} (${apt.code}) in ${apt.city}.`;

  let aptHtml = template;
  aptHtml = aptHtml.replace(/<title>.*?<\/title>/i, `<title>${title}</title>`);
  aptHtml = aptHtml.replace(/<meta name="description" content=".*?" \/>/i, `<meta name="description" content="${desc}" />`);
  aptHtml = aptHtml.replace(/<link rel="canonical".*?\/>/i, `<link rel="canonical" href="${canonicalUrl}" id="canonical-url" />`);
  aptHtml = aptHtml.replace(/<meta property="og:title" content=".*?" \/>/i, `<meta property="og:title" content="${title}" />`);
  aptHtml = aptHtml.replace(/<meta property="og:description" content=".*?" \/>/i, `<meta property="og:description" content="${desc}" />`);
  aptHtml = aptHtml.replace(/<meta property="og:url" content=".*?" \/>/i, `<meta property="og:url" content="${canonicalUrl}" />`);

  fs.writeFileSync(path.join(aptDir, 'index.html'), aptHtml, 'utf-8');
  fs.writeFileSync(path.join(DIST_DIR, 'airport', `${apt.code}.html`), aptHtml, 'utf-8');
});

// 4. Pre-render Major Airlines
const airlines = [
  { code: 'AC', name: 'Air Canada', hub: 'Toronto Pearson (YYZ)' },
  { code: 'WS', name: 'WestJet', hub: 'Calgary International (YYC)' },
  { code: 'PD', name: 'Porter Airlines', hub: 'Billy Bishop Toronto (YTZ) / YYZ' },
  { code: 'TS', name: 'Air Transat', hub: 'Montréal-Trudeau (YUL)' }
];

airlines.forEach(al => {
  const alDir = path.join(DIST_DIR, 'airline', al.code);
  ensureDirSync(alDir);
  const canonicalUrl = `https://manufaktur.biz.id/airline/${al.code}`;
  const title = `${al.name} (${al.code}) Fleet & Daily Flight Schedules`;
  const desc = `Track active flights, fleet specifications, and route networks for ${al.name} (${al.code}), operating out of ${al.hub}.`;

  let alHtml = template;
  alHtml = alHtml.replace(/<title>.*?<\/title>/i, `<title>${title}</title>`);
  alHtml = alHtml.replace(/<meta name="description" content=".*?" \/>/i, `<meta name="description" content="${desc}" />`);
  alHtml = alHtml.replace(/<link rel="canonical".*?\/>/i, `<link rel="canonical" href="${canonicalUrl}" id="canonical-url" />`);
  alHtml = alHtml.replace(/<meta property="og:title" content=".*?" \/>/i, `<meta property="og:title" content="${title}" />`);
  alHtml = alHtml.replace(/<meta property="og:description" content=".*?" \/>/i, `<meta property="og:description" content="${desc}" />`);
  alHtml = alHtml.replace(/<meta property="og:url" content=".*?" \/>/i, `<meta property="og:url" content="${canonicalUrl}" />`);

  fs.writeFileSync(path.join(alDir, 'index.html'), alHtml, 'utf-8');
  fs.writeFileSync(path.join(DIST_DIR, 'airline', `${al.code}.html`), alHtml, 'utf-8');
});

// 5. Generate and sync static sitemap.xml, rss.xml, and feed.xml in dist/ and public/
const sitemap = aviationService.generateXmlSitemap('https://manufaktur.biz.id');
fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemap, 'utf-8');
fs.writeFileSync(path.join(process.cwd(), 'public', 'sitemap.xml'), sitemap, 'utf-8');

const origin = 'https://manufaktur.biz.id';
const buildDate = new Date().toUTCString();
const itemsXml = CANADIAN_EDITORIAL_ARTICLES.map(art => `    <item>
      <title><![CDATA[${art.title}]]></title>
      <link>${origin}/articles/${art.slug}</link>
      <guid isPermaLink="true">${origin}/articles/${art.slug}</guid>
      <description><![CDATA[${art.excerpt}]]></description>
      <category>${art.category}</category>
      <author>anissagustiawati@gmail.com (${art.author.name})</author>
      <pubDate>${new Date().toUTCString()}</pubDate>
    </item>`).join('\n');

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Canada Flight Schedules - Canadian Aviation News &amp; Flight Operations</title>
    <link>${origin}</link>
    <description>Daily updated Canadian civil aviation schedules, operational safety briefings, aerodrome procedures, and airline fleet telemetry.</description>
    <language>en-ca</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${origin}/rss.xml" rel="self" type="application/rss+xml" />
${itemsXml}
  </channel>
</rss>`;

fs.writeFileSync(path.join(DIST_DIR, 'rss.xml'), rss, 'utf-8');
fs.writeFileSync(path.join(process.cwd(), 'public', 'rss.xml'), rss, 'utf-8');
fs.writeFileSync(path.join(DIST_DIR, 'feed.xml'), rss, 'utf-8');
fs.writeFileSync(path.join(process.cwd(), 'public', 'feed.xml'), rss, 'utf-8');

// Ensure verification tokens and ads files exist in dist/
const publicFilesToSync = [
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

console.log(`Pre-render complete! Pre-rendered ${CANADIAN_EDITORIAL_ARTICLES.length} articles, ${mainRoutes.length} routes, ${hubAirports.length} airports, and ${airlines.length} airlines with exact canonical & SEO schema.`);
