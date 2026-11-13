import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { FlightSchedulesPage } from './pages/FlightSchedulesPage';
import { DeparturesPage } from './pages/DeparturesPage';
import { ArrivalsPage } from './pages/ArrivalsPage';
import { AirportsPage } from './pages/AirportsPage';
import { AirportDetailPage } from './pages/AirportDetailPage';
import { AirlinesPage } from './pages/AirlinesPage';
import { AirlineDetailPage } from './pages/AirlineDetailPage';
import { AircraftPage } from './pages/AircraftPage';
import { AircraftDetailPage } from './pages/AircraftDetailPage';
import { FlightDetailPage } from './pages/FlightDetailPage';
import { RoutesPage } from './pages/RoutesPage';
import { LiveMapPage } from './pages/LiveMapPage';
import { ArticlesPage } from './pages/ArticlesPage';
import { ArticleDetailPage } from './pages/ArticleDetailPage';
import { LegalPage } from './pages/LegalPage';
import { SitemapPage } from './pages/SitemapPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { NotFoundPage } from './pages/NotFoundPage';
import { aviationService } from './services/aviationService';

interface ResolvedRoute {
  title: string;
  description: string;
  canonicalPath: string;
  robots: string;
  element: React.ReactNode;
}

const INDEX_ROBOTS = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
const NOINDEX_ROBOTS = 'noindex, nofollow';

export default function App() {
  // Use current pathname or hash, normalizing /index.html to /
  const getInitialPath = () => {
    if (typeof window === 'undefined') return '/';
    const hash = window.location.hash.replace('#', '');
    if (hash && hash.startsWith('/')) return hash;
    const raw = window.location.pathname || '/';
    return raw === '/index.html' ? '/' : raw;
  };

  const [currentPath, setCurrentPath] = useState<string>(getInitialPath());
  const [globalQuery, setGlobalQuery] = useState<string>('');

  useEffect(() => {
    const handlePopState = () => {
      const p = getInitialPath();
      setCurrentPath(p);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    aviationService.recordPageView(currentPath);
  }, [currentPath]);

  const navigate = (path: string) => {
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.history && window.history.pushState) {
      window.history.pushState({}, '', path);
    }
  };

  const handleGlobalSearch = (query: string) => {
    setGlobalQuery(query);
  };

  const resolveRoute = (): ResolvedRoute => {
    const cleanPath = currentPath.split('?')[0].replace(/\/+$/, '') || '/';
    const url = currentPath;

    if (cleanPath === '/') {
      return {
        title: 'Canada Flight Schedules – Canadian Aerodromes Timetables & Radar Tracking',
        description:
          'Explore Canadian flight schedules, aerodrome departures and arrivals across all 10 provinces and 3 territories, Air Canada, WestJet, Porter, and live ADS-B radar tracking.',
        canonicalPath: '/',
        robots: INDEX_ROBOTS,
        element: <HomePage onNavigate={navigate} onSearchGlobal={handleGlobalSearch} />
      };
    }

    if (cleanPath === '/flights') {
      const searchParam = new URLSearchParams(url.split('?')[1] || '').get('q') || globalQuery;
      return {
        title: 'Canadian Flight Schedules Today – World Flight Schedule',
        description:
          'Real-time Canadian commercial flight timetables, departure and arrival times, aircraft types, and carrier statuses across NAV CANADA airspace.',
        canonicalPath: '/flights',
        robots: INDEX_ROBOTS,
        element: <FlightSchedulesPage initialSearch={searchParam} onNavigate={navigate} />
      };
    }

    if (cleanPath === '/departures') {
      return {
        title: 'Live Canadian Airport Departures Board – World Flight Schedule',
        description:
          'Real-time outbound departures board for Toronto Pearson (YYZ), Vancouver (YVR), Montréal (YUL), Calgary (YYC), and Canadian regional aerodromes.',
        canonicalPath: '/departures',
        robots: INDEX_ROBOTS,
        element: <DeparturesPage onNavigate={navigate} />
      };
    }

    if (cleanPath === '/arrivals') {
      return {
        title: 'Live Canadian Airport Arrivals Board – World Flight Schedule',
        description:
          'Live inbound arrivals, touchdown confirmations, gate allocations, and baggage claim belts across Canadian international and regional aerodromes.',
        canonicalPath: '/arrivals',
        robots: INDEX_ROBOTS,
        element: <ArrivalsPage onNavigate={navigate} />
      };
    }

    if (cleanPath === '/airports') {
      return {
        title: 'Canadian & Global Airports Directory (IATA/ICAO) – World Flight Schedule',
        description:
          'Comprehensive directory of Canadian airports across all 10 provinces and 3 territories with runway dimensions, elevations, coordinates, and terminal specs.',
        canonicalPath: '/airports',
        robots: INDEX_ROBOTS,
        element: <AirportsPage onNavigate={navigate} />
      };
    }

    if (cleanPath.startsWith('/airport/')) {
      const code = cleanPath.split('/')[2] || '';
      const airport = aviationService.getAirportByCode(code);
      if (airport) {
        return {
          title: `${airport.iata} – ${airport.name} Live Flight Board & Aerodrome Info`,
          description: `Live flight departures, arrivals, runway dimensions, elevation (${airport.elevationFeet ?? 0} ft), and terminal gates for ${airport.name} (${airport.iata}/${airport.icao}) in ${airport.city}.`,
          canonicalPath: `/airport/${airport.iata}`,
          robots: INDEX_ROBOTS,
          element: <AirportDetailPage airportCode={code} onNavigate={navigate} />
        };
      }
      return {
        title: 'Airport Not Found – World Flight Schedule',
        description: 'Requested aerodrome record could not be located in the Canadian aerodrome registry.',
        canonicalPath: cleanPath,
        robots: NOINDEX_ROBOTS,
        element: <AirportDetailPage airportCode={code} onNavigate={navigate} />
      };
    }

    if (cleanPath === '/airlines') {
      return {
        title: 'Canadian Commercial Airlines Directory – World Flight Schedule',
        description:
          'Fleet sizes, ICAO callsigns, operating hubs, alliances, and daily scheduled operations for Air Canada, WestJet, Porter, Air Transat, Flair, Canadian North, and Cargojet.',
        canonicalPath: '/airlines',
        robots: INDEX_ROBOTS,
        element: <AirlinesPage onNavigate={navigate} />
      };
    }

    if (cleanPath.startsWith('/airline/')) {
      const code = cleanPath.split('/')[2] || '';
      const airline = aviationService.getAirlineByCode(code);
      if (airline) {
        return {
          title: `${airline.name} (${airline.iata}/${airline.icao}) Fleet & Daily Flight Schedules`,
          description: `Track active flights, fleet count (${airline.fleetCount ?? 0} aircraft), callsign ${airline.callsign}, and hub operations for ${airline.name} (${airline.iata}).`,
          canonicalPath: `/airline/${airline.iata}`,
          robots: INDEX_ROBOTS,
          element: <AirlineDetailPage airlineCode={code} onNavigate={navigate} />
        };
      }
      return {
        title: 'Airline Not Found – World Flight Schedule',
        description: 'Requested airline record could not be located in the carrier registry.',
        canonicalPath: cleanPath,
        robots: NOINDEX_ROBOTS,
        element: <AirlineDetailPage airlineCode={code} onNavigate={navigate} />
      };
    }

    if (cleanPath === '/aircraft') {
      return {
        title: 'Commercial Aircraft Specifications Directory – World Flight Schedule',
        description:
          'Technical specifications, wingspan, certified range, cruising airspeed, passenger capacities, and powerplants for airliners operating in Canadian skies.',
        canonicalPath: '/aircraft',
        robots: INDEX_ROBOTS,
        element: <AircraftPage onNavigate={navigate} />
      };
    }

    if (cleanPath.startsWith('/aircraft/')) {
      const code = cleanPath.split('/')[2] || '';
      const aircraft = aviationService.getAircraftByCode(code);
      if (aircraft) {
        const cruiseKts = Math.round(aircraft.cruisingSpeedKmH * 0.539957);
        return {
          title: `${aircraft.model} (${aircraft.icaoType}) Aircraft Specifications & Flights – World Flight Schedule`,
          description: `Explore technical specifications for ${aircraft.model} (${aircraft.icaoType}): ${aircraft.wingspanMeters}m wingspan, ${aircraft.rangeKm.toLocaleString()} km certified range, ${aircraft.cruisingSpeedKmH} km/h (${cruiseKts} kts) cruise speed, and active Canadian flights.`,
          canonicalPath: `/aircraft/${aircraft.icaoType}`,
          robots: INDEX_ROBOTS,
          element: <AircraftDetailPage aircraftCode={code} onNavigate={navigate} />
        };
      }
      return {
        title: 'Aircraft Type Not Found – World Flight Schedule',
        description: 'Requested aircraft specifications could not be located in the commercial fleet directory.',
        canonicalPath: cleanPath,
        robots: NOINDEX_ROBOTS,
        element: <AircraftDetailPage aircraftCode={code} onNavigate={navigate} />
      };
    }

    if (cleanPath.startsWith('/flight/')) {
      const flightId = cleanPath.split('/')[2] || '';
      const flight = aviationService.getFlightById(flightId);
      if (flight) {
        return {
          title: `Flight ${flight.flightNumber} (${flight.departureAirportIata} to ${flight.arrivalAirportIata}) Status & Schedule`,
          description: `Track ${flight.airlineName} flight ${flight.flightNumber} (${flight.icaoFlightCode}) from ${flight.departureCity} (${flight.departureAirportIata}) to ${flight.arrivalCity} (${flight.arrivalAirportIata}), aircraft ${flight.aircraftModel}, terminals, gates, and live ADS-B radar.`,
          canonicalPath: `/flight/${flight.flightNumber}`,
          robots: INDEX_ROBOTS,
          element: <FlightDetailPage flightId={flightId} onNavigate={navigate} />
        };
      }
      return {
        title: 'Flight Record Not Found – World Flight Schedule',
        description: 'Requested scheduled flight operation could not be located for the current timetable period.',
        canonicalPath: cleanPath,
        robots: NOINDEX_ROBOTS,
        element: <FlightDetailPage flightId={flightId} onNavigate={navigate} />
      };
    }

    if (cleanPath === '/routes') {
      return {
        title: 'Canadian Commercial Flight Routes Explorer – World Flight Schedule',
        description:
          'Discover major Canadian transcontinental, prairie, and Arctic commercial air routes, typical block durations, distances, and assigned aircraft.',
        canonicalPath: '/routes',
        robots: INDEX_ROBOTS,
        element: <RoutesPage onNavigate={navigate} />
      };
    }

    if (cleanPath === '/map') {
      return {
        title: 'Live Canadian Airspace Radar & ADS-B Transponder Map – World Flight Schedule',
        description:
          'Live Canadian airspace radar tracking with Mode-S ADS-B altitude, airspeed, and heading telemetry across NAV CANADA Area Control Centres.',
        canonicalPath: '/map',
        robots: INDEX_ROBOTS,
        element: <LiveMapPage onNavigate={navigate} />
      };
    }

    if (cleanPath === '/articles') {
      return {
        title: 'Aviation News & Technical Operations Guides – World Flight Schedule',
        description:
          'In-depth 1,000+ word aviation research guides covering winter de-icing holdover times, polar radar, aerodynamics, and passenger rights.',
        canonicalPath: '/articles',
        robots: INDEX_ROBOTS,
        element: <ArticlesPage onNavigate={navigate} />
      };
    }

    if (cleanPath.startsWith('/articles/')) {
      const slug = cleanPath.split('/')[2] || '';
      const article = aviationService.getArticleBySlug(slug);
      if (article) {
        return {
          title: `${article.title} – World Flight Schedule`,
          description: article.excerpt,
          canonicalPath: `/articles/${article.slug}`,
          robots: INDEX_ROBOTS,
          element: <ArticleDetailPage slug={slug} onNavigate={navigate} />
        };
      }
      return {
        title: 'Article Not Found – World Flight Schedule',
        description: 'The requested aviation analysis could not be located or has been archived.',
        canonicalPath: cleanPath,
        robots: NOINDEX_ROBOTS,
        element: <ArticleDetailPage slug={slug} onNavigate={navigate} />
      };
    }

    if (cleanPath === '/about') {
      return {
        title: 'About Us – World Flight Schedule',
        description:
          'Learn about World Flight Schedule, our editorial independence, aviation engineering expertise, and verified Canadian civil aviation timetable feeds.',
        canonicalPath: '/about',
        robots: INDEX_ROBOTS,
        element: <LegalPage pageType="about" onNavigate={navigate} />
      };
    }

    if (cleanPath === '/contact') {
      return {
        title: 'Contact Operations & Editorial Desk – World Flight Schedule',
        description:
          'Contact our aviation operations desk and editorial fact-checking department regarding schedule corrections, press inquiries, or data syndication.',
        canonicalPath: '/contact',
        robots: INDEX_ROBOTS,
        element: <LegalPage pageType="contact" onNavigate={navigate} />
      };
    }

    if (cleanPath === '/privacy') {
      return {
        title: 'Privacy Policy & Cookie Disclosure – World Flight Schedule',
        description:
          'Privacy policy, Google AdSense cookie disclosures, GDPR, CCPA/CPRA, and COPPA compliance practices for World Flight Schedule (manufaktur.biz.id).',
        canonicalPath: '/privacy',
        robots: INDEX_ROBOTS,
        element: <LegalPage pageType="privacy" onNavigate={navigate} />
      };
    }

    if (cleanPath === '/terms') {
      return {
        title: 'Terms and Conditions – World Flight Schedule',
        description:
          'Standard operating agreement, acceptable usage policy, and intellectual property protections governing World Flight Schedule.',
        canonicalPath: '/terms',
        robots: INDEX_ROBOTS,
        element: <LegalPage pageType="terms" onNavigate={navigate} />
      };
    }

    if (cleanPath === '/disclaimer') {
      return {
        title: 'Aviation Data Accuracy & Navigational Disclaimer – World Flight Schedule',
        description:
          'Mandatory civil aviation operational notice clarifying informational-only schedule and ADS-B telemetry usage.',
        canonicalPath: '/disclaimer',
        robots: INDEX_ROBOTS,
        element: <LegalPage pageType="disclaimer" onNavigate={navigate} />
      };
    }

    if (cleanPath === '/editorial-policy') {
      return {
        title: 'Editorial Standards & Fact-Checking Policy – World Flight Schedule',
        description:
          'Our commitment to journalistic integrity, factual primary sources, human aviation review, and prompt corrections.',
        canonicalPath: '/editorial-policy',
        robots: INDEX_ROBOTS,
        element: <LegalPage pageType="editorial-policy" onNavigate={navigate} />
      };
    }

    if (cleanPath === '/sitemap' || cleanPath === '/site-index') {
      return {
        title: 'HTML Site Index & Complete Directory – World Flight Schedule',
        description:
          'Complete index of all Canadian flight timetables, aviation research guides, aerodrome boards, carrier fleets, aircraft specs, and compliance policies.',
        canonicalPath: '/site-index',
        robots: INDEX_ROBOTS,
        element: <SitemapPage onNavigate={navigate} />
      };
    }

    if (cleanPath === '/admin') {
      return {
        title: 'Administrator Operations Console – World Flight Schedule',
        description: 'Internal operations console for World Flight Schedule.',
        canonicalPath: '/admin',
        robots: NOINDEX_ROBOTS,
        element: <AdminDashboard onNavigate={navigate} />
      };
    }

    return {
      title: 'Page Not Found (404) – World Flight Schedule',
      description: 'The requested aviation URL or flight identifier does not exist.',
      canonicalPath: cleanPath,
      robots: NOINDEX_ROBOTS,
      element: <NotFoundPage onNavigate={navigate} />
    };
  };

  const resolvedRoute = resolveRoute();

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.title = resolvedRoute.title;

    const cleanCanonicalPath =
      resolvedRoute.canonicalPath === '/'
        ? '/'
        : resolvedRoute.canonicalPath.replace(/\/+$/, '');
    const canonicalUrl = `https://manufaktur.biz.id${cleanCanonicalPath}`;

    let canonicalEl = document.querySelector('link[rel="canonical"]');
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute('href', canonicalUrl);

    const setMeta = (selector: string, content: string) => {
      const el = document.querySelector(selector);
      if (el) el.setAttribute('content', content);
    };

    setMeta('meta[name="description"]', resolvedRoute.description);
    setMeta('meta[name="robots"]', resolvedRoute.robots);
    setMeta('meta[property="og:title"]', resolvedRoute.title);
    setMeta('meta[property="og:description"]', resolvedRoute.description);
    setMeta('meta[property="og:url"]', canonicalUrl);
    setMeta('meta[name="twitter:title"]', resolvedRoute.title);
    setMeta('meta[name="twitter:description"]', resolvedRoute.description);
  }, [resolvedRoute.title, resolvedRoute.description, resolvedRoute.canonicalPath, resolvedRoute.robots]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F8FA] text-[#25232A]">
      <Header
        currentPath={currentPath}
        onNavigate={navigate}
        onSearch={handleGlobalSearch}
      />
      <main className="flex-1">
        {resolvedRoute.element}
      </main>
      <Footer onNavigate={navigate} />
    </div>
  );
}
