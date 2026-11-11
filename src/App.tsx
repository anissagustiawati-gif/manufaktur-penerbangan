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

    // Dynamic Canonical & OpenGraph sync for Googlebot and Social crawlers
    if (typeof document !== 'undefined') {
      const cleanPath = currentPath.split('?')[0].replace(/\/+$/, '') || '/';
      const canonicalUrl = `https://manufaktur.biz.id${cleanPath === '/' ? '' : cleanPath}`;
      
      let canonicalEl = document.querySelector('link[rel="canonical"]');
      if (!canonicalEl) {
        canonicalEl = document.createElement('link');
        canonicalEl.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalEl);
      }
      canonicalEl.setAttribute('href', canonicalUrl);

      let ogUrlEl = document.querySelector('meta[property="og:url"]');
      if (ogUrlEl) {
        ogUrlEl.setAttribute('content', canonicalUrl);
      }

      // Ensure Adsterra Social Bar script is always active
      const scriptSrc = 'https://bicea.org/14/6946ae9fe140d10b8afbdd2702197503';
      const existing = document.querySelector(`script[src="${scriptSrc}"]`);
      if (!existing) {
        const s = document.createElement('script');
        s.setAttribute('data-cfasync', 'false');
        s.src = scriptSrc;
        s.async = true;
        document.head.appendChild(s);
      }
    }
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

  // Route Dispatcher
  const renderRoute = () => {
    const url = currentPath;

    // Homepage
    if (url === '/' || url === '') {
      document.title = 'World Flight Schedule – Global Flight Schedules & Aircraft Tracking';
      return <HomePage onNavigate={navigate} onSearchGlobal={handleGlobalSearch} />;
    }

    // Flight Schedules
    if (url === '/flights' || url.startsWith('/flights?')) {
      document.title = 'Global Flight Schedules Today – World Flight Schedule';
      const searchParam = new URLSearchParams(url.split('?')[1] || '').get('q') || globalQuery;
      return <FlightSchedulesPage initialSearch={searchParam} onNavigate={navigate} />;
    }

    // Departures & Arrivals
    if (url === '/departures') {
      document.title = 'Airport Live Departures Board – World Flight Schedule';
      return <DeparturesPage onNavigate={navigate} />;
    }

    if (url === '/arrivals') {
      document.title = 'Airport Live Arrivals Board – World Flight Schedule';
      return <ArrivalsPage onNavigate={navigate} />;
    }

    // Airports
    if (url === '/airports') {
      document.title = 'Global Airport Directory (IATA/ICAO) – World Flight Schedule';
      return <AirportsPage onNavigate={navigate} />;
    }

    if (url.startsWith('/airport/')) {
      const code = url.split('/')[2];
      const airport = aviationService.getAirportByCode(code);
      document.title = airport
        ? `${airport.name} (${airport.iata}) Departures & Arrivals – World Flight Schedule`
        : 'Airport Details – World Flight Schedule';
      return <AirportDetailPage airportCode={code} onNavigate={navigate} />;
    }

    // Airlines
    if (url === '/airlines') {
      document.title = 'International Airline Directory – World Flight Schedule';
      return <AirlinesPage onNavigate={navigate} />;
    }

    if (url.startsWith('/airline/')) {
      const code = url.split('/')[2];
      const airline = aviationService.getAirlineByCode(code);
      document.title = airline
        ? `${airline.name} (${airline.iata}) Fleet & Schedules – World Flight Schedule`
        : 'Airline Details – World Flight Schedule';
      return <AirlineDetailPage airlineCode={code} onNavigate={navigate} />;
    }

    // Aircraft
    if (url === '/aircraft') {
      document.title = 'Commercial Aircraft Information Directory – World Flight Schedule';
      return <AircraftPage onNavigate={navigate} />;
    }

    if (url.startsWith('/aircraft/')) {
      const code = url.split('/')[2];
      const aircraft = aviationService.getAircraftByCode(code);
      document.title = aircraft
        ? `${aircraft.model} Specifications & Flight Assignments – World Flight Schedule`
        : 'Aircraft Details – World Flight Schedule';
      return <AircraftDetailPage aircraftCode={code} onNavigate={navigate} />;
    }

    // Single Flight Detail
    if (url.startsWith('/flight/')) {
      const flightId = url.split('/')[2];
      const flight = aviationService.getFlightById(flightId);
      document.title = flight
        ? `Flight ${flight.flightNumber} (${flight.departureAirportIata} to ${flight.arrivalAirportIata}) – World Flight Schedule`
        : 'Flight Detail – World Flight Schedule';
      return <FlightDetailPage flightId={flightId} onNavigate={navigate} />;
    }

    // Routes
    if (url === '/routes') {
      document.title = 'Worldwide Flight Routes Explorer – World Flight Schedule';
      return <RoutesPage onNavigate={navigate} />;
    }

    // Live Map
    if (url === '/map') {
      document.title = 'Live Aircraft Radar & Transponder Map – World Flight Schedule';
      return <LiveMapPage onNavigate={navigate} />;
    }

    // Articles
    if (url === '/articles') {
      document.title = 'Aviation News & Travel Insights – World Flight Schedule';
      return <ArticlesPage onNavigate={navigate} />;
    }

    if (url.startsWith('/articles/')) {
      const slug = url.split('/')[2];
      const article = aviationService.getArticleBySlug(slug);
      document.title = article
        ? `${article.title} – World Flight Schedule`
        : 'Aviation Editorial – World Flight Schedule';
      return <ArticleDetailPage slug={slug} onNavigate={navigate} />;
    }

    // Legal & Company
    if (url === '/about') {
      document.title = 'About Us – World Flight Schedule';
      return <LegalPage pageType="about" onNavigate={navigate} />;
    }

    if (url === '/contact') {
      document.title = 'Contact Operations & Editorial Desk – World Flight Schedule';
      return <LegalPage pageType="contact" onNavigate={navigate} />;
    }

    if (url === '/privacy') {
      document.title = 'Privacy Policy – World Flight Schedule';
      return <LegalPage pageType="privacy" onNavigate={navigate} />;
    }

    if (url === '/terms') {
      document.title = 'Terms and Conditions – World Flight Schedule';
      return <LegalPage pageType="terms" onNavigate={navigate} />;
    }

    if (url === '/disclaimer') {
      document.title = 'Aviation Data Accuracy Disclaimer – World Flight Schedule';
      return <LegalPage pageType="disclaimer" onNavigate={navigate} />;
    }

    if (url === '/editorial-policy') {
      document.title = 'Editorial Policy & Fact-Checking – World Flight Schedule';
      return <LegalPage pageType="editorial-policy" onNavigate={navigate} />;
    }

    if (url === '/sitemap' || url === '/site-index') {
      document.title = 'HTML Sitemap & Complete Site Index – World Flight Schedule';
      return <SitemapPage onNavigate={navigate} />;
    }

    // Admin Dashboard
    if (url === '/admin') {
      document.title = 'Administrator Operations Console – World Flight Schedule';
      return <AdminDashboard onNavigate={navigate} />;
    }

    // 404 Fallback
    document.title = 'Page Not Found – World Flight Schedule';
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
