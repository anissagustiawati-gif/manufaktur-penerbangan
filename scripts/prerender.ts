import fs from 'fs';
import path from 'path';
import { CANADIAN_EDITORIAL_ARTICLES } from '../src/data/canadianArticles';
import {
  CANADIAN_AIRPORTS,
  CANADIAN_AIRLINES,
  CANADIAN_AIRCRAFT,
  CANADIAN_ROUTES
} from '../src/data/canadianAviationData';
import { aviationService } from '../src/services/aviationService';
import { FlightRecord } from '../src/types/aviation';

const DIST_DIR = path.resolve(process.cwd(), 'dist');
const BASE_HTML_PATH = path.join(DIST_DIR, 'index.html');
const SITE_ORIGIN = 'https://manufaktur.biz.id';

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

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function markdownToSimpleHtml(md: string): string {
  const sections = md.split('\n\n').filter(s => s.trim().length > 0);
  return sections
    .map(section => {
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

      const convertedLinks = section.replace(
        /\[(.*?)\]\((.*?)\)/g,
        '<a href="$2" style="color: #681C35; font-weight: 600; text-decoration: underline;">$1</a>'
      );
      return `<p style="margin: 12px 0; line-height: 1.7; color: #3a3740;">${convertedLinks}</p>`;
    })
    .join('\n');
}

function buildBreadcrumbJsonLd(items: { name: string; path: string }[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: `${SITE_ORIGIN}${item.path === '/' ? '/' : item.path}`
    }))
  };
}

function renderRelatedGuidesFooterHtml(limit = 3): string {
  const guides = CANADIAN_EDITORIAL_ARTICLES.slice(0, limit);
  return `
  <section style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #E8E5E8;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
      <h2 style="font-size: 16px; font-weight: 800; color: #25232A; margin: 0;">Canadian Civil Aviation Research &amp; Operations Briefings</h2>
      <a href="${SITE_ORIGIN}/articles" style="font-size: 12px; font-weight: 700; color: #681C35; text-decoration: underline;">Browse All ${CANADIAN_EDITORIAL_ARTICLES.length} Guides &rarr;</a>
    </div>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px;">
      ${guides
        .map(
          g => `
        <a href="${SITE_ORIGIN}/articles/${g.slug}" style="display: block; border: 1px solid #E8E5E8; border-radius: 6px; padding: 14px; background: #FAF9FA; text-decoration: none; color: #25232A;">
          <div style="font-size: 10px; font-weight: 700; color: #681C35; text-transform: uppercase;">${escapeHtml(g.category)}</div>
          <h3 style="font-size: 13px; font-weight: 700; margin: 6px 0; line-height: 1.35;">${escapeHtml(g.title)}</h3>
          <p style="font-size: 11px; color: #504e57; margin: 0; line-height: 1.5;">${escapeHtml(g.excerpt)}</p>
        </a>
      `
        )
        .join('\n')}
    </div>
  </section>`;
}

interface PageMeta {
  title: string;
  desc: string;
  canonicalPath: string;
  robots?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  bodyHtml: string;
}

function renderPageHtml({
  title,
  desc,
  canonicalPath,
  robots = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  jsonLd,
  bodyHtml
}: PageMeta): string {
  const safeTitle = escapeHtml(title);
  const safeDesc = escapeHtml(desc);
  const cleanCanonicalPath = canonicalPath === '/' ? '/' : canonicalPath.replace(/\/+$/, '');
  const canonicalUrl = `${SITE_ORIGIN}${cleanCanonicalPath}`;

  let html = template;
  html = html.replace(/<title>[\s\S]*?<\/title>/i, () => `<title>${safeTitle}</title>`);
  html = html.replace(/<meta name="description" content="[^"]*" \/>/i, () => `<meta name="description" content="${safeDesc}" />`);
  html = html.replace(/<meta name="robots" content="[^"]*" \/>/i, () => `<meta name="robots" content="${robots}" />`);
  html = html.replace(/<link rel="canonical"[^>]*\/>/i, () => `<link rel="canonical" href="${canonicalUrl}" id="canonical-url" />`);
  html = html.replace(/<meta property="og:title" content="[^"]*" \/>/i, () => `<meta property="og:title" content="${safeTitle}" />`);
  html = html.replace(/<meta property="og:description" content="[^"]*" \/>/i, () => `<meta property="og:description" content="${safeDesc}" />`);
  html = html.replace(/<meta property="og:url" content="[^"]*" \/>/i, () => `<meta property="og:url" content="${canonicalUrl}" />`);
  html = html.replace(/<meta name="twitter:title" content="[^"]*" \/>/i, () => `<meta name="twitter:title" content="${safeTitle}" />`);
  html = html.replace(/<meta name="twitter:description" content="[^"]*" \/>/i, () => `<meta name="twitter:description" content="${safeDesc}" />`);

  if (jsonLd) {
    const blocks = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
    const scripts = blocks
      .map(block => `  <script type="application/ld+json">${JSON.stringify(block)}</script>`)
      .join('\n');
    html = html.replace('</head>', () => `${scripts}\n  </head>`);
  }

  const fullRoot = `<div id="root">\n${ssrHeaderHtml}\n${bodyHtml}\n${ssrFooterHtml}\n</div>`;
  html = html.replace('<div id="root"></div>', () => fullRoot);
  return html;
}

function writeRouteFiles(routePath: string, html: string) {
  const clean = routePath.replace(/^\/+|\/+$/g, '');
  if (!clean) {
    fs.writeFileSync(BASE_HTML_PATH, html, 'utf-8');
    return;
  }
  const routeDir = path.join(DIST_DIR, clean);
  ensureDirSync(routeDir);
  fs.writeFileSync(path.join(routeDir, 'index.html'), html, 'utf-8');
  fs.writeFileSync(path.join(DIST_DIR, `${clean}.html`), html, 'utf-8');
}

function renderFlightsTableHtml(flights: FlightRecord[], limit = 50, contextLabel = 'Canadian Flight Operations'): string {
  const slice = flights.slice(0, limit);
  if (slice.length === 0) {
    return `<p style="color: #504e57; font-size: 13px; background: #FAF9FA; padding: 14px; border: 1px solid #E8E5E8; border-radius: 6px;">Operational schedules for ${escapeHtml(contextLabel)} are refreshed dynamically from NAV CANADA airspace filings and carrier timetables across seasonal periods.</p>`;
  }
  const rows = slice
    .map(
      f => `
      <tr>
        <td style="padding: 10px 12px; border-bottom: 1px solid #E8E5E8; font-family: monospace; font-weight: 700;">
          <a href="${SITE_ORIGIN}/flight/${f.flightNumber}" style="color: #681C35; text-decoration: none;">${escapeHtml(f.flightNumber)}</a>
        </td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #E8E5E8;">
          <a href="${SITE_ORIGIN}/airline/${f.airlineIata}" style="color: #25232A; text-decoration: none; font-weight: 600;">${escapeHtml(f.airlineName)}</a>
        </td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #E8E5E8;">
          <a href="${SITE_ORIGIN}/airport/${f.departureAirportIata}" style="color: #681C35; font-weight: 700; text-decoration: none;">${escapeHtml(f.departureAirportIata)}</a>
          &rarr;
          <a href="${SITE_ORIGIN}/airport/${f.arrivalAirportIata}" style="color: #681C35; font-weight: 700; text-decoration: none;">${escapeHtml(f.arrivalAirportIata)}</a>
        </td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #E8E5E8; font-family: monospace;">${escapeHtml(f.scheduledDepartureLocal)}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #E8E5E8; font-family: monospace;">${escapeHtml(f.scheduledArrivalLocal)}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #E8E5E8;">
          <a href="${SITE_ORIGIN}/aircraft/${f.aircraftIcaoType}" style="color: #504e57; text-decoration: none;">${escapeHtml(f.aircraftModel)} (${escapeHtml(f.aircraftIcaoType)})</a>
        </td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #E8E5E8; font-weight: 600;">${escapeHtml(f.status)}</td>
      </tr>`
    )
    .join('\n');

  return `
    <div style="overflow-x: auto; border: 1px solid #E8E5E8; border-radius: 8px; background: #ffffff;">
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
        <thead>
          <tr style="background: #FAF9FA; color: #777780; border-bottom: 1px solid #E8E5E8; font-size: 11px; text-transform: uppercase;">
            <th style="padding: 10px 12px;">Flight</th>
            <th style="padding: 10px 12px;">Carrier</th>
            <th style="padding: 10px 12px;">Corridor</th>
            <th style="padding: 10px 12px;">Departs</th>
            <th style="padding: 10px 12px;">Arrives</th>
            <th style="padding: 10px 12px;">Aircraft</th>
            <th style="padding: 10px 12px;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

// Shared SSR Header & Footer HTML
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
      <a href="${SITE_ORIGIN}/articles" style="color: #681C35; text-decoration: none; font-weight: 700;">Aviation News (${CANADIAN_EDITORIAL_ARTICLES.length})</a>
      <a href="${SITE_ORIGIN}/site-index" style="color: #504e57; text-decoration: none;">Site Index</a>
    </nav>
  </div>
</header>
`;

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
        <li><a href="${SITE_ORIGIN}/airports" style="color: #b8b3b7; text-decoration: none;">Canadian &amp; Global Airports (${CANADIAN_AIRPORTS.length})</a></li>
        <li><a href="${SITE_ORIGIN}/airlines" style="color: #b8b3b7; text-decoration: none;">Commercial Airlines (${CANADIAN_AIRLINES.length})</a></li>
        <li><a href="${SITE_ORIGIN}/aircraft" style="color: #b8b3b7; text-decoration: none;">Commercial Airliners (${CANADIAN_AIRCRAFT.length})</a></li>
        <li><a href="${SITE_ORIGIN}/articles" style="color: #ffffff; font-weight: bold; text-decoration: none;">Aviation Research Guides (${CANADIAN_EDITORIAL_ARTICLES.length})</a></li>
        <li><a href="${SITE_ORIGIN}/site-index" style="color: #b8b3b7; text-decoration: none;">HTML Site Index</a></li>
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

console.log('Starting comprehensive static pre-render for Googlebot, Google Search Console & AdSense...');

const allFlightsResult = aviationService.getFlights({ pageSize: 500 });
const allFlights = allFlightsResult.flights;
const liveFlights = aviationService.getActiveLiveFlights();

const uniqueFlightsMap = new Map<string, FlightRecord>();
allFlights.forEach(f => {
  if (!uniqueFlightsMap.has(f.flightNumber)) {
    uniqueFlightsMap.set(f.flightNumber, f);
  }
});

const homeArticlesListHtml = CANADIAN_EDITORIAL_ARTICLES.map(
  art => `
  <article style="border: 1px solid #E8E5E8; border-radius: 8px; overflow: hidden; background: #ffffff; display: flex; flex-direction: column;">
    <div style="height: 180px; overflow: hidden; position: relative;">
      <img src="${escapeHtml(art.featuredImage)}" alt="${escapeHtml(art.title)}" style="width: 100%; height: 100%; object-fit: cover;" />
      <span style="position: absolute; top: 10px; left: 10px; background: #681C35; color: #ffffff; padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: 700;">${escapeHtml(art.category)}</span>
    </div>
    <div style="padding: 16px; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
      <div>
        <div style="font-size: 11px; color: #777780; margin-bottom: 6px;">
          <span>${escapeHtml(art.publishedDate)}</span> &middot; <span>${art.readTimeMinutes} min read</span> &middot; <span>By ${escapeHtml(art.author.name)}</span>
        </div>
        <h3 style="font-size: 15px; font-weight: 700; color: #25232A; margin: 0 0 8px; line-height: 1.35;">
          <a href="${SITE_ORIGIN}/articles/${art.slug}" style="color: #25232A; text-decoration: none;">${escapeHtml(art.title)}</a>
        </h3>
        <p style="font-size: 12px; color: #504e57; line-height: 1.5; margin: 0 0 12px;">${escapeHtml(art.excerpt)}</p>
      </div>
      <a href="${SITE_ORIGIN}/articles/${art.slug}" style="font-size: 12px; font-weight: 700; color: #681C35; text-decoration: underline;">
        Read Complete Analysis &rarr;
      </a>
    </div>
  </article>
`
).join('\n');

// 1. PRE-RENDER HOMEPAGE (dist/index.html)
console.log('Pre-rendering Homepage (dist/index.html)...');
const homeHubAirportsHtml = CANADIAN_AIRPORTS.map(
  apt => `
  <a href="${SITE_ORIGIN}/airport/${apt.iata}" style="display: block; border: 1px solid #E8E5E8; padding: 12px; border-radius: 6px; text-decoration: none; color: #25232A; background: #FAF9FA;">
    <strong style="font-size: 16px; color: #681C35;">${escapeHtml(apt.iata)}</strong> - <span style="font-weight: 600;">${escapeHtml(apt.city.split(',')[0])}</span>
    <div style="font-size: 11px; color: #777780; margin-top: 4px;">${escapeHtml(apt.name)} &bull; ${escapeHtml(apt.icao)}</div>
  </a>
`
).join('\n');

const homeHtml = renderPageHtml({
  title: 'Canada Flight Schedules – Canadian Aerodromes Timetables & Radar Tracking',
  desc: 'Explore Canadian flight schedules, aerodrome departures and arrivals across all 10 provinces and 3 territories, Air Canada, WestJet, Porter, and live ADS-B radar tracking.',
  canonicalPath: '/',
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'World Flight Schedule - Canada',
      url: SITE_ORIGIN,
      email: 'anissagustiawati@gmail.com',
      logo: `${SITE_ORIGIN}/assets/images/hero_aviation_flight_1793637455661.jpg`
    }
  ],
  bodyHtml: `
  <main style="max-width: 1200px; margin: 0 auto; padding: 24px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <section style="background: linear-gradient(135deg, #681C35, #431222); color: white; border-radius: 12px; padding: 36px 28px; margin-bottom: 32px;">
      <span style="font-size: 12px; font-weight: 700; color: #fcd34d; letter-spacing: 1px;">CANADA NATIONAL CIVIL AVIATION INFORMATION PORTAL</span>
      <h1 style="font-size: 32px; font-weight: 800; margin: 8px 0 12px; line-height: 1.2;">Canada Flight Schedules &amp; Airport Information</h1>
      <p style="font-size: 15px; color: rgba(255,255,255,0.9); max-width: 800px; line-height: 1.6; margin: 0 0 20px;">
        Explore verified Canadian commercial flight timetables, airport departures, arrivals, carrier fleets, aircraft specifications, and Mode-S ADS-B transponder updates across NAV CANADA airspace.
      </p>
      <div style="display: flex; gap: 12px; flex-wrap: wrap;">
        <a href="${SITE_ORIGIN}/flights" style="background: #ffffff; color: #681C35; padding: 10px 18px; border-radius: 6px; font-weight: 700; font-size: 13px; text-decoration: none;">View Flight Timetables</a>
        <a href="${SITE_ORIGIN}/departures" style="background: rgba(255,255,255,0.15); color: #ffffff; padding: 10px 18px; border-radius: 6px; font-weight: 600; font-size: 13px; text-decoration: none;">Live Departures Board</a>
        <a href="${SITE_ORIGIN}/map" style="background: #059669; color: #ffffff; padding: 10px 18px; border-radius: 6px; font-weight: 700; font-size: 13px; text-decoration: none;">Live Radar Map</a>
        <a href="${SITE_ORIGIN}/articles" style="background: rgba(255,255,255,0.15); color: #ffffff; padding: 10px 18px; border-radius: 6px; font-weight: 600; font-size: 13px; text-decoration: none;">Aviation Research Guides (${CANADIAN_EDITORIAL_ARTICLES.length})</a>
      </div>
    </section>

    <section style="margin-bottom: 40px;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #E8E5E8; padding-bottom: 8px; margin-bottom: 16px;">
        <h2 style="font-size: 20px; font-weight: 800; color: #25232A; margin: 0;">Canadian Hub Aerodrome Boards (${CANADIAN_AIRPORTS.length})</h2>
        <a href="${SITE_ORIGIN}/airports" style="font-size: 13px; font-weight: 700; color: #681C35; text-decoration: none;">All Canadian Airports &rarr;</a>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;">
        ${homeHubAirportsHtml}
      </div>
    </section>

    <section style="margin-bottom: 40px;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #E8E5E8; padding-bottom: 8px; margin-bottom: 16px;">
        <h2 style="font-size: 20px; font-weight: 800; color: #25232A; margin: 0;">Daily Verified Flight Operations Preview</h2>
        <a href="${SITE_ORIGIN}/flights" style="font-size: 13px; font-weight: 700; color: #681C35; text-decoration: none;">Full Timetable (${allFlights.length}) &rarr;</a>
      </div>
      ${renderFlightsTableHtml(allFlights, 12, 'Canadian National Network')}
    </section>

    <section style="margin-bottom: 40px;" id="aviation-articles-index">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #E8E5E8; padding-bottom: 8px; margin-bottom: 20px; flex-wrap: wrap; gap: 8px;">
        <div>
          <h2 style="font-size: 22px; font-weight: 800; color: #25232A; margin: 0;">Canadian Aviation Technical Analyses &amp; Operations Guides (${CANADIAN_EDITORIAL_ARTICLES.length} Available)</h2>
          <p style="font-size: 13px; color: #777780; margin: 4px 0 0;">
            Independent research into winter de-icing holdover engineering, Vancouver 2037 dike defenses, Dash 8-400 vs E195-E2 fleet economics, polar ETOPS-240, and Halifax cold-chain air cargo.
          </p>
        </div>
        <a href="${SITE_ORIGIN}/articles" style="font-size: 13px; font-weight: 700; color: #681C35; text-decoration: underline;">Browse All ${CANADIAN_EDITORIAL_ARTICLES.length} Guides</a>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(270px, 1fr)); gap: 20px;">
        ${homeArticlesListHtml}
      </div>
    </section>
  </main>`
});
writeRouteFiles('/', homeHtml);

// 2. PRE-RENDER ALL INDIVIDUAL ARTICLE PAGES
console.log(`Pre-rendering ${CANADIAN_EDITORIAL_ARTICLES.length} Individual Articles...`);
CANADIAN_EDITORIAL_ARTICLES.forEach(art => {
  const canonicalUrl = `${SITE_ORIGIN}/articles/${art.slug}`;
  const articleHtml = renderPageHtml({
    title: `${art.title} – World Flight Schedule`,
    desc: art.excerpt,
    canonicalPath: `/articles/${art.slug}`,
    jsonLd: [
      buildBreadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: 'Aviation News', path: '/articles' },
        { name: art.title, path: `/articles/${art.slug}` }
      ]),
      {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: art.title,
        description: art.excerpt,
        image: [
          art.featuredImage.startsWith('http') ? art.featuredImage : `${SITE_ORIGIN}${art.featuredImage}`
        ],
        datePublished: '2026-11-10T08:00:00Z',
        dateModified: '2026-11-12T12:00:00Z',
        author: [
          {
            '@type': 'Person',
            name: art.author.name,
            jobTitle: art.author.role
          }
        ],
        publisher: {
          '@type': 'Organization',
          name: 'World Flight Schedule - Canada',
          logo: {
            '@type': 'ImageObject',
            url: `${SITE_ORIGIN}/assets/images/hero_aviation_flight_1793637455661.jpg`
          }
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': canonicalUrl
        }
      }
    ],
    bodyHtml: `
      <main style="max-width: 900px; margin: 0 auto; padding: 32px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <nav style="font-size: 12px; color: #777780; margin-bottom: 20px;">
          <a href="${SITE_ORIGIN}/" style="color: #681C35; text-decoration: none;">Home</a> &gt;
          <a href="${SITE_ORIGIN}/articles" style="color: #681C35; text-decoration: none;">Aviation News</a> &gt;
          <span>${escapeHtml(art.category)}</span>
        </nav>
        <span style="display: inline-block; background: #681C35; color: white; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: bold; margin-bottom: 12px;">${escapeHtml(art.category)}</span>
        <h1 style="font-size: 32px; font-weight: 800; color: #25232A; line-height: 1.25; margin-bottom: 16px;">${escapeHtml(art.title)}</h1>
        <p style="font-size: 16px; color: #504e57; line-height: 1.6; margin-bottom: 16px; font-weight: 500;">${escapeHtml(art.excerpt)}</p>
        <div style="font-size: 12px; color: #777780; padding: 12px 0; border-top: 1px solid #E8E5E8; border-bottom: 1px solid #E8E5E8; margin-bottom: 24px;">
          <span>By <strong>${escapeHtml(art.author.name)}</strong> (${escapeHtml(art.author.role)})</span> &middot;
          <span>Published: ${escapeHtml(art.publishedDate)}</span> &middot;
          <span>${art.readTimeMinutes} min read</span>
        </div>
        <img src="${escapeHtml(art.featuredImage)}" alt="${escapeHtml(art.title)}" style="width: 100%; max-height: 440px; object-fit: cover; border-radius: 8px; margin-bottom: 24px;" />
        <div class="article-content" style="font-size: 15px; color: #25232A;">
          ${markdownToSimpleHtml(art.content)}
        </div>
        <div style="margin-top: 48px; padding-top: 24px; border-top: 2px solid #E8E5E8;">
          <h3 style="font-size: 18px; font-weight: 800; color: #25232A; margin-bottom: 16px;">Continue Reading Aviation Research Guides</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px;">
            ${CANADIAN_EDITORIAL_ARTICLES.filter(a => a.slug !== art.slug)
              .slice(0, 3)
              .map(
                other => `
              <div style="border: 1px solid #E8E5E8; border-radius: 6px; padding: 14px; background: #FAF9FA;">
                <span style="font-size: 10px; font-weight: 700; color: #681C35;">${escapeHtml(other.category)}</span>
                <h4 style="font-size: 13px; font-weight: 700; margin: 4px 0 8px; line-height: 1.35;">
                  <a href="${SITE_ORIGIN}/articles/${other.slug}" style="color: #25232A; text-decoration: none;">${escapeHtml(other.title)}</a>
                </h4>
                <a href="${SITE_ORIGIN}/articles/${other.slug}" style="font-size: 11px; font-weight: 700; color: #681C35; text-decoration: underline;">Read Analysis &rarr;</a>
              </div>
            `
              )
              .join('\n')}
          </div>
        </div>
      </main>`
  });
  writeRouteFiles(`/articles/${art.slug}`, articleHtml);
});

// 3. PRE-RENDER ARTICLES DIRECTORY (/articles)
console.log('Pre-rendering Articles Directory (/articles)...');
writeRouteFiles(
  '/articles',
  renderPageHtml({
    title: 'Aviation News & Technical Operations Guides – World Flight Schedule',
    desc: 'In-depth 1,000+ word aviation research guides covering winter de-icing holdover times, polar radar, aerodynamics, and passenger rights.',
    canonicalPath: '/articles',
    jsonLd: [
      buildBreadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: 'Aviation News', path: '/articles' }
      ]),
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Canadian Aviation News & Operational Insights',
        url: `${SITE_ORIGIN}/articles`
      }
    ],
    bodyHtml: `
    <main style="max-width: 1200px; margin: 0 auto; padding: 32px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="border-bottom: 2px solid #E8E5E8; padding-bottom: 16px; margin-bottom: 28px;">
        <span style="font-size: 11px; font-weight: 700; color: #681C35; letter-spacing: 1px;">CANADIAN AVIATION EDITORIAL &amp; TECHNICAL ANALYSES</span>
        <h1 style="font-size: 32px; font-weight: 800; color: #25232A; margin: 6px 0 10px;">Canadian Aviation News &amp; Operational Insights</h1>
        <p style="font-size: 14px; color: #504e57; max-width: 850px; line-height: 1.6; margin: 0;">
          Explore all ${CANADIAN_EDITORIAL_ARTICLES.length} comprehensive aviation research guides written by aviation safety inspectors, avionics engineers, and airline economists covering NAV CANADA airspace, winter de-icing, APPR rights, and commercial aircraft programs.
        </p>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px;">
        ${homeArticlesListHtml}
      </div>
    </main>`
  })
);

// 4. PRE-RENDER HTML SITE INDEX (/site-index)
console.log('Pre-rendering HTML Site Index (/site-index)...');
writeRouteFiles(
  '/site-index',
  renderPageHtml({
    title: 'HTML Site Index & Complete Directory – World Flight Schedule',
    desc: `Complete index of all Canadian flight timetables, ${CANADIAN_EDITORIAL_ARTICLES.length} aviation research guides, ${CANADIAN_AIRPORTS.length} aerodrome boards, ${CANADIAN_AIRLINES.length} carrier fleets, ${CANADIAN_AIRCRAFT.length} aircraft specs, and compliance policies.`,
    canonicalPath: '/site-index',
    jsonLd: buildBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Site Index', path: '/site-index' }
    ]),
    bodyHtml: `
    <main style="max-width: 1200px; margin: 0 auto; padding: 32px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="border-bottom: 2px solid #E8E5E8; padding-bottom: 16px; margin-bottom: 28px;">
        <h1 style="font-size: 32px; font-weight: 800; color: #25232A; margin: 0 0 8px;">HTML Site Index &amp; Navigation Tree</h1>
        <p style="font-size: 14px; color: #504e57; margin: 0;">Complete index of all Canadian flight operations pages, ${CANADIAN_AIRPORTS.length} aerodromes, ${CANADIAN_AIRLINES.length} carriers, ${CANADIAN_AIRCRAFT.length} aircraft specifications, ${uniqueFlightsMap.size} scheduled flights, and ${CANADIAN_EDITORIAL_ARTICLES.length} research guides.</p>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 32px;">
        <div>
          <h2 style="font-size: 18px; font-weight: 800; color: #681C35; border-bottom: 1px solid #E8E5E8; padding-bottom: 8px; margin-bottom: 14px;">
            Aviation Research Guides (${CANADIAN_EDITORIAL_ARTICLES.length})
          </h2>
          <ul style="line-height: 1.9; padding-left: 18px; font-size: 13px;">
            ${CANADIAN_EDITORIAL_ARTICLES.map(
              a => `<li><a href="${SITE_ORIGIN}/articles/${a.slug}" style="color: #25232A; font-weight: 600; text-decoration: underline;">${escapeHtml(a.title)}</a> &mdash; <span style="color: #777780;">${escapeHtml(a.category)}</span></li>`
            ).join('\n')}
          </ul>
        </div>
        <div>
          <h2 style="font-size: 18px; font-weight: 800; color: #681C35; border-bottom: 1px solid #E8E5E8; padding-bottom: 8px; margin-bottom: 14px;">
            Canadian Aerodromes (${CANADIAN_AIRPORTS.length}) &amp; Carriers (${CANADIAN_AIRLINES.length})
          </h2>
          <ul style="line-height: 1.9; padding-left: 18px; font-size: 13px;">
            ${CANADIAN_AIRPORTS.map(
              a => `<li><a href="${SITE_ORIGIN}/airport/${a.iata}" style="color: #681C35; font-weight: 600;">${escapeHtml(a.iata)} (${escapeHtml(a.icao)}) &ndash; ${escapeHtml(a.name)}</a></li>`
            ).join('\n')}
          </ul>
          <h3 style="font-size: 15px; font-weight: 800; color: #681C35; margin: 20px 0 8px;">Carriers (${CANADIAN_AIRLINES.length}) &amp; Fleet Types (${CANADIAN_AIRCRAFT.length})</h3>
          <ul style="line-height: 1.9; padding-left: 18px; font-size: 13px;">
            ${CANADIAN_AIRLINES.map(
              al => `<li><a href="${SITE_ORIGIN}/airline/${al.iata}" style="color: #25232A; font-weight: 600;">${escapeHtml(al.name)} (${escapeHtml(al.iata)}/${escapeHtml(al.icao)})</a></li>`
            ).join('\n')}
            ${CANADIAN_AIRCRAFT.map(
              ac => `<li><a href="${SITE_ORIGIN}/aircraft/${ac.icaoType}" style="color: #25232A; font-weight: 600;">${escapeHtml(ac.model)} (${escapeHtml(ac.icaoType)})</a></li>`
            ).join('\n')}
          </ul>
        </div>
        <div>
          <h2 style="font-size: 18px; font-weight: 800; color: #681C35; border-bottom: 1px solid #E8E5E8; padding-bottom: 8px; margin-bottom: 14px;">
            Operations &amp; Legal Pages
          </h2>
          <ul style="line-height: 1.9; padding-left: 18px; font-size: 13px;">
            <li><a href="${SITE_ORIGIN}/" style="color: #25232A; font-weight: 600;">Home Page</a></li>
            <li><a href="${SITE_ORIGIN}/flights" style="color: #25232A; font-weight: 600;">Flight Schedules</a></li>
            <li><a href="${SITE_ORIGIN}/departures" style="color: #25232A; font-weight: 600;">Airport Departures</a></li>
            <li><a href="${SITE_ORIGIN}/arrivals" style="color: #25232A; font-weight: 600;">Airport Arrivals</a></li>
            <li><a href="${SITE_ORIGIN}/airports" style="color: #25232A; font-weight: 600;">Airports Directory</a></li>
            <li><a href="${SITE_ORIGIN}/airlines" style="color: #25232A; font-weight: 600;">Airlines Directory</a></li>
            <li><a href="${SITE_ORIGIN}/aircraft" style="color: #25232A; font-weight: 600;">Aircraft Directory</a></li>
            <li><a href="${SITE_ORIGIN}/routes" style="color: #25232A; font-weight: 600;">Routes Explorer (${CANADIAN_ROUTES.length})</a></li>
            <li><a href="${SITE_ORIGIN}/map" style="color: #25232A; font-weight: 600;">Live Airspace Radar Map</a></li>
            <li><a href="${SITE_ORIGIN}/about" style="color: #25232A; font-weight: 600;">About Us</a></li>
            <li><a href="${SITE_ORIGIN}/contact" style="color: #25232A; font-weight: 600;">Contact Desk</a></li>
            <li><a href="${SITE_ORIGIN}/privacy" style="color: #25232A; font-weight: 600;">Privacy Policy</a></li>
            <li><a href="${SITE_ORIGIN}/terms" style="color: #25232A; font-weight: 600;">Terms &amp; Conditions</a></li>
            <li><a href="${SITE_ORIGIN}/disclaimer" style="color: #25232A; font-weight: 600;">Data Disclaimer</a></li>
            <li><a href="${SITE_ORIGIN}/editorial-policy" style="color: #25232A; font-weight: 600;">Editorial Policy</a></li>
          </ul>
          <h3 style="font-size: 15px; font-weight: 800; color: #681C35; margin: 20px 0 8px;">Active Daily Flight Numbers (${uniqueFlightsMap.size})</h3>
          <div style="display: flex; flex-wrap: wrap; gap: 6px; font-size: 12px; font-family: monospace;">
            ${Array.from(uniqueFlightsMap.values())
              .map(f => `<a href="${SITE_ORIGIN}/flight/${f.flightNumber}" style="padding: 3px 8px; border: 1px solid #E8E5E8; border-radius: 4px; color: #681C35; text-decoration: none; background: #FAF9FA;">${escapeHtml(f.flightNumber)}</a>`)
              .join('\n')}
          </div>
        </div>
      </div>
    </main>`
  })
);

if (fs.existsSync(path.join(DIST_DIR, 'sitemap'))) {
  fs.rmSync(path.join(DIST_DIR, 'sitemap'), { recursive: true, force: true });
}
if (fs.existsSync(path.join(DIST_DIR, 'sitemap.html'))) {
  fs.unlinkSync(path.join(DIST_DIR, 'sitemap.html'));
}

// 5. PRE-RENDER OPERATIONS & DIRECTORY ROUTES WITH UNIQUE RICH CONTENT
console.log('Pre-rendering Operational & Directory Pages...');

writeRouteFiles(
  '/flights',
  renderPageHtml({
    title: 'Canadian Flight Schedules Today – World Flight Schedule',
    desc: 'Real-time Canadian commercial flight timetables, departure and arrival times, aircraft types, and carrier statuses across NAV CANADA airspace.',
    canonicalPath: '/flights',
    jsonLd: buildBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Flight Schedules', path: '/flights' }
    ]),
    bodyHtml: `
    <main style="max-width: 1200px; margin: 0 auto; padding: 32px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <span style="font-size: 11px; font-weight: 700; color: #681C35; text-transform: uppercase;">Master Timetable Index</span>
      <h1 style="font-size: 30px; font-weight: 800; color: #25232A; margin: 6px 0 10px;">Canadian Commercial Flight Schedules (${allFlights.length} Daily Operations)</h1>
      <p style="font-size: 14px; color: #504e57; line-height: 1.6; max-width: 900px; margin: 0 0 20px;">
        Verified 24-hour commercial passenger and night express cargo timetable across Canadian provinces and territories, covering Air Canada, WestJet, Porter Airlines, Air Transat, Flair Airlines, Canadian North, and Cargojet corridors. All times reflect standardized local airport timezones alongside UTC cross-references maintained for NAV CANADA airspace coordination.
      </p>
      ${renderFlightsTableHtml(allFlights, 50, 'All Canadian Scheduled Flights')}
      ${renderRelatedGuidesFooterHtml(3)}
    </main>`
  })
);

const yyzDepartures = aviationService.getDepartures('YYZ');
writeRouteFiles(
  '/departures',
  renderPageHtml({
    title: 'Live Canadian Airport Departures Board – World Flight Schedule',
    desc: 'Real-time outbound departures board for Toronto Pearson (YYZ), Vancouver (YVR), Montréal (YUL), Calgary (YYC), and Canadian regional aerodromes.',
    canonicalPath: '/departures',
    jsonLd: buildBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Airport Departures', path: '/departures' }
    ]),
    bodyHtml: `
    <main style="max-width: 1200px; margin: 0 auto; padding: 32px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <span style="font-size: 11px; font-weight: 700; color: #681C35; text-transform: uppercase;">Canadian Aerodromes Outbound Board</span>
      <h1 style="font-size: 30px; font-weight: 800; color: #25232A; margin: 6px 0 10px;">Live Canadian Airport Departures</h1>
      <p style="font-size: 14px; color: #504e57; line-height: 1.6; max-width: 900px; margin: 0 0 20px;">
        Track scheduled outbound departures, gate assignments, terminal concourses, and delay notifications across Toronto Pearson (YYZ), Vancouver (YVR), Montréal–Trudeau (YUL), Calgary (YYC), and ${CANADIAN_AIRPORTS.length} Canadian hub and regional airports. Select any aerodrome badge below to open its dedicated local departure and arrival board.
      </p>
      <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px;">
        ${CANADIAN_AIRPORTS.map(a => `<a href="${SITE_ORIGIN}/airport/${a.iata}" style="padding: 6px 12px; border: 1px solid #E8E5E8; border-radius: 6px; font-size: 12px; font-weight: 700; color: #681C35; text-decoration: none; background: #FAF9FA;">${escapeHtml(a.iata)} &ndash; ${escapeHtml(a.city.split(',')[0])}</a>`).join('\n')}
      </div>
      <h2 style="font-size: 18px; font-weight: 700; color: #25232A; margin-bottom: 12px;">Toronto Pearson (YYZ) &amp; National Outbound Schedule</h2>
      ${renderFlightsTableHtml(yyzDepartures.length ? yyzDepartures : allFlights, 25, 'YYZ Departures')}
      ${renderRelatedGuidesFooterHtml(3)}
    </main>`
  })
);

const yvrArrivals = aviationService.getArrivals('YVR');
writeRouteFiles(
  '/arrivals',
  renderPageHtml({
    title: 'Live Canadian Airport Arrivals Board – World Flight Schedule',
    desc: 'Live inbound arrivals, touchdown confirmations, gate allocations, and baggage claim belts across Canadian international and regional aerodromes.',
    canonicalPath: '/arrivals',
    jsonLd: buildBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Airport Arrivals', path: '/arrivals' }
    ]),
    bodyHtml: `
    <main style="max-width: 1200px; margin: 0 auto; padding: 32px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <span style="font-size: 11px; font-weight: 700; color: #681C35; text-transform: uppercase;">Canadian Aerodromes Inbound Board</span>
      <h1 style="font-size: 30px; font-weight: 800; color: #25232A; margin: 6px 0 10px;">Live Canadian Airport Arrivals</h1>
      <p style="font-size: 14px; color: #504e57; line-height: 1.6; max-width: 900px; margin: 0 0 20px;">
        Monitor inbound flights arriving at Vancouver International (YVR), Toronto Pearson (YYZ), Calgary (YYC), Montréal-Trudeau (YUL), and Arctic gateways, complete with terminal gates, arrival status tracking, and baggage claim belt assignments. Select an airport code below to review full local arrivals.
      </p>
      <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px;">
        ${CANADIAN_AIRPORTS.map(a => `<a href="${SITE_ORIGIN}/airport/${a.iata}" style="padding: 6px 12px; border: 1px solid #E8E5E8; border-radius: 6px; font-size: 12px; font-weight: 700; color: #681C35; text-decoration: none; background: #FAF9FA;">${escapeHtml(a.iata)} &ndash; ${escapeHtml(a.city.split(',')[0])}</a>`).join('\n')}
      </div>
      <h2 style="font-size: 18px; font-weight: 700; color: #25232A; margin-bottom: 12px;">Vancouver (YVR) &amp; National Inbound Schedule</h2>
      ${renderFlightsTableHtml(yvrArrivals.length ? yvrArrivals : allFlights, 25, 'YVR Arrivals')}
      ${renderRelatedGuidesFooterHtml(3)}
    </main>`
  })
);

writeRouteFiles(
  '/airports',
  renderPageHtml({
    title: 'Canadian & Global Airports Directory (IATA/ICAO) – World Flight Schedule',
    desc: 'Comprehensive directory of Canadian airports across all 10 provinces and 3 territories with runway dimensions, elevations, coordinates, and terminal specs.',
    canonicalPath: '/airports',
    jsonLd: buildBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Airports Directory', path: '/airports' }
    ]),
    bodyHtml: `
    <main style="max-width: 1200px; margin: 0 auto; padding: 32px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <h1 style="font-size: 30px; font-weight: 800; color: #25232A; margin: 0 0 10px;">Canadian Aerodromes Directory (${CANADIAN_AIRPORTS.length} Verified Airports)</h1>
      <p style="font-size: 14px; color: #504e57; line-height: 1.6; max-width: 900px; margin: 0 0 24px;">
        Explore major hubs, international gateways, regional facilities, cargo/aerospace complexes, and Arctic aerodromes across Canada with official IATA/ICAO codes, runway dimensions, field elevations, UTC offsets, and live schedule boards.
      </p>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
        ${CANADIAN_AIRPORTS.map(
          apt => `
          <a href="${SITE_ORIGIN}/airport/${apt.iata}" style="display: block; border: 1px solid #E8E5E8; border-radius: 8px; padding: 18px; background: #ffffff; text-decoration: none; color: #25232A;">
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px;">
              <strong style="font-size: 22px; font-family: monospace; color: #681C35;">${escapeHtml(apt.iata)} / ${escapeHtml(apt.icao)}</strong>
              <span style="font-size: 11px; color: #777780;">${escapeHtml(apt.type || 'International')}</span>
            </div>
            <h2 style="font-size: 15px; font-weight: 700; margin: 0 0 4px;">${escapeHtml(apt.name)}</h2>
            <p style="font-size: 12px; color: #504e57; margin: 0 0 8px;">${escapeHtml(apt.city)} &bull; Elevation: ${apt.elevationFeet ?? 0} ft MSL</p>
            <div style="font-size: 11px; color: #777780;">Runways: ${escapeHtml((apt.runways || []).join(', '))}</div>
          </a>
        `
        ).join('\n')}
      </div>
      ${renderRelatedGuidesFooterHtml(3)}
    </main>`
  })
);

writeRouteFiles(
  '/airlines',
  renderPageHtml({
    title: 'Canadian Commercial Airlines Directory – World Flight Schedule',
    desc: 'Fleet sizes, ICAO callsigns, operating hubs, alliances, and daily scheduled operations for Air Canada, WestJet, Porter, Air Transat, Flair, Canadian North, and Cargojet.',
    canonicalPath: '/airlines',
    jsonLd: buildBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Airlines Directory', path: '/airlines' }
    ]),
    bodyHtml: `
    <main style="max-width: 1200px; margin: 0 auto; padding: 32px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <h1 style="font-size: 30px; font-weight: 800; color: #25232A; margin: 0 0 10px;">Canadian Commercial Airlines Directory (${CANADIAN_AIRLINES.length} Carriers)</h1>
      <p style="font-size: 14px; color: #504e57; line-height: 1.6; max-width: 900px; margin: 0 0 24px;">
        Verified operator profiles covering mainline passenger airlines, ultra-low-cost carriers, Arctic combi specialists, and overnight dedicated freighter networks under Transport Canada Air Operator Certificates. Inspect radio callsigns, active fleet totals, primary hubs, and scheduled flights below.
      </p>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px;">
        ${CANADIAN_AIRLINES.map(
          al => `
          <a href="${SITE_ORIGIN}/airline/${al.iata}" style="display: block; border: 1px solid #E8E5E8; border-radius: 8px; padding: 20px; background: #ffffff; text-decoration: none; color: #25232A;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <strong style="font-size: 22px; font-family: monospace; color: #681C35;">${escapeHtml(al.iata)} / ${escapeHtml(al.icao)}</strong>
              <span style="font-size: 11px; background: #FAF9FA; border: 1px solid #E8E5E8; padding: 2px 8px; border-radius: 4px;">${escapeHtml(al.alliance || 'Independent')}</span>
            </div>
            <h2 style="font-size: 17px; font-weight: 700; margin: 0 0 6px;">${escapeHtml(al.name)}</h2>
            <p style="font-size: 12px; color: #504e57; margin: 0 0 6px;">Callsign: <strong>${escapeHtml(al.callsign)}</strong> &bull; Fleet: <strong>${al.fleetCount || 0} aircraft</strong></p>
            <p style="font-size: 12px; color: #777780; margin: 0;">Primary Hubs: ${escapeHtml(al.hubAirports.join(', '))}</p>
          </a>
        `
        ).join('\n')}
      </div>
      ${renderRelatedGuidesFooterHtml(3)}
    </main>`
  })
);

writeRouteFiles(
  '/aircraft',
  renderPageHtml({
    title: 'Commercial Aircraft Specifications Directory – World Flight Schedule',
    desc: 'Technical specifications, wingspan, certified range, cruising airspeed, passenger capacities, and powerplants for airliners operating in Canadian skies.',
    canonicalPath: '/aircraft',
    jsonLd: buildBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Aircraft Directory', path: '/aircraft' }
    ]),
    bodyHtml: `
    <main style="max-width: 1200px; margin: 0 auto; padding: 32px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <h1 style="font-size: 30px; font-weight: 800; color: #25232A; margin: 0 0 10px;">Commercial Aircraft Fleet Specifications (${CANADIAN_AIRCRAFT.length} Aircraft Types)</h1>
      <p style="font-size: 14px; color: #504e57; line-height: 1.6; max-width: 900px; margin: 0 0 24px;">
        Inspect verified dimensions, maximum certified range, true cruising speed, engine models, and active Canadian route assignments across narrow-body jets, wide-body long-haul airliners, regional turboprops, Arctic combi aircraft, and express cargo freighters.
      </p>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px;">
        ${CANADIAN_AIRCRAFT.map(
          ac => {
            const capacityText = ac.maxPassengers === 0 ? 'Cargo Freighter (0 pax)' : `${ac.maxPassengers} passengers`;
            return `
          <a href="${SITE_ORIGIN}/aircraft/${ac.icaoType}" style="display: block; border: 1px solid #E8E5E8; border-radius: 8px; padding: 20px; background: #ffffff; text-decoration: none; color: #25232A;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <strong style="font-size: 20px; font-family: monospace; color: #681C35;">${escapeHtml(ac.icaoType)}</strong>
              <span style="font-size: 11px; background: #FAF9FA; border: 1px solid #E8E5E8; padding: 2px 8px; border-radius: 4px;">${escapeHtml(ac.typeCategory)}</span>
            </div>
            <h2 style="font-size: 16px; font-weight: 700; margin: 0 0 6px;">${escapeHtml(ac.model)}</h2>
            <p style="font-size: 12px; color: #504e57; margin: 0 0 6px;">${escapeHtml(ac.manufacturer)} &bull; ${capacityText} &bull; Range: ${ac.rangeKm.toLocaleString()} km</p>
            <p style="font-size: 12px; color: #777780; margin: 0;">Cruise: ${ac.cruisingSpeedKmH} km/h (${Math.round(ac.cruisingSpeedKmH * 0.539957)} kts) &bull; ${ac.engineCount}x ${escapeHtml(ac.engineType)}</p>
          </a>
        `;
          }
        ).join('\n')}
      </div>
      ${renderRelatedGuidesFooterHtml(3)}
    </main>`
  })
);

writeRouteFiles(
  '/routes',
  renderPageHtml({
    title: 'Canadian Commercial Flight Routes Explorer – World Flight Schedule',
    desc: 'Discover major Canadian transcontinental, prairie, and Arctic commercial air routes, typical block durations, distances, and assigned aircraft.',
    canonicalPath: '/routes',
    jsonLd: buildBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Routes Explorer', path: '/routes' }
    ]),
    bodyHtml: `
    <main style="max-width: 1200px; margin: 0 auto; padding: 32px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <h1 style="font-size: 30px; font-weight: 800; color: #25232A; margin: 0 0 10px;">Canadian &amp; Transcontinental Air Corridors (${CANADIAN_ROUTES.length} Primary Routes)</h1>
      <p style="font-size: 14px; color: #504e57; line-height: 1.6; max-width: 900px; margin: 0 0 24px;">
        Analyze Canada's busiest passenger and northern supply corridors including block durations, great-circle distances, operating carriers, and active flight designators linking eastern gateways, prairie centers, mountain hubs, and coastal airports.
      </p>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px;">
        ${CANADIAN_ROUTES.map(
          rt => `
          <div style="border: 1px solid #E8E5E8; border-radius: 8px; padding: 18px; background: #ffffff;">
            <div style="font-size: 18px; font-weight: 800; font-family: monospace; color: #681C35; margin-bottom: 6px;">
              <a href="${SITE_ORIGIN}/airport/${rt.originIata}" style="color: #681C35; text-decoration: none;">${escapeHtml(rt.originIata)}</a>
              &rarr;
              <a href="${SITE_ORIGIN}/airport/${rt.destinationIata}" style="color: #681C35; text-decoration: none;">${escapeHtml(rt.destinationIata)}</a>
            </div>
            <p style="font-size: 13px; font-weight: 600; color: #25232A; margin: 0 0 6px;">${escapeHtml(rt.originName)} to ${escapeHtml(rt.destinationName)}</p>
            <p style="font-size: 12px; color: #504e57; margin: 0 0 8px;">Distance: ${rt.distanceKm.toLocaleString()} km &bull; Typical Flight Time: ${Math.floor(rt.typicalDurationMinutes / 60)}h ${rt.typicalDurationMinutes % 60}m</p>
            <p style="font-size: 12px; color: #777780; margin: 0 0 8px;">Carriers: ${escapeHtml(rt.operatingAirlines.join(', '))}</p>
            <div style="font-size: 12px; color: #681C35; font-weight: 600;">
              Flights: ${rt.flightNumbers.map(fn => `<a href="${SITE_ORIGIN}/flight/${fn}" style="color: #681C35; margin-right: 8px;">${escapeHtml(fn)}</a>`).join('')}
            </div>
          </div>
        `
        ).join('\n')}
      </div>
      ${renderRelatedGuidesFooterHtml(3)}
    </main>`
  })
);

writeRouteFiles(
  '/map',
  renderPageHtml({
    title: 'Live Canadian Airspace Radar & ADS-B Transponder Map – World Flight Schedule',
    desc: 'Live Canadian airspace radar tracking with Mode-S ADS-B altitude, airspeed, and heading telemetry across NAV CANADA Area Control Centres.',
    canonicalPath: '/map',
    jsonLd: buildBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Live Radar Map', path: '/map' }
    ]),
    bodyHtml: `
    <main style="max-width: 1200px; margin: 0 auto; padding: 32px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <span style="font-size: 11px; font-weight: 700; color: #059669; text-transform: uppercase;">NAV CANADA Operational Airspace Surveillance</span>
      <h1 style="font-size: 30px; font-weight: 800; color: #25232A; margin: 6px 0 10px;">Live Canadian Airspace Radar Map &amp; FIR Control Sectors</h1>
      <p style="font-size: 14px; color: #504e57; line-height: 1.6; max-width: 900px; margin: 0 0 20px;">
        Real-time commercial aircraft tracking across Toronto (CZYZ), Vancouver (CZVR), Montréal (CZUL), Edmonton (CZEG), Winnipeg (CZWG), Moncton (CZQM), and Gander Oceanic (CZQX) Flight Information Regions powered by terrestrial and space-based Mode-S ADS-B telemetry.
      </p>
      <div style="background: #FAF9FA; border: 1px solid #E8E5E8; border-radius: 8px; padding: 16px; margin-bottom: 24px; font-size: 13px; color: #3a3740; line-height: 1.6;">
        <strong>FIR Surveillance Methodology:</strong> Canadian high-altitude en-route corridors rely on dual terrestrial 1090 MHz Extended Squitter (1090ES) receivers and Iridium NEXT hosted ADS-B payloads for uninterrupted northern Hudson Bay, Nunavut, and North Atlantic organized track supervision.
      </div>
      <h2 style="font-size: 18px; font-weight: 700; color: #25232A; margin-bottom: 12px;">Active Airborne &amp; Transponder-Tracked Flights (${liveFlights.length})</h2>
      ${renderFlightsTableHtml(liveFlights, 25, 'Live ADS-B Transponder Tracks')}
      ${renderRelatedGuidesFooterHtml(3)}
    </main>`
  })
);

// 6. PRE-RENDER ABOUT, CONTACT, PRIVACY, TERMS, DISCLAIMER, EDITORIAL POLICY (MATCHING LegalPage.tsx >=250 words)
console.log('Pre-rendering Legal & Editorial Compliance Pages...');
writeRouteFiles(
  '/about',
  renderPageHtml({
    title: 'About Us – World Flight Schedule',
    desc: 'Learn about World Flight Schedule, our editorial independence, aviation engineering expertise, and verified Canadian civil aviation timetable feeds.',
    canonicalPath: '/about',
    jsonLd: [
      buildBreadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: 'About Us', path: '/about' }
      ]),
      {
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        name: 'About World Flight Schedule',
        url: `${SITE_ORIGIN}/about`
      }
    ],
    bodyHtml: `
    <main style="max-width: 900px; margin: 0 auto; padding: 32px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.7; color: #3a3740;">
      <h1 style="font-size: 28px; font-weight: 800; color: #25232A; border-bottom: 1px solid #E8E5E8; padding-bottom: 12px;">About World Flight Schedule</h1>
      <p><strong>WORLD FLIGHT SCHEDULE</strong> is an independent international aviation information platform dedicated to delivering transparent, accurate, and timely civil aviation data. We provide global passengers, airline crew, aviation analysts, and air freight forwarders with comprehensive flight schedules, airport timetables, aircraft telemetry, and operational news.</p>
      <h2 style="font-size: 18px; font-weight: 700; color: #681C35; margin-top: 24px;">Our Core Pillars</h2>
      <ul>
        <li><strong>Data Accuracy Over Speculation:</strong> We ingest timetable records and transponder telemetry strictly from verified civil aviation authorities and authenticated ADS-B networks. We never fabricate flight numbers or invent statistics.</li>
        <li><strong>Global Accessibility:</strong> Our platform serves international travelers across 190+ sovereign airspace jurisdictions with standardized UTC and airport local time calculations.</li>
        <li><strong>Editorial Integrity:</strong> All technical guides, route analyses, and aircraft directory entries undergo review by certified dispatchers and aviation specialists.</li>
      </ul>
      <h2 style="font-size: 18px; font-weight: 700; color: #681C35; margin-top: 24px;">Operational Data Architecture &amp; Coverage</h2>
      <p>Our backend integrates multi-source timetable feeds alongside ADS-B Mode-S telemetry provided by the OpenSky Network, Transport Canada civil aerodrome publications, NAV CANADA Flight Information Region boundaries, and verified airport master records across all ten provinces and three territories.</p>
      <p>From major transcontinental gateways such as <a href="${SITE_ORIGIN}/airport/YYZ" style="color: #681C35; font-weight: 600;">Toronto Pearson (YYZ)</a>, <a href="${SITE_ORIGIN}/airport/YVR" style="color: #681C35; font-weight: 600;">Vancouver (YVR)</a>, <a href="${SITE_ORIGIN}/airport/YUL" style="color: #681C35; font-weight: 600;">Montréal–Trudeau (YUL)</a>, and <a href="${SITE_ORIGIN}/airport/YYC" style="color: #681C35; font-weight: 600;">Calgary (YYC)</a> to northern Arctic and regional corridors including <a href="${SITE_ORIGIN}/airport/YFB" style="color: #681C35; font-weight: 600;">Iqaluit (YFB)</a>, <a href="${SITE_ORIGIN}/airport/YZF" style="color: #681C35; font-weight: 600;">Yellowknife (YZF)</a>, <a href="${SITE_ORIGIN}/airport/YXY" style="color: #681C35; font-weight: 600;">Whitehorse (YXY)</a>, and <a href="${SITE_ORIGIN}/airport/YTZ" style="color: #681C35; font-weight: 600;">Billy Bishop Toronto City Airport (YTZ)</a>, every airport board and fleet entry is structured to eliminate stale guesswork and provide clean, standardized reference data.</p>
      <h2 style="font-size: 18px; font-weight: 700; color: #681C35; margin-top: 24px;">Independent Editorial Stewardship</h2>
      <p>World Flight Schedule (manufaktur.biz.id) operates independently from commercial ticket resellers and airlines. Our research library publishes long-form technical explainers on cold-weather de-icing holdover engineering, Air Passenger Protection Regulations (APPR), Mirabel Airbus A220 assembly, and space-based polar ADS-B surveillance, backed by transparent source citations and direct reader correction channels.</p>
      ${renderRelatedGuidesFooterHtml(3)}
    </main>`
  })
);

writeRouteFiles(
  '/contact',
  renderPageHtml({
    title: 'Contact Operations & Editorial Desk – World Flight Schedule',
    desc: 'Contact our aviation operations desk and editorial fact-checking department regarding schedule corrections, press inquiries, or data syndication.',
    canonicalPath: '/contact',
    jsonLd: [
      buildBreadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: 'Contact Desk', path: '/contact' }
      ]),
      {
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        name: 'Contact World Flight Schedule Editorial & Technical Desk',
        url: `${SITE_ORIGIN}/contact`
      }
    ],
    bodyHtml: `
    <main style="max-width: 900px; margin: 0 auto; padding: 32px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.7; color: #3a3740;">
      <h1 style="font-size: 28px; font-weight: 800; color: #25232A; border-bottom: 1px solid #E8E5E8; padding-bottom: 12px;">Contact Our Editorial &amp; Technical Desk</h1>
      <p>Inquire regarding data syndication, press inquiries, schedule corrections, aerodrome specification updates, or technical support. Our aviation data coordinators monitor timetable feed adjustments, gate reallocations, runway designations, and carrier alliance updates continuously.</p>
      <div style="background: #FAF9FA; border: 1px solid #E8E5E8; border-radius: 8px; padding: 20px; margin-top: 20px;">
        <h2 style="font-size: 16px; font-weight: 700; color: #681C35; margin-top: 0;">Operations Desk Contact Details</h2>
        <p><strong>Official Admin Desk:</strong> anissagustiawati@gmail.com</p>
        <p><strong>Direct Editorial Inquiries:</strong> <a href="mailto:anissagustiawati@gmail.com" style="color: #681C35; font-weight: 600;">anissagustiawati@gmail.com</a></p>
        <p><strong>Operating Response Hours:</strong> 24/7 Global Airspace Coverage (1&ndash;2 business days for formal corrections)</p>
        <p><strong>Primary Publisher Domain:</strong> https://manufaktur.biz.id</p>
      </div>
      <h2 style="font-size: 18px; font-weight: 700; color: #681C35; margin-top: 24px;">How We Route Aviation &amp; Compliance Inquiries</h2>
      <ul>
        <li><strong>Schedule Verification Desk:</strong> Please include the flight designator (for example, <a href="${SITE_ORIGIN}/flight/AC103" style="color: #681C35;">AC103</a> or <a href="${SITE_ORIGIN}/flight/WS711" style="color: #681C35;">WS711</a>), the IATA or ICAO aerodrome code, and scheduled local or UTC departure window so coordinators can audit the timetable filing.</li>
        <li><strong>Technical Editorial Review:</strong> Aviation engineers, dispatchers, and travel policy analysts may submit primary Transport Canada references, type-certificate updates, or Air Passenger Protection Regulations (APPR) citations directly to our editorial desk.</li>
        <li><strong>Privacy, Copyright &amp; Rights Governance:</strong> Requests regarding GDPR, CCPA/CPRA cookie governance, intellectual property attribution, or advertising inquiries are documented and resolved under our <a href="${SITE_ORIGIN}/privacy" style="color: #681C35; font-weight: 600;">Privacy Policy</a> and <a href="${SITE_ORIGIN}/editorial-policy" style="color: #681C35; font-weight: 600;">Editorial Policy</a>.</li>
      </ul>
      ${renderRelatedGuidesFooterHtml(3)}
    </main>`
  })
);

writeRouteFiles(
  '/privacy',
  renderPageHtml({
    title: 'Privacy Policy & Cookie Disclosure – World Flight Schedule',
    desc: 'Privacy policy, Google AdSense cookie disclosures, GDPR, CCPA/CPRA, and COPPA compliance practices for World Flight Schedule (manufaktur.biz.id).',
    canonicalPath: '/privacy',
    jsonLd: buildBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Privacy Policy', path: '/privacy' }
    ]),
    bodyHtml: `
    <main style="max-width: 900px; margin: 0 auto; padding: 32px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.7; color: #3a3740;">
      <h1 style="font-size: 28px; font-weight: 800; color: #25232A; border-bottom: 1px solid #E8E5E8; padding-bottom: 12px;">Privacy Policy &amp; Cookie Disclosure</h1>
      <p style="font-size: 12px; color: #777780;">Last updated: November 2, 2026 &middot; Compliant with GDPR, CCPA, and Google AdSense publisher policies.</p>
      <p>World Flight Schedule (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) respects your privacy and is dedicated to protecting your personal data. This comprehensive Privacy Policy outlines how information is collected, processed, and safeguarded when you access <strong>manufaktur.biz.id</strong> and our global aviation information services.</p>
      <h2 style="font-size: 18px; font-weight: 700; color: #681C35;">1. Personal Information We Do Not Collect</h2>
      <p>World Flight Schedule is a public civil aviation intelligence and flight tracking reference. We do not require user account registration, credit card details, or personal passenger identification to view live flight radars, airport arrival/departure timetables, or aeronautical research guides.</p>
      <h2 style="font-size: 18px; font-weight: 700; color: #681C35;">2. Google AdSense &amp; Third-Party Advertising Vendors</h2>
      <ul>
        <li><strong>Third-party vendors, including Google, use cookies</strong> to serve ads based on a user&apos;s prior visits to this website or other websites on the internet.</li>
        <li><strong>Google&apos;s use of advertising cookies</strong> enables it and its partners to serve ads to users based on their visit to our sites and/or other sites on the Internet.</li>
        <li>Users may opt out of personalized advertising by visiting <a href="https://adssettings.google.com" rel="noopener noreferrer" style="color: #681C35;">Google Ads Settings</a>, <a href="https://www.aboutads.info/choices/" rel="noopener noreferrer" style="color: #681C35;">AboutAds.info</a>, or the <a href="https://optout.networkadvertising.org/" rel="noopener noreferrer" style="color: #681C35;">Network Advertising Initiative (NAI)</a> opt-out tool.</li>
      </ul>
      <h2 style="font-size: 18px; font-weight: 700; color: #681C35;">3. Cookies, Web Beacons &amp; Local Storage</h2>
      <p>Our website uses technical cookies and browser local storage to preserve user interface preferences (such as selected airport timetable tabs, UTC vs local time displays, and search filter parameters). These do not contain personally identifiable information.</p>
      <h2 style="font-size: 18px; font-weight: 700; color: #681C35;">4. European Economic Area (GDPR) Compliance</h2>
      <p>For visitors residing within the European Economic Area (EEA), United Kingdom, and Switzerland, our data processing activities comply with the General Data Protection Regulation (GDPR).</p>
      <h2 style="font-size: 18px; font-weight: 700; color: #681C35;">5. California Consumer Privacy Act (CCPA / CPRA)</h2>
      <p>Under the CCPA and CPRA, California residents are entitled to know what categories of personal data are collected. <strong>We do not sell, rent, or monetize your personal information to any third party.</strong></p>
      <h2 style="font-size: 18px; font-weight: 700; color: #681C35;">6. Children&apos;s Privacy (COPPA Compliance)</h2>
      <p>Our services are directed to adult air travel consumers, aviation professionals, and academic researchers. We do not knowingly solicit or collect information from children under 13 years of age.</p>
      <h2 style="font-size: 18px; font-weight: 700; color: #681C35;">7. Contact the Data Protection Officer</h2>
      <p>For privacy inquiries, contact <strong>anissagustiawati@gmail.com</strong> or visit our <a href="${SITE_ORIGIN}/contact" style="color: #681C35; font-weight: 600;">Contact Desk</a>.</p>
      ${renderRelatedGuidesFooterHtml(3)}
    </main>`
  })
);

writeRouteFiles(
  '/terms',
  renderPageHtml({
    title: 'Terms and Conditions – World Flight Schedule',
    desc: 'Standard operating agreement, acceptable usage policy, and intellectual property protections governing World Flight Schedule.',
    canonicalPath: '/terms',
    jsonLd: buildBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Terms & Conditions', path: '/terms' }
    ]),
    bodyHtml: `
    <main style="max-width: 900px; margin: 0 auto; padding: 32px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.7; color: #3a3740;">
      <h1 style="font-size: 28px; font-weight: 800; color: #25232A; border-bottom: 1px solid #E8E5E8; padding-bottom: 12px;">Terms and Conditions</h1>
      <p>By accessing World Flight Schedule (<strong>manufaktur.biz.id</strong>), including its airport flight boards, Canadian carrier schedules, aircraft specification references, live radar maps, and technical editorial guides, you agree to comply with and be bound by the following Terms and Conditions.</p>
      <h2 style="font-size: 18px; font-weight: 700; color: #681C35;">1. Acceptable Usage &amp; Fair Access</h2>
      <p>You agree to use our flight search, airport directories, and live tracking radar strictly for lawful personal, academic, or informational reference. High-frequency automated scraping, denial-of-service behavior, unauthorized framing of proprietary schedule matrices, or any activity that degrades platform responsiveness for fellow aviation readers is strictly prohibited.</p>
      <h2 style="font-size: 18px; font-weight: 700; color: #681C35;">2. Informational Aviation Schedules Only</h2>
      <p>All flight departure times, arrival windows, gate indicators, equipment models, and telemetry coordinates presented on World Flight Schedule are supplied for general travel planning and aviation research. Carriers may adjust gates, equipment, or departure slots at short notice due to air traffic control flow programs, de-icing queues, or severe weather diversions. Users must confirm final boarding obligations directly with their operating carrier.</p>
      <h2 style="font-size: 18px; font-weight: 700; color: #681C35;">3. Intellectual Property &amp; Editorial Licensing</h2>
      <p>All original aviation research articles, structured directory layouts, software interfaces, visual brand identity, and compiled timetable schemas are protected under international copyright and intellectual property conventions. Short academic citations are permitted with clear source attribution and a canonical link back to the original page on manufaktur.biz.id.</p>
      <h2 style="font-size: 18px; font-weight: 700; color: #681C35;">4. Limitation of Liability &amp; Governing Inquiries</h2>
      <p>World Flight Schedule makes no warranty regarding uninterrupted availability or real-time completeness of external third-party transponder or airline feeds and assumes no liability for missed connections, travel expenses, or commercial losses arising from schedule reliance. Questions regarding these Terms may be directed to <strong>anissagustiawati@gmail.com</strong> or via our <a href="${SITE_ORIGIN}/contact" style="color: #681C35; font-weight: 600;">Contact Desk</a>.</p>
      ${renderRelatedGuidesFooterHtml(3)}
    </main>`
  })
);

writeRouteFiles(
  '/disclaimer',
  renderPageHtml({
    title: 'Aviation Data Accuracy & Navigational Disclaimer – World Flight Schedule',
    desc: 'Mandatory civil aviation operational notice clarifying informational-only schedule and ADS-B telemetry usage.',
    canonicalPath: '/disclaimer',
    jsonLd: buildBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Aviation Disclaimer', path: '/disclaimer' }
    ]),
    bodyHtml: `
    <main style="max-width: 900px; margin: 0 auto; padding: 32px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.7; color: #3a3740;">
      <h1 style="font-size: 28px; font-weight: 800; color: #25232A; border-bottom: 1px solid #E8E5E8; padding-bottom: 12px;">Aviation Data Accuracy &amp; Navigational Disclaimer</h1>
      <div style="padding: 16px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; color: #78350f; margin: 16px 0;">
        <strong>NOT FOR OPERATIONAL FLIGHT PLANNING OR IN-FLIGHT NAVIGATION:</strong> Flight schedules, estimated times, altitudes, aircraft tracks, and gate assignments displayed on this platform are for general informational purposes only. Licensed aircrews must consult official NOTAMs, NAV CANADA Aeronautical Information Publications (AIP), METAR/TAF aviation weather advisories, and certified airline dispatch releases.
      </div>
      <h2 style="font-size: 18px; font-weight: 700; color: #681C35;">Dynamic Schedule &amp; Airspace Variability</h2>
      <p>While World Flight Schedule implements rigorous automated normalization and timetable cross-checks across Canadian international, regional, and Arctic aerodromes, commercial airline schedules, tail-number equipment substitutions, air traffic control Ground Delay Programs (GDPs), and winter de-icing holdover delays occur dynamically.</p>
      <h2 style="font-size: 18px; font-weight: 700; color: #681C35;">ADS-B Telemetry &amp; Coverage Constraints</h2>
      <p>Mode-S ADS-B altitude, velocity, and track indicators depend on terrestrial receiver reception and satellite-based ADS-B relay intervals over oceanic and high-latitude northern airspace. Apparent gaps in ground speed or low-altitude taxi coverage do not represent aircraft emergencies or route cancellations.</p>
      <h2 style="font-size: 18px; font-weight: 700; color: #681C35;">Passenger Verification Obligation</h2>
      <p>Passengers traveling through Canadian or transborder pre-clearance terminals must always re-confirm check-in cutoff deadlines, boarding times, gate reallocations, and baggage claim carousels directly with their operating airline or the official airport Flight Information Display System (FIDS). Editorial &amp; data discrepancy reports can be sent to <strong>anissagustiawati@gmail.com</strong>.</p>
      ${renderRelatedGuidesFooterHtml(3)}
    </main>`
  })
);

writeRouteFiles(
  '/editorial-policy',
  renderPageHtml({
    title: 'Editorial Standards & Fact-Checking Policy – World Flight Schedule',
    desc: 'Our commitment to journalistic integrity, factual primary sources, human aviation review, and prompt corrections.',
    canonicalPath: '/editorial-policy',
    jsonLd: buildBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Editorial Policy', path: '/editorial-policy' }
    ]),
    bodyHtml: `
    <main style="max-width: 900px; margin: 0 auto; padding: 32px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.7; color: #3a3740;">
      <h1 style="font-size: 28px; font-weight: 800; color: #25232A; border-bottom: 1px solid #E8E5E8; padding-bottom: 12px;">Editorial Standards &amp; Fact Verification Policy</h1>
      <p>World Flight Schedule adheres to strict standards of civil aviation journalism, engineering transparency, and timetable verification across every directory page and long-form technical report hosted at <strong>manufaktur.biz.id</strong>.</p>
      <h2 style="font-size: 18px; font-weight: 700; color: #681C35;">1. Primary-Source Factual Verification</h2>
      <p>We prohibit the fabrication of aviation news, traffic statistics, official agency statements, carrier fleet orders, or aerodrome runway specifications. All technical claims, aircraft weights, holdover times, and regulatory obligations are grounded in primary authoritative sources: Transport Canada Canadian Aviation Regulations (CARs), Air Passenger Protection Regulations (APPR), NAV CANADA airspace directives, manufacturer Type Certificate Data Sheets (TCDS), and official airport authority engineering reports.</p>
      <h2 style="font-size: 18px; font-weight: 700; color: #681C35;">2. Specialist Author Attribution &amp; Review</h2>
      <p>Every long-form guide published in our Aviation News &amp; Operational Insights repository carries transparent author attribution, technical credentials, publication dates, and structured reading times. Content covering winter glycol holdover tables, space-based ADS-B, Pratt &amp; Whitney geared turbofan dispatch metrics, and polar ETOPS routing undergoes verification against current operational standards before publication.</p>
      <h2 style="font-size: 18px; font-weight: 700; color: #681C35;">3. Editorial Independence &amp; Advertising Separation</h2>
      <p>Our editorial analyses and airport/airline directories remain strictly independent from commercial advertising placements or carrier sponsorships. Automated display advertising serves strictly to sustain open-access aviation documentation without influencing route evaluations, carrier profiles, or regulatory explanations.</p>
      <h2 style="font-size: 18px; font-weight: 700; color: #681C35;">4. Prompt Corrections &amp; Archive Integrity</h2>
      <p>When civil aviation rules evolve, runways are re-designated, or a reader identifies a factual discrepancy in any article or aerodrome profile, our editorial desk (<strong>anissagustiawati@gmail.com</strong>) audits the primary filing and updates the record promptly with refreshed timestamps and clear documentation.</p>
      ${renderRelatedGuidesFooterHtml(3)}
    </main>`
  })
);

// 7. PRE-RENDER ALL CANADIAN AIRPORTS WITH RICH UNIQUE PROFILE + DEPARTURES + ARRIVALS
console.log(`Pre-rendering all ${CANADIAN_AIRPORTS.length} Airports...`);
CANADIAN_AIRPORTS.forEach(apt => {
  const deps = aviationService.getDepartures(apt.iata);
  const arrs = aviationService.getArrivals(apt.iata);
  const terminalList = (apt.terminals || ['Main Terminal']).join(' | ');
  const runwayList = (apt.runways || ['Commercial Paved']).join(' | ');
  const utcStr = apt.utcOffset >= 0 ? `+${apt.utcOffset}` : `${apt.utcOffset}`;

  const html = renderPageHtml({
    title: `${apt.iata} – ${apt.name} Live Flight Board & Aerodrome Info`,
    desc: `Live flight departures, arrivals, runway dimensions, elevation (${apt.elevationFeet ?? 0} ft), and terminal gates for ${apt.name} (${apt.iata}/${apt.icao}) in ${apt.city}.`,
    canonicalPath: `/airport/${apt.iata}`,
    jsonLd: [
      buildBreadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: 'Airports Directory', path: '/airports' },
        { name: `${apt.iata} – ${apt.name}`, path: `/airport/${apt.iata}` }
      ]),
      {
        '@context': 'https://schema.org',
        '@type': 'Airport',
        name: apt.name,
        iataCode: apt.iata,
        icaoCode: apt.icao,
        url: `${SITE_ORIGIN}/airport/${apt.iata}`,
        address: {
          '@type': 'PostalAddress',
          addressLocality: apt.city,
          addressCountry: 'CA'
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: apt.latitude,
          longitude: apt.longitude
        }
      }
    ],
    bodyHtml: `
    <main style="max-width: 1100px; margin: 0 auto; padding: 32px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <nav style="font-size: 12px; color: #777780; margin-bottom: 14px;">
        <a href="${SITE_ORIGIN}/" style="color: #681C35; text-decoration: none;">Home</a> &gt;
        <a href="${SITE_ORIGIN}/airports" style="color: #681C35; text-decoration: none;">Airports</a> &gt;
        <span>${escapeHtml(apt.iata)} (${escapeHtml(apt.icao)})</span>
      </nav>
      <span style="font-size: 12px; font-weight: 700; color: #681C35;">CANADIAN AERODROME TELEMETRY &bull; ${escapeHtml(apt.type || 'International')}</span>
      <h1 style="font-size: 28px; font-weight: 800; color: #25232A; margin: 6px 0 8px;">${escapeHtml(apt.name)} (${escapeHtml(apt.iata)} / ${escapeHtml(apt.icao)})</h1>
      <p style="font-size: 14px; color: #504e57; margin: 0 0 18px;">
        Located in ${escapeHtml(apt.city)}, Canada &bull; Timezone: ${escapeHtml(apt.timezone)} (UTC ${utcStr}) &bull; Coordinates: ${apt.latitude.toFixed(4)}&deg;N, ${apt.longitude.toFixed(4)}&deg;E &bull; Elevation: ${apt.elevationFeet ?? 0} ft MSL
      </p>
      <div style="background: #FAF9FA; border: 1px solid #E8E5E8; border-radius: 8px; padding: 16px; margin-bottom: 20px; font-size: 13px;">
        <div><strong>Passenger Terminals:</strong> ${escapeHtml(terminalList)}</div>
        <div style="margin-top: 6px;"><strong>Certified Runways:</strong> ${escapeHtml(runwayList)}</div>
      </div>
      <div style="background: #ffffff; border: 1px solid #E8E5E8; border-radius: 8px; padding: 18px; margin-bottom: 24px; font-size: 13px; color: #3a3740; line-height: 1.65;">
        <h2 style="font-size: 16px; font-weight: 700; color: #681C35; margin: 0 0 8px;">Aerodrome Airspace &amp; Operational Overview for ${escapeHtml(apt.iata)}</h2>
        <p style="margin: 0 0 8px;">
          <strong>${escapeHtml(apt.name)}</strong> (IATA: <strong>${escapeHtml(apt.iata)}</strong>, ICAO: <strong>${escapeHtml(apt.icao)}</strong>) operates as a certified ${escapeHtml(apt.type || 'International')} facility serving ${escapeHtml(apt.city)} within NAV CANADA controlled airspace at an elevation of ${apt.elevationFeet ?? 0} feet above mean sea level. Currently, ${deps.length} outbound departures and ${arrs.length} inbound arrivals are actively indexed on today&apos;s daily schedule across ${escapeHtml(terminalList)}.
        </p>
        <p style="margin: 0;">
          Runway infrastructure spans ${escapeHtml(runwayList)}, accommodating scheduled mainline narrow-body, wide-body, regional turboprop, or dedicated overnight cargo aircraft. Flight dispatchers and passengers should allow additional winter buffer time during freezing precipitation events for Type I/IV glycol de-icing clearance, and consult official airline check-in advisories prior to terminal arrival.
        </p>
      </div>
      <h2 style="font-size: 18px; font-weight: 700; color: #25232A; margin: 0 0 12px;">Scheduled Departures from ${escapeHtml(apt.iata)} (${deps.length})</h2>
      ${renderFlightsTableHtml(deps, 20, `${apt.iata} Departures`)}
      <h2 style="font-size: 18px; font-weight: 700; color: #25232A; margin: 28px 0 12px;">Scheduled Arrivals into ${escapeHtml(apt.iata)} (${arrs.length})</h2>
      ${renderFlightsTableHtml(arrs, 20, `${apt.iata} Arrivals`)}
      ${renderRelatedGuidesFooterHtml(3)}
    </main>`
  });
  writeRouteFiles(`/airport/${apt.iata}`, html);
});

// 8. PRE-RENDER ALL CANADIAN AIRLINES
console.log(`Pre-rendering all ${CANADIAN_AIRLINES.length} Airlines...`);
CANADIAN_AIRLINES.forEach(al => {
  const { flights } = aviationService.getFlights({ airline: al.iata, pageSize: 50 });
  const hubsLinks = al.hubAirports
    .map(h => `<a href="${SITE_ORIGIN}/airport/${h}" style="color: #681C35; font-weight: 700;">${escapeHtml(h)}</a>`)
    .join(', ');

  const html = renderPageHtml({
    title: `${al.name} (${al.iata}/${al.icao}) Fleet & Daily Flight Schedules`,
    desc: `Track active flights, fleet count (${al.fleetCount ?? 0} aircraft), callsign ${al.callsign}, and hub operations for ${al.name} (${al.iata}).`,
    canonicalPath: `/airline/${al.iata}`,
    jsonLd: [
      buildBreadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: 'Airlines Directory', path: '/airlines' },
        { name: `${al.name} (${al.iata})`, path: `/airline/${al.iata}` }
      ]),
      {
        '@context': 'https://schema.org',
        '@type': 'Airline',
        name: al.name,
        iataCode: al.iata,
        icaoCode: al.icao,
        url: `${SITE_ORIGIN}/airline/${al.iata}`
      }
    ],
    bodyHtml: `
    <main style="max-width: 1100px; margin: 0 auto; padding: 32px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <nav style="font-size: 12px; color: #777780; margin-bottom: 14px;">
        <a href="${SITE_ORIGIN}/" style="color: #681C35; text-decoration: none;">Home</a> &gt;
        <a href="${SITE_ORIGIN}/airlines" style="color: #681C35; text-decoration: none;">Airlines</a> &gt;
        <span>${escapeHtml(al.name)} (${escapeHtml(al.iata)})</span>
      </nav>
      <span style="font-size: 12px; font-weight: 700; color: #681C35;">CANADIAN AIRLINE PROFILE</span>
      <h1 style="font-size: 28px; font-weight: 800; color: #25232A; margin: 6px 0 8px;">${escapeHtml(al.name)} (${escapeHtml(al.iata)} / ${escapeHtml(al.icao)})</h1>
      <p style="font-size: 14px; color: #504e57; margin: 0 0 18px;">
        Radio Callsign: <strong>${escapeHtml(al.callsign)}</strong> &bull; Alliance / Role: ${escapeHtml(al.alliance || 'Independent')} &bull; Operating Fleet: ${al.fleetCount ?? 0} aircraft &bull; Primary Hubs: ${hubsLinks}
      </p>
      <div style="background: #FAF9FA; border: 1px solid #E8E5E8; border-radius: 8px; padding: 18px; margin-bottom: 24px; font-size: 13px; color: #3a3740; line-height: 1.65;">
        <h2 style="font-size: 16px; font-weight: 700; color: #681C35; margin: 0 0 8px;">Carrier Network, Air Operator Certificate &amp; Scheduling Profile</h2>
        <p style="margin: 0 0 8px;">
          <strong>${escapeHtml(al.name)}</strong> operates across Canadian civil airspace under IATA two-letter code <strong>${escapeHtml(al.iata)}</strong>, ICAO three-letter designator <strong>${escapeHtml(al.icao)}</strong>, and ATC radio telephony callsign <strong>${escapeHtml(al.callsign)}</strong>. With approximately ${al.fleetCount ?? 0} commercial aircraft deployed, the carrier links primary hubs at ${hubsLinks} into Canada&apos;s domestic, transborder, Arctic, or international route networks.
        </p>
        <p style="margin: 0;">
          Today&apos;s synchronized timetable tracks ${flights.length} scheduled operations for ${escapeHtml(al.name)}, displaying assigned aircraft types, gate readiness, and block timing. Passengers and dispatch observers can open any individual flight row below for live terminal gates, UTC departures, and ADS-B transponder tracking parameters.
        </p>
      </div>
      <h2 style="font-size: 18px; font-weight: 700; color: #25232A; margin: 0 0 12px;">Active Flight Schedules Operated by ${escapeHtml(al.name)} (${flights.length})</h2>
      ${renderFlightsTableHtml(flights, 50, `${al.name} Operations`)}
      ${renderRelatedGuidesFooterHtml(3)}
    </main>`
  });
  writeRouteFiles(`/airline/${al.iata}`, html);
});

// 9. PRE-RENDER ALL COMMERCIAL AIRCRAFT TYPES
console.log(`Pre-rendering all ${CANADIAN_AIRCRAFT.length} Aircraft Types...`);
CANADIAN_AIRCRAFT.forEach(ac => {
  const { flights } = aviationService.getFlights({ aircraftType: ac.icaoType, pageSize: 50 });
  const cruiseKts = Math.round(ac.cruisingSpeedKmH * 0.539957);
  const isFreighter = ac.maxPassengers === 0;
  const capacityLabel = isFreighter ? 'Cargo Freighter (0 pax, main-deck containerized cargo)' : `${ac.maxPassengers} passengers`;

  const html = renderPageHtml({
    title: `${ac.model} (${ac.icaoType}) Aircraft Specifications & Flights – World Flight Schedule`,
    desc: `Explore technical specifications for ${ac.model} (${ac.icaoType}): ${ac.wingspanMeters}m wingspan, ${ac.rangeKm.toLocaleString()} km certified range, ${ac.cruisingSpeedKmH} km/h (${cruiseKts} kts) cruise speed, and active Canadian flights.`,
    canonicalPath: `/aircraft/${ac.icaoType}`,
    jsonLd: [
      buildBreadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: 'Aircraft Directory', path: '/aircraft' },
        { name: `${ac.model} (${ac.icaoType})`, path: `/aircraft/${ac.icaoType}` }
      ]),
      {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: `${ac.model} (${ac.icaoType}) Performance Specifications & Canadian Operations`,
        description: `Technical aerodrome compatibility and route performance profile for the ${ac.manufacturer} ${ac.model}.`,
        url: `${SITE_ORIGIN}/aircraft/${ac.icaoType}`
      }
    ],
    bodyHtml: `
    <main style="max-width: 1100px; margin: 0 auto; padding: 32px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <nav style="font-size: 12px; color: #777780; margin-bottom: 14px;">
        <a href="${SITE_ORIGIN}/" style="color: #681C35; text-decoration: none;">Home</a> &gt;
        <a href="${SITE_ORIGIN}/aircraft" style="color: #681C35; text-decoration: none;">Aircraft</a> &gt;
        <span>${escapeHtml(ac.model)} (${escapeHtml(ac.icaoType)})</span>
      </nav>
      <span style="font-size: 12px; font-weight: 700; color: #681C35;">AIRCRAFT PERFORMANCE SPECIFICATION</span>
      <h1 style="font-size: 28px; font-weight: 800; color: #25232A; margin: 6px 0 8px;">${escapeHtml(ac.model)} (${escapeHtml(ac.icaoType)})</h1>
      <p style="font-size: 14px; color: #504e57; margin: 0 0 18px;">
        Manufacturer: <strong>${escapeHtml(ac.manufacturer)}</strong> &bull; Category: ${escapeHtml(ac.typeCategory)} &bull; Configuration: ${capacityLabel} &bull; Certified Range: ${ac.rangeKm.toLocaleString()} km
      </p>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; background: #FAF9FA; border: 1px solid #E8E5E8; border-radius: 8px; padding: 16px; margin-bottom: 20px; font-size: 13px;">
        <div><strong>Wingspan:</strong> ${ac.wingspanMeters} m</div>
        <div><strong>Overall Length:</strong> ${ac.lengthMeters} m</div>
        <div><strong>Cruising Speed:</strong> ${ac.cruisingSpeedKmH} km/h (${cruiseKts} kts)</div>
        <div><strong>Powerplants:</strong> ${ac.engineCount}x ${escapeHtml(ac.engineType)}</div>
      </div>
      <div style="background: #ffffff; border: 1px solid #E8E5E8; border-radius: 8px; padding: 18px; margin-bottom: 24px; font-size: 13px; color: #3a3740; line-height: 1.65;">
        <h2 style="font-size: 16px; font-weight: 700; color: #681C35; margin: 0 0 8px;">Airframe Engineering &amp; Canadian Route Deployment</h2>
        <p style="margin: 0 0 8px;">
          Built by <strong>${escapeHtml(ac.manufacturer)}</strong> and registered under ICAO type code <strong>${escapeHtml(ac.icaoType)}</strong>, the <strong>${escapeHtml(ac.model)}</strong> measures ${ac.wingspanMeters} meters from wingtip to wingtip with an overall fuselage length of ${ac.lengthMeters} meters. Powered by ${ac.engineCount} ${escapeHtml(ac.engineType)} engines, it achieves a typical high-altitude cruising airspeed of ${ac.cruisingSpeedKmH} km/h (${cruiseKts} knots) across a certified operating range of ${ac.rangeKm.toLocaleString()} km.
        </p>
        <p style="margin: 0;">
          ${isFreighter
            ? `Operating strictly as a dedicated main-deck cargo freighter without passenger seating, the ${escapeHtml(ac.icaoType)} supports overnight Canadian air freight hubs in Hamilton (YHM), Toronto (YYZ), Vancouver (YVR), Calgary (YYC), Montréal-Mirabel (YMX), and Moncton (YQM).`
            : `With seating for up to ${ac.maxPassengers} passengers in standard Canadian operator layouts, the ${escapeHtml(ac.icaoType)} currently appears on ${flights.length} verified daily flights spanning domestic regional connections and major hub trunks.`}
        </p>
      </div>
      <h2 style="font-size: 18px; font-weight: 700; color: #25232A; margin: 0 0 12px;">Scheduled Canadian Flights Operating the ${escapeHtml(ac.model)} (${flights.length})</h2>
      ${renderFlightsTableHtml(flights, 50, `${ac.model} (${ac.icaoType})`)}
      ${renderRelatedGuidesFooterHtml(3)}
    </main>`
  });
  writeRouteFiles(`/aircraft/${ac.icaoType}`, html);
});

// 10. PRE-RENDER ALL UNIQUE FLIGHT DETAIL PAGES (/flight/<FLIGHTNUMBER>)
console.log(`Pre-rendering ${uniqueFlightsMap.size} Individual Flight Detail Pages...`);
uniqueFlightsMap.forEach(flight => {
  const depApt = aviationService.getAirportByCode(flight.departureAirportIata);
  const arrApt = aviationService.getAirportByCode(flight.arrivalAirportIata);

  const html = renderPageHtml({
    title: `Flight ${flight.flightNumber} (${flight.departureAirportIata} to ${flight.arrivalAirportIata}) Status & Schedule`,
    desc: `Track ${flight.airlineName} flight ${flight.flightNumber} (${flight.icaoFlightCode}) from ${flight.departureCity} (${flight.departureAirportIata}) to ${flight.arrivalCity} (${flight.arrivalAirportIata}), aircraft ${flight.aircraftModel}, terminals, gates, and live ADS-B radar.`,
    canonicalPath: `/flight/${flight.flightNumber}`,
    jsonLd: buildBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Flight Schedules', path: '/flights' },
      { name: `Flight ${flight.flightNumber}`, path: `/flight/${flight.flightNumber}` }
    ]),
    bodyHtml: `
    <main style="max-width: 1000px; margin: 0 auto; padding: 32px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <nav style="font-size: 12px; color: #777780; margin-bottom: 14px;">
        <a href="${SITE_ORIGIN}/" style="color: #681C35; text-decoration: none;">Home</a> &gt;
        <a href="${SITE_ORIGIN}/flights" style="color: #681C35; text-decoration: none;">Flight Schedules</a> &gt;
        <span>${escapeHtml(flight.flightNumber)}</span>
      </nav>
      <span style="font-size: 12px; font-weight: 700; color: #681C35;">${escapeHtml(flight.airlineName)} &bull; ${escapeHtml(flight.icaoFlightCode)} &bull; Status: ${escapeHtml(flight.status)}</span>
      <h1 style="font-size: 28px; font-weight: 800; color: #25232A; margin: 6px 0 10px;">
        Flight ${escapeHtml(flight.flightNumber)}: ${escapeHtml(flight.departureAirportIata)} to ${escapeHtml(flight.arrivalAirportIata)}
      </h1>
      <p style="font-size: 14px; color: #504e57; margin: 0 0 20px; line-height: 1.6;">
        Operated by <a href="${SITE_ORIGIN}/airline/${flight.airlineIata}" style="color: #681C35; font-weight: 700;">${escapeHtml(flight.airlineName)}</a> using <a href="${SITE_ORIGIN}/aircraft/${flight.aircraftIcaoType}" style="color: #681C35; font-weight: 700;">${escapeHtml(flight.aircraftModel)} (${escapeHtml(flight.aircraftIcaoType)})</a>, Tail ${escapeHtml(flight.aircraftRegistration || 'Assigned')}. Scheduled non-stop block duration is approximately ${Math.floor(flight.durationMinutes / 60)}h ${flight.durationMinutes % 60}m across ${flight.isInternational ? 'international transoceanic/transborder' : 'Canadian domestic'} airspace.
      </p>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; margin-bottom: 20px;">
        <div style="border: 1px solid #E8E5E8; border-radius: 8px; padding: 16px; background: #FAF9FA;">
          <h2 style="font-size: 14px; font-weight: 700; color: #681C35; margin: 0 0 8px;">Departure Origin</h2>
          <p style="margin: 0 0 4px;"><strong><a href="${SITE_ORIGIN}/airport/${flight.departureAirportIata}" style="color: #25232A;">${escapeHtml(flight.departureAirportName)} (${escapeHtml(flight.departureAirportIata)})</a></strong></p>
          <p style="margin: 0 0 4px; font-size: 13px;">${escapeHtml(flight.departureCity)}${depApt ? ` &bull; Elevation ${depApt.elevationFeet ?? 0} ft MSL` : ''}</p>
          <p style="margin: 0; font-size: 13px;">Scheduled: <strong>${escapeHtml(flight.scheduledDepartureLocal)}</strong> &bull; ${escapeHtml(flight.terminalDeparture || 'Main Terminal')} &bull; Gate ${escapeHtml(flight.gateDeparture || 'TBA')}</p>
        </div>
        <div style="border: 1px solid #E8E5E8; border-radius: 8px; padding: 16px; background: #FAF9FA;">
          <h2 style="font-size: 14px; font-weight: 700; color: #681C35; margin: 0 0 8px;">Arrival Destination</h2>
          <p style="margin: 0 0 4px;"><strong><a href="${SITE_ORIGIN}/airport/${flight.arrivalAirportIata}" style="color: #25232A;">${escapeHtml(flight.arrivalAirportName)} (${escapeHtml(flight.arrivalAirportIata)})</a></strong></p>
          <p style="margin: 0 0 4px; font-size: 13px;">${escapeHtml(flight.arrivalCity)}${arrApt ? ` &bull; Elevation ${arrApt.elevationFeet ?? 0} ft MSL` : ''}</p>
          <p style="margin: 0; font-size: 13px;">Scheduled: <strong>${escapeHtml(flight.scheduledArrivalLocal)}</strong> &bull; ${escapeHtml(flight.terminalArrival || 'Main Terminal')} &bull; Gate ${escapeHtml(flight.gateArrival || 'TBA')}${flight.baggageBelt ? ` &bull; Baggage ${escapeHtml(flight.baggageBelt)}` : ''}</p>
        </div>
      </div>
      <div style="background: #ffffff; border: 1px solid #E8E5E8; border-radius: 8px; padding: 18px; margin-bottom: 20px; font-size: 13px; color: #3a3740; line-height: 1.65;">
        <h2 style="font-size: 16px; font-weight: 700; color: #681C35; margin: 0 0 8px;">Operational Briefing &amp; Terminal Check-In Guidance</h2>
        <p style="margin: 0 0 8px;">
          Flight <strong>${escapeHtml(flight.flightNumber)}</strong> (ICAO callsign <strong>${escapeHtml(flight.icaoFlightCode)}</strong>) departs from <a href="${SITE_ORIGIN}/airport/${flight.departureAirportIata}" style="color: #681C35; font-weight: 600;">${escapeHtml(flight.departureAirportName)}</a> (${escapeHtml(flight.departureAirportIcao)}) at ${escapeHtml(flight.scheduledDepartureLocal)} local time (${escapeHtml(flight.departureDateLocal)}) and arrives at <a href="${SITE_ORIGIN}/airport/${flight.arrivalAirportIata}" style="color: #681C35; font-weight: 600;">${escapeHtml(flight.arrivalAirportName)}</a> (${escapeHtml(flight.arrivalAirportIcao)}) at ${escapeHtml(flight.scheduledArrivalLocal)} local time.
        </p>
        <p style="margin: 0;">
          Passengers and ramp coordinators should verify CATSA security wait times, gate adjustments, and seasonal winter de-icing intervals directly with ${escapeHtml(flight.airlineName)} and the airport Flight Information Display System prior to boarding cutoffs.
        </p>
      </div>
      <div style="display: flex; gap: 12px; flex-wrap: wrap;">
        <a href="${SITE_ORIGIN}/flights" style="background: #681C35; color: #ffffff; padding: 10px 16px; border-radius: 6px; font-size: 13px; font-weight: 600; text-decoration: none;">All Flight Schedules</a>
        <a href="${SITE_ORIGIN}/airport/${flight.departureAirportIata}" style="background: #FAF9FA; border: 1px solid #E8E5E8; color: #25232A; padding: 10px 16px; border-radius: 6px; font-size: 13px; font-weight: 600; text-decoration: none;">${escapeHtml(flight.departureAirportIata)} Board</a>
        <a href="${SITE_ORIGIN}/airport/${flight.arrivalAirportIata}" style="background: #FAF9FA; border: 1px solid #E8E5E8; color: #25232A; padding: 10px 16px; border-radius: 6px; font-size: 13px; font-weight: 600; text-decoration: none;">${escapeHtml(flight.arrivalAirportIata)} Board</a>
        <a href="${SITE_ORIGIN}/map" style="background: #059669; color: #ffffff; padding: 10px 16px; border-radius: 6px; font-size: 13px; font-weight: 600; text-decoration: none;">Live Radar Map</a>
      </div>
      ${renderRelatedGuidesFooterHtml(3)}
    </main>`
  });
  writeRouteFiles(`/flight/${flight.flightNumber}`, html);
});

// 11. PRE-RENDER 404.html FOR UNKNOWN PATHS
console.log('Pre-rendering dist/404.html...');
const notFoundHtml = renderPageHtml({
  title: 'Page Not Found (404) – World Flight Schedule',
  desc: 'The requested flight schedule, aerodrome, or aviation guide URL could not be located.',
  canonicalPath: '/404',
  robots: 'noindex, nofollow',
  bodyHtml: `
  <main style="max-width: 760px; margin: 0 auto; padding: 64px 20px; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <div style="font-size: 48px; font-weight: 900; font-family: monospace; color: #681C35;">404</div>
    <h1 style="font-size: 26px; font-weight: 800; color: #25232A; margin: 8px 0 12px;">Aviation Page Not Found</h1>
    <p style="font-size: 14px; color: #504e57; line-height: 1.6; margin: 0 0 24px;">
      The flight identifier, airport code, or research guide path you requested does not exist on manufaktur.biz.id. Use the verified directory links below to continue.
    </p>
    <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
      <a href="${SITE_ORIGIN}/" style="background: #681C35; color: #ffffff; padding: 10px 18px; border-radius: 6px; font-size: 13px; font-weight: 700; text-decoration: none;">Return Home</a>
      <a href="${SITE_ORIGIN}/flights" style="background: #FAF9FA; border: 1px solid #E8E5E8; color: #25232A; padding: 10px 18px; border-radius: 6px; font-size: 13px; font-weight: 600; text-decoration: none;">Flight Schedules</a>
      <a href="${SITE_ORIGIN}/articles" style="background: #FAF9FA; border: 1px solid #E8E5E8; color: #25232A; padding: 10px 18px; border-radius: 6px; font-size: 13px; font-weight: 600; text-decoration: none;">Aviation Guides (${CANADIAN_EDITORIAL_ARTICLES.length})</a>
      <a href="${SITE_ORIGIN}/site-index" style="background: #FAF9FA; border: 1px solid #E8E5E8; color: #25232A; padding: 10px 18px; border-radius: 6px; font-size: 13px; font-weight: 600; text-decoration: none;">Site Index</a>
    </div>
  </main>`
});
fs.writeFileSync(path.join(DIST_DIR, '404.html'), notFoundHtml, 'utf-8');

// 12. GENERATE STATIC SITEMAP.XML, SITEMAP_INDEX.XML, RSS.XML, AND FEED.XML
const todayIso = new Date().toISOString().slice(0, 10);
const sitemap = aviationService.generateXmlSitemap(SITE_ORIGIN);
fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemap, 'utf-8');
fs.writeFileSync(path.join(process.cwd(), 'public', 'sitemap.xml'), sitemap, 'utf-8');

const sitemapIndexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE_ORIGIN}/sitemap.xml</loc>
    <lastmod>${todayIso}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_ORIGIN}/rss.xml</loc>
    <lastmod>${todayIso}</lastmod>
  </sitemap>
</sitemapindex>
`;
fs.writeFileSync(path.join(process.cwd(), 'public', 'sitemap_index.xml'), sitemapIndexXml, 'utf-8');
fs.writeFileSync(path.join(DIST_DIR, 'sitemap_index.xml'), sitemapIndexXml, 'utf-8');

const buildDate = new Date().toUTCString();
const itemsXml = CANADIAN_EDITORIAL_ARTICLES.map(
  art => `    <item>
      <title><![CDATA[${art.title}]]></title>
      <link>${SITE_ORIGIN}/articles/${art.slug}</link>
      <guid isPermaLink="true">${SITE_ORIGIN}/articles/${art.slug}</guid>
      <description><![CDATA[${art.excerpt}]]></description>
      <category>${escapeHtml(art.category)}</category>
      <author>anissagustiawati@gmail.com (${escapeHtml(art.author.name)})</author>
      <pubDate>${buildDate}</pubDate>
    </item>`
).join('\n');

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

console.log(
  `Pre-render complete! Generated Homepage, ${CANADIAN_EDITORIAL_ARTICLES.length} articles, /articles, /site-index, /flights, /departures, /arrivals, /airports, /airlines, /aircraft, /routes, /map, 6 legal pages, ${CANADIAN_AIRPORTS.length} airports, ${CANADIAN_AIRLINES.length} airlines, ${CANADIAN_AIRCRAFT.length} aircraft, ${uniqueFlightsMap.size} flight pages, and 404.html.`
);
