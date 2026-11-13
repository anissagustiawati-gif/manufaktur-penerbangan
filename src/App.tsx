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

export default function App() {
  // Use current pathname or hash
  const getInitialPath = () => {
    if (typeof window === 'undefined') return '/';
    const hash = window.location.hash.replace('#', '');
    if (hash && hash.startsWith('/')) return hash;
    return window.location.pathname || '/';
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

  const syncPageMeta = (title: string, description: string, canonicalPath?: string) => {
    if (typeof document === 'undefined') return;
    document.title = title;

    const cleanPath = (canonicalPath ?? (currentPath.split('?')[0].replace(/\/+$/, '') || '/'));
    const canonicalUrl = `https://manufaktur.biz.id${cleanPath === '/' ? '/' : cleanPath}`;

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

    setMeta('meta[name="description"]', description);
    setMeta('meta[property="og:title"]', title);
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[property="og:url"]', canonicalUrl);
    setMeta('meta[name="twitter:title"]', title);
    setMeta('meta[name="twitter:description"]', description);
  };

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

  // Route Dispatcher
  const renderRoute = () => {
    const cleanPath = currentPath.split('?')[0].replace(/\/+$/, '') || '/';
    const url = currentPath;

    // Homepage
    if (cleanPath === '/') {
      syncPageMeta(
        'Canada Flight Schedules – Canadian Aerodromes Timetables & Radar Tracking',
        'Explore Canadian flight schedules, aerodrome departures and arrivals across all 10 provinces and 3 territories, Air Canada, WestJet, Porter, and live ADS-B radar tracking.',
        '/'
      );
      return <HomePage onNavigate={navigate} onSearchGlobal={handleGlobalSearch} />;
    }

    // Flight Schedules
    if (cleanPath === '/flights') {
      syncPageMeta(
        'Global Flight Schedules Today – World Flight Schedule',
        'Real-time Canadian commercial flight timetables and carrier statuses across NAV CANADA airspace.',
        '/flights'
      );
      const searchParam = new URLSearchParams(url.split('?')[1] || '').get('q') || globalQuery;
      return <FlightSchedulesPage initialSearch={searchParam} onNavigate={navigate} />;
    }

    // Departures & Arrivals
    if (cleanPath === '/departures') {
      syncPageMeta(
        'Airport Live Departures Board – World Flight Schedule',
        'Real-time departures board for Canadian international and regional airports.',
        '/departures'
      );
      return <DeparturesPage onNavigate={navigate} />;
    }

    if (cleanPath === '/arrivals') {
      syncPageMeta(
        'Airport Live Arrivals Board – World Flight Schedule',
        'Live inbound arrivals, gate numbers, and baggage claim carousels across Canadian aerodromes.',
        '/arrivals'
      );
      return <ArrivalsPage onNavigate={navigate} />;
    }

    // Airports
    if (cleanPath === '/airports') {
      syncPageMeta(
        'Global Airport Directory (IATA/ICAO) – World Flight Schedule',
        'Comprehensive directory of Canadian and international airports with runway dimensions and terminal specs.',
        '/airports'
      );
      return <AirportsPage onNavigate={navigate} />;
    }

    if (cleanPath.startsWith('/airport/')) {
      const code = cleanPath.split('/')[2] || '';
      const airport = aviationService.getAirportByCode(code);
      if (airport) {
        syncPageMeta(
          `${airport.iata} – ${airport.name} Live Flight Board & Aerodrome Info`,
          `Live flight departures, arrivals, terminal gates, and weather conditions for ${airport.name} (${airport.iata}) in ${airport.city}.`,
          `/airport/${airport.iata}`
        );
      } else {
        syncPageMeta(
          'Airport Not Found – World Flight Schedule',
          'Requested aerodrome record could not be located in the Canadian aerodrome registry.',
          cleanPath
        );
      }
      return <AirportDetailPage airportCode={code} onNavigate={navigate} />;
    }

    // Airlines
    if (cleanPath === '/airlines') {
      syncPageMeta(
        'International Airline Directory – World Flight Schedule',
        'Fleet specifications, active routes, and daily scheduled operations for Air Canada, WestJet, Porter, and international airlines.',
        '/airlines'
      );
      return <AirlinesPage onNavigate={navigate} />;
    }

    if (cleanPath.startsWith('/airline/')) {
      const code = cleanPath.split('/')[2] || '';
      const airline = aviationService.getAirlineByCode(code);
      if (airline) {
        syncPageMeta(
          `${airline.name} (${airline.iata}) Fleet & Daily Flight Schedules`,
          `Track active flights, fleet specifications, and route networks for ${airline.name} (${airline.iata}), operating out of ${airline.hubAirports.join(', ')}.`,
          `/airline/${airline.iata}`
        );
      } else {
        syncPageMeta(
          'Airline Not Found – World Flight Schedule',
          'Requested airline record could not be located in the carrier registry.',
          cleanPath
        );
      }
      return <AirlineDetailPage airlineCode={code} onNavigate={navigate} />;
    }

    // Aircraft
    if (cleanPath === '/aircraft') {
      syncPageMeta(
        'Commercial Aircraft Information Directory – World Flight Schedule',
        'Technical specifications, passenger capacities, and cruising speeds for commercial airliners.',
        '/aircraft'
      );
      return <AircraftPage onNavigate={navigate} />;
    }

    if (cleanPath.startsWith('/aircraft/')) {
      const code = cleanPath.split('/')[2] || '';
      const aircraft = aviationService.getAircraftByCode(code);
      if (aircraft) {
        syncPageMeta(
          `${aircraft.model} (${aircraft.icaoType}) Specifications & Flight Assignments – World Flight Schedule`,
          `Technical specifications, range (${aircraft.rangeKm.toLocaleString()} km), cruising velocity, and active scheduled flights for the ${aircraft.model}.`,
          `/aircraft/${aircraft.icaoType}`
        );
      } else {
        syncPageMeta(
          'Aircraft Type Not Found – World Flight Schedule',
          'Requested aircraft specifications could not be located in the commercial fleet directory.',
          cleanPath
        );
      }
      return <AircraftDetailPage aircraftCode={code} onNavigate={navigate} />;
    }

    // Single Flight Detail
    if (cleanPath.startsWith('/flight/')) {
      const flightId = cleanPath.split('/')[2] || '';
      const flight = aviationService.getFlightById(flightId);
      if (flight) {
        syncPageMeta(
          `Flight ${flight.flightNumber} (${flight.departureAirportIata} to ${flight.arrivalAirportIata}) – World Flight Schedule`,
          `Live status, scheduled departure and arrival times, terminal gates, and aircraft telemetry for ${flight.airlineName} flight ${flight.flightNumber}.`,
          `/flight/${flight.flightNumber}`
        );
      } else {
        syncPageMeta(
          'Flight Record Not Found – World Flight Schedule',
          'Requested scheduled flight operation could not be located for the current timetable period.',
          cleanPath
        );
      }
      return <FlightDetailPage flightId={flightId} onNavigate={navigate} />;
    }

    // Routes
    if (cleanPath === '/routes') {
      syncPageMeta(
        'Worldwide Flight Routes Explorer – World Flight Schedule',
        'Discover major Canadian and transcontinental commercial air routes and typical flight durations.',
        '/routes'
      );
      return <RoutesPage onNavigate={navigate} />;
    }

    // Live Map
    if (cleanPath === '/map') {
      syncPageMeta(
        'Live Aircraft Radar & Transponder Map – World Flight Schedule',
        'Live Canadian airspace radar tracking with Mode-S ADS-B transponder altitude and ground speed vectors.',
        '/map'
      );
      return <LiveMapPage onNavigate={navigate} />;
    }

    // Articles
    if (cleanPath === '/articles') {
      syncPageMeta(
        'Aviation News & Technical Operations Guides – World Flight Schedule',
        'In-depth 1,000+ word aviation research guides covering winter de-icing holdover times, polar radar, aerodynamics, and passenger rights.',
        '/articles'
      );
      return <ArticlesPage onNavigate={navigate} />;
    }

    if (cleanPath.startsWith('/articles/')) {
      const slug = cleanPath.split('/')[2] || '';
      const article = aviationService.getArticleBySlug(slug);
      if (article) {
        syncPageMeta(
          `${article.title} – World Flight Schedule`,
          article.excerpt,
          `/articles/${article.slug}`
        );
      } else {
        syncPageMeta(
          'Article Not Found – World Flight Schedule',
          'The requested aviation analysis could not be located or has been archived.',
          cleanPath
        );
      }
      return <ArticleDetailPage slug={slug} onNavigate={navigate} />;
    }

    // Legal & Company
    if (cleanPath === '/about') {
      syncPageMeta(
        'About Us – World Flight Schedule',
        'Learn about World Flight Schedule and our certified Canadian civil aviation timetable and transponder feeds.',
        '/about'
      );
      return <LegalPage pageType="about" onNavigate={navigate} />;
    }

    if (cleanPath === '/contact') {
      syncPageMeta(
        'Contact Operations & Editorial Desk – World Flight Schedule',
        'Contact our aviation operations desk and editorial fact-checking department.',
        '/contact'
      );
      return <LegalPage pageType="contact" onNavigate={navigate} />;
    }

    if (cleanPath === '/privacy') {
      syncPageMeta(
        'Privacy Policy – World Flight Schedule',
        'Privacy policy and data governance practices for World Flight Schedule.',
        '/privacy'
      );
      return <LegalPage pageType="privacy" onNavigate={navigate} />;
    }

    if (cleanPath === '/terms') {
      syncPageMeta(
        'Terms and Conditions – World Flight Schedule',
        'Terms and conditions for utilizing World Flight Schedule data and timetables.',
        '/terms'
      );
      return <LegalPage pageType="terms" onNavigate={navigate} />;
    }

    if (cleanPath === '/disclaimer') {
      syncPageMeta(
        'Aviation Data Accuracy Disclaimer – World Flight Schedule',
        'Aviation data accuracy statement and flight operational notice.',
        '/disclaimer'
      );
      return <LegalPage pageType="disclaimer" onNavigate={navigate} />;
    }

    if (cleanPath === '/editorial-policy') {
      syncPageMeta(
        'Editorial Policy & Fact-Checking – World Flight Schedule',
        'Our rigorous factual standards and verification policies in compliance with Transport Canada directives.',
        '/editorial-policy'
      );
      return <LegalPage pageType="editorial-policy" onNavigate={navigate} />;
    }

    if (cleanPath === '/sitemap' || cleanPath === '/site-index') {
      syncPageMeta(
        'HTML Site Index & Complete Directory – World Flight Schedule',
        'Complete index of all Canadian flight timetables, 20 aviation research guides, airport boards, carrier fleets, and compliance policies.',
        '/site-index'
      );
      return <SitemapPage onNavigate={navigate} />;
    }

    // Admin Dashboard
    if (cleanPath === '/admin') {
      syncPageMeta(
        'Administrator Operations Console – World Flight Schedule',
        'Internal operations console for World Flight Schedule.',
        '/admin'
      );
      return <AdminDashboard onNavigate={navigate} />;
    }

    // 404 Fallback
    syncPageMeta(
      'Page Not Found – World Flight Schedule',
      'The requested aviation URL or flight identifier does not exist.',
      cleanPath
    );
    return <NotFoundPage onNavigate={navigate} />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F8FA] text-[#25232A]">
      <Header
        currentPath={currentPath}
        onNavigate={navigate}
        onSearch={handleGlobalSearch}
      />
      <main className="flex-1">
        {renderRoute()}
      </main>
      <Footer onNavigate={navigate} />
    </div>
  );
}
