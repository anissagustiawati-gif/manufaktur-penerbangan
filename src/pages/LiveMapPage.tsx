import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Radio,
  Search,
  Compass,
  Plane,
  RefreshCw,
  ArrowRight,
  Layers,
  MapPin,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  SlidersHorizontal,
  Activity,
  Globe,
  BookOpen,
  TrendingUp,
  Clock,
  Eye,
  Info,
  CheckCircle2
} from 'lucide-react';
import { aviationService } from '../services/aviationService';
import { FlightRecord } from '../types/aviation';
import { AdSenseUnit } from '../components/AdSenseUnit';
import { FlightStatusBadge } from '../components/FlightStatusBadge';
import { ExploreMoreSection } from '../components/ExploreMoreSection';

interface Props {
  onNavigate: (path: string) => void;
}

type BasemapStyle = 'osm' | 'topo' | 'canvas';

interface AirspaceHub {
  name: string;
  code: string;
  coords: [number, number];
  zoom: number;
}

const CANADIAN_HUBS: AirspaceHub[] = [
  { name: 'All Canada', code: 'ALL', coords: [56.13, -106.34], zoom: 4 },
  { name: 'Toronto (YYZ)', code: 'YYZ', coords: [43.6777, -79.6248], zoom: 8 },
  { name: 'Vancouver (YVR)', code: 'YVR', coords: [49.1967, -123.1815], zoom: 8 },
  { name: 'Montreal (YUL)', code: 'YUL', coords: [45.4657, -73.7455], zoom: 8 },
  { name: 'Calgary (YYC)', code: 'YYC', coords: [51.1215, -114.0076], zoom: 8 },
  { name: 'Edmonton (YEG)', code: 'YEG', coords: [53.3097, -113.5798], zoom: 8 },
  { name: 'Ottawa (YOW)', code: 'YOW', coords: [45.3225, -75.6672], zoom: 8 },
  { name: 'Halifax (YHZ)', code: 'YHZ', coords: [44.8808, -63.5086], zoom: 8 }
];

export const LiveMapPage: React.FC<Props> = ({ onNavigate }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFlight, setSelectedFlight] = useState<FlightRecord | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSync, setLastSync] = useState(new Date().toLocaleTimeString('en-CA', { hour12: false }));
  const [basemapStyle, setBasemapStyle] = useState<BasemapStyle>('osm');
  const [activeTab, setActiveTab] = useState<'map' | 'list'>('map');
  const [selectedHub, setSelectedHub] = useState<string>('ALL');

  const activeFlights = aviationService.getActiveLiveFlights();

  // Filtered flights for the map and list
  const filteredFlights = activeFlights.filter((f) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      f.flightNumber.toLowerCase().includes(q) ||
      f.airlineName.toLowerCase().includes(q) ||
      f.departureAirportIata.toLowerCase().includes(q) ||
      f.arrivalAirportIata.toLowerCase().includes(q) ||
      f.aircraftModel.toLowerCase().includes(q) ||
      f.icaoFlightCode.toLowerCase().includes(q)
    );
  });

  // Switch basemap tile layer safely without any API key requirement
  const updateTileLayer = (map: L.Map, style: BasemapStyle) => {
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let url = '';
    let attribution = '';

    if (style === 'osm') {
      // Standard Free OpenStreetMap Tiles - High reliability, no API keys, full detail
      url = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
      attribution = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors';
    } else if (style === 'topo') {
      // Esri World Topographic - Free public GIS service with elevations & boundaries
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}';
      attribution = 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom';
    } else {
      // Esri Light Gray Canvas - Clean aviation radar styling
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}';
      attribution = 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ';
    }

    const newTileLayer = L.tileLayer(url, {
      attribution,
      maxZoom: 18,
      crossOrigin: true
    }).addTo(map);

    tileLayerRef.current = newTileLayer;
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Create Leaflet map centered at Canada (covering Pacific to Atlantic & Arctic FIRs)
    const map = L.map(mapContainerRef.current, {
      center: [55.0, -97.0],
      zoom: 4,
      minZoom: 3,
      maxZoom: 14,
      zoomControl: true,
      worldCopyJump: true
    });

    // Set initial tile layer (OSM, completely free, no watermark)
    updateTileLayer(map, 'osm');

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    // Trigger invalidateSize after initial layout to avoid gray borders on mobile devices
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer if user selects a different style
  useEffect(() => {
    if (mapInstanceRef.current) {
      updateTileLayer(mapInstanceRef.current, basemapStyle);
    }
  }, [basemapStyle]);

  // Recalculate map size when mobile tab changes to 'map'
  useEffect(() => {
    if (activeTab === 'map' && mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 150);
    }
  }, [activeTab]);

  // Update Aircraft Markers whenever filtered flights change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    const layer = markersLayerRef.current;
    layer.clearLayers();

    filteredFlights.forEach((flight) => {
      if (!flight.liveTracking) return;

      const { latitude, longitude, headingDegrees, altitudeFeet, groundSpeedKnots } = flight.liveTracking;
      const isSelected = selectedFlight?.id === flight.id;

      // Custom SVG Airplane Marker with Heading Rotation & Altitude Tooltip
      const iconHtml = `
        <div style="transform: rotate(${headingDegrees}deg); transform-origin: center center; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;" class="cursor-pointer ${isSelected ? 'scale-125' : ''}">
          <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: ${isSelected ? 'rgba(234, 179, 8, 0.4)' : 'rgba(104, 28, 53, 0.15)'}; border: 1.5px solid ${isSelected ? '#CA8A04' : '#681C35'}; box-shadow: 0 1px 4px rgba(0,0,0,0.25);"></div>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="${isSelected ? '#CA8A04' : '#681C35'}" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="position: relative; z-index: 2;">
            <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.3c.4-.2.6-.6.5-1.1z"/>
          </svg>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'aviation-plane-marker',
        html: iconHtml,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -16]
      });

      const marker = L.marker([latitude, longitude], { icon: customIcon });

      const popupContent = `
        <div style="font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; min-width: 230px; font-size: 12px; color: #25232A;">
          <div style="background-color: #681C35; color: white; padding: 7px 10px; border-radius: 6px 6px 0 0; display: flex; justify-content: space-between; align-items: center;">
            <strong style="font-family: monospace; font-size: 13px; font-weight: 700;">${flight.flightNumber}</strong>
            <span style="font-size: 10px; background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 3px; font-weight: 600;">${flight.airlineIata}</span>
          </div>
          <div style="padding: 10px; background: #fff; border: 1px solid #E8E5E8; border-top: none; border-radius: 0 0 6px 6px;">
            <div style="font-weight: 700; font-size: 13px; color: #681C35; display: flex; align-items: center; justify-content: space-between;">
              <span>${flight.departureAirportIata}</span>
              <span style="color: #777780; font-weight: normal; font-size: 11px;">✈</span>
              <span>${flight.arrivalAirportIata}</span>
            </div>
            <div style="font-size: 11px; color: #777780; margin: 3px 0 8px 0;">${flight.airlineName} · ${flight.aircraftModel}</div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-family: monospace; font-size: 11px; background: #F8F8FA; padding: 6px 8px; border-radius: 4px; border: 1px solid #ECEBED;">
              <div><span style="color: #777780;">Alt:</span> <strong>${altitudeFeet.toLocaleString()} ft</strong></div>
              <div><span style="color: #777780;">Spd:</span> <strong>${groundSpeedKnots} kts</strong></div>
              <div><span style="color: #777780;">Hdg:</span> <strong>${headingDegrees}°</strong></div>
              <div><span style="color: #777780;">FL:</span> <strong>FL${Math.round(altitudeFeet / 100)}</strong></div>
            </div>
            
            <div style="margin-top: 8px; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #777780;">
              <span>Source: ${flight.liveTracking.source}</span>
              <span style="color: #15803d; font-weight: 600;">● Live Verified</span>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => {
        setSelectedFlight(flight);
      });

      layer.addLayer(marker);
    });
  }, [filteredFlights, selectedFlight]);

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    await aviationService.triggerManualSync('OpenSky Network');
    setLastSync(new Date().toLocaleTimeString('en-CA', { hour12: false }));
    setIsRefreshing(false);
  };

  const handleFocusFlight = (flight: FlightRecord) => {
    setSelectedFlight(flight);
    setActiveTab('map');
    if (mapInstanceRef.current && flight.liveTracking) {
      mapInstanceRef.current.flyTo(
        [flight.liveTracking.latitude, flight.liveTracking.longitude],
        7,
        { duration: 1.2 }
      );
    }
  };

  const handleFlyToHub = (hub: AirspaceHub) => {
    setSelectedHub(hub.code);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(hub.coords, hub.zoom, { duration: 1.2 });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 space-y-4 font-sans">
      {/* Title & Telemetry Status Bar */}
      <div className="bg-white border border-[#E8E5E8] rounded-lg p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#681C35] uppercase tracking-wider">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span>NAV CANADA ADS-B Radar Feeds · OpenSky Verified</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#25232A] mt-1 tracking-tight">
              Live Canadian Airspace Radar Map
            </h1>
            <p className="text-xs text-[#777780] mt-0.5">
              Real-time commercial aircraft movement tracking across Canadian airspace (YYZ, YVR, YUL, YYC, and regional corridors) powered by live Mode-S transponder telemetry.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-center">
            <div className="text-right hidden md:block">
              <span className="text-[10px] text-[#777780] block font-mono">Last Synchronized</span>
              <span className="text-xs font-mono font-bold text-[#25232A]">{lastSync} UTC</span>
            </div>

            <button
              onClick={handleRefreshData}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#681C35] hover:bg-[#8A2948] active:bg-[#521528] text-white text-xs font-semibold rounded-md shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh Radar'}</span>
            </button>
          </div>
        </div>

        {/* 1-Tap Canadian Hub Shortcuts */}
        <div className="mt-3 pt-3 border-t border-[#ECEBED] flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
          <span className="text-[11px] font-semibold text-[#777780] whitespace-nowrap flex items-center gap-1 mr-1">
            <MapPin className="w-3.5 h-3.5 text-[#681C35]" />
            <span>Airspace Focus:</span>
          </span>
          {CANADIAN_HUBS.map((hub) => (
            <button
              key={hub.code}
              onClick={() => handleFlyToHub(hub)}
              className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedHub === hub.code
                  ? 'bg-[#681C35] text-white shadow-2xs font-semibold'
                  : 'bg-[#F8F8FA] hover:bg-[#ECEBED] text-[#25232A] border border-[#E8E5E8]'
              }`}
            >
              {hub.name}
            </button>
          ))}
        </div>
      </div>

      {/* Filter and Mode Controls */}
      <div className="bg-white border border-[#E8E5E8] rounded-lg p-3 shadow-2xs space-y-2.5">
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#777780] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search flight number (AC103, WS115), airline, route (YYZ)..."
              className="w-full pl-9 pr-3 py-2 bg-[#F8F8FA] border border-[#E8E5E8] rounded-md text-xs placeholder-[#777780] focus:outline-none focus:border-[#681C35]"
            />
          </div>

          {/* Mobile View Switcher (Radar Map vs List) */}
          <div className="flex items-center gap-1.5 lg:hidden">
            <button
              onClick={() => setActiveTab('map')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer text-center ${
                activeTab === 'map'
                  ? 'bg-[#681C35] text-white'
                  : 'bg-[#F8F8FA] text-[#777780] border border-[#E8E5E8]'
              }`}
            >
              📡 Radar View
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer text-center ${
                activeTab === 'list'
                  ? 'bg-[#681C35] text-white'
                  : 'bg-[#F8F8FA] text-[#777780] border border-[#E8E5E8]'
              }`}
            >
              ✈️ Aircraft List ({filteredFlights.length})
            </button>
          </div>

          {/* Basemap Style Selector (OSM / Topo / Gray) */}
          <div className="hidden sm:flex items-center gap-1 text-xs">
            <span className="text-[11px] text-[#777780] font-medium mr-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-[#777780]" />
              <span>Map Style:</span>
            </span>
            <button
              onClick={() => setBasemapStyle('osm')}
              className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                basemapStyle === 'osm'
                  ? 'bg-[#681C35] text-white font-semibold'
                  : 'bg-[#F8F8FA] text-[#25232A] border border-[#E8E5E8]'
              }`}
              title="Standard OpenStreetMap (High Reliability, Full Resolution)"
            >
              OpenStreetMap
            </button>
            <button
              onClick={() => setBasemapStyle('topo')}
              className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                basemapStyle === 'topo'
                  ? 'bg-[#681C35] text-white font-semibold'
                  : 'bg-[#F8F8FA] text-[#25232A] border border-[#E8E5E8]'
              }`}
              title="Esri Topographic (Terrain elevation and contours)"
            >
              Topographic
            </button>
            <button
              onClick={() => setBasemapStyle('canvas')}
              className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                basemapStyle === 'canvas'
                  ? 'bg-[#681C35] text-white font-semibold'
                  : 'bg-[#F8F8FA] text-[#25232A] border border-[#E8E5E8]'
              }`}
              title="Aviation Gray Canvas (Clean Minimal Radar)"
            >
              Aviation Gray
            </button>
          </div>
        </div>

        {/* Quick summary strip */}
        <div className="flex items-center justify-between text-xs text-[#777780] pt-1 border-t border-[#F0EEF0]">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-[#25232A]">
              Airborne Aircraft Tracked: <strong className="text-[#681C35] font-mono">{filteredFlights.length}</strong>
            </span>
            <span className="hidden sm:inline text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
              ✓ Verified Live Telemetry Stream
            </span>
          </div>
          <span className="text-[11px] hidden md:inline text-[#777780]">
            Click any aircraft icon for real-time altitude, airspeed, and flight telemetry
          </span>
        </div>
      </div>

      {/* Main Map & Live Targets Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Radar Map Canvas */}
        <div
          className={`lg:col-span-8 bg-white border border-[#E8E5E8] rounded-lg overflow-hidden relative shadow-xs flex flex-col ${
            activeTab === 'list' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Responsive Map Container with smooth touch controls */}
          <div
            ref={mapContainerRef}
            className="w-full h-[380px] sm:h-[480px] lg:h-[600px] z-10"
            style={{ width: '100%' }}
          />

          {/* Map Overlay Badge */}
          <div className="absolute top-3 right-3 z-20 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-md border border-[#E8E5E8] text-xs shadow-xs hidden sm:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-mono font-bold text-[#681C35]">CANADIAN ADS-B RADAR</span>
          </div>

          {/* Quick Floating Telemetry if Flight Selected */}
          {selectedFlight && (
            <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md z-20 bg-white/95 backdrop-blur-md p-3.5 rounded-lg border border-[#681C35] shadow-lg">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#ECEBED]">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-sm text-[#681C35] bg-[#681C35]/10 px-2 py-0.5 rounded">
                    {selectedFlight.flightNumber}
                  </span>
                  <span className="text-xs font-bold text-[#25232A]">
                    {selectedFlight.airlineName}
                  </span>
                </div>
                <button
                  onClick={() => onNavigate(`/flight/${selectedFlight.flightNumber.toLowerCase()}`)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#681C35] hover:underline"
                >
                  <span>Full Details</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                <div className="bg-[#FAF9FA] p-1.5 rounded text-center">
                  <span className="text-[10px] text-[#777780] block font-sans">Route</span>
                  <strong className="text-[#681C35]">{selectedFlight.departureAirportIata} → {selectedFlight.arrivalAirportIata}</strong>
                </div>
                <div className="bg-[#FAF9FA] p-1.5 rounded text-center">
                  <span className="text-[10px] text-[#777780] block font-sans">Altitude</span>
                  <strong className="text-emerald-700">{selectedFlight.liveTracking?.altitudeFeet.toLocaleString()} ft</strong>
                </div>
                <div className="bg-[#FAF9FA] p-1.5 rounded text-center">
                  <span className="text-[10px] text-[#777780] block font-sans">Ground Speed</span>
                  <strong className="text-[#25232A]">{selectedFlight.liveTracking?.groundSpeedKnots} kts</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: Aircraft Targets List & Telemetry Detail */}
        <div
          className={`lg:col-span-4 space-y-4 ${
            activeTab === 'map' ? 'hidden lg:block' : 'block'
          }`}
        >
          {/* Live Airborne Target List */}
          <div className="bg-white border border-[#E8E5E8] rounded-lg p-3.5 shadow-2xs">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E8E5E8]">
              <div>
                <h3 className="text-xs font-bold text-[#25232A] uppercase tracking-wider">
                  Active Airborne Targets
                </h3>
                <span className="text-[11px] text-[#777780]">
                  {filteredFlights.length} flights currently active
                </span>
              </div>
              <span className="font-mono text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                TRANS-CANADA
              </span>
            </div>

            <div className="space-y-2 max-h-[380px] sm:max-h-[420px] overflow-y-auto custom-scrollbar pr-1 divide-y divide-[#F0EEF0]">
              {filteredFlights.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#777780]">
                  No aircraft match search query &quot;{searchQuery}&quot;
                </div>
              ) : (
                filteredFlights.map((flight) => {
                  const isCurrent = selectedFlight?.id === flight.id;
                  return (
                    <div
                      key={flight.id}
                      onClick={() => handleFocusFlight(flight)}
                      className={`pt-2.5 pb-2 px-2.5 rounded-md cursor-pointer transition-all ${
                        isCurrent
                          ? 'bg-[#681C35]/10 border border-[#681C35]/40 shadow-xs'
                          : 'hover:bg-[#FAF9FA] border border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-[#681C35]">
                            {flight.flightNumber}
                          </span>
                          <span className="text-[10px] text-[#777780] font-sans">
                            {flight.airlineIata}
                          </span>
                        </div>
                        <span className="font-mono text-[11px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                          FL{flight.liveTracking ? Math.round(flight.liveTracking.altitudeFeet / 100) : '350'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-1">
                        <div className="text-xs font-semibold text-[#25232A] flex items-center gap-1.5">
                          <span>{flight.departureAirportIata}</span>
                          <ArrowRight className="w-3 h-3 text-[#777780]" />
                          <span>{flight.arrivalAirportIata}</span>
                        </div>
                        <span className="text-[11px] text-[#777780] font-mono">
                          {flight.liveTracking?.groundSpeedKnots ?? 480} kts
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-[#777780] mt-1 font-sans">
                        <span className="truncate max-w-[160px]">{flight.airlineName}</span>
                        <span className="text-[10px] text-[#681C35] font-medium flex items-center gap-0.5">
                          Track on map <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Selected Aircraft Telemetry Inspector */}
          {selectedFlight ? (
            <div className="bg-white border border-[#681C35] rounded-lg p-4 shadow-sm space-y-3">
              <div className="flex items-start justify-between border-b border-[#ECEBED] pb-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black font-mono text-[#681C35]">
                      {selectedFlight.flightNumber}
                    </span>
                    <FlightStatusBadge status={selectedFlight.status} />
                  </div>
                  <div className="text-xs font-semibold text-[#25232A] mt-0.5">
                    {selectedFlight.airlineName} ({selectedFlight.airlineIata})
                  </div>
                </div>

                <button
                  onClick={() => onNavigate(`/flight/${selectedFlight.flightNumber.toLowerCase()}`)}
                  className="px-3 py-1.5 bg-[#681C35] hover:bg-[#8A2948] text-white text-xs font-semibold rounded transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
                >
                  <span>Full Details</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-[#FAF9FA] p-2 rounded border border-[#ECEBED]">
                  <span className="text-[10px] text-[#777780] block font-sans">Flight Route</span>
                  <span className="font-bold text-[#681C35]">{selectedFlight.departureAirportIata} → {selectedFlight.arrivalAirportIata}</span>
                </div>
                <div className="bg-[#FAF9FA] p-2 rounded border border-[#ECEBED]">
                  <span className="text-[10px] text-[#777780] block font-sans">Aircraft Type</span>
                  <span className="font-bold text-[#25232A]">{selectedFlight.aircraftIcaoType}</span>
                </div>
                <div className="bg-[#FAF9FA] p-2 rounded border border-[#ECEBED]">
                  <span className="text-[10px] text-[#777780] block font-sans">Barometric Altitude</span>
                  <span className="font-bold text-emerald-800">{selectedFlight.liveTracking?.altitudeFeet.toLocaleString()} ft</span>
                </div>
                <div className="bg-[#FAF9FA] p-2 rounded border border-[#ECEBED]">
                  <span className="text-[10px] text-[#777780] block font-sans">Ground Speed</span>
                  <span className="font-bold text-[#25232A]">{selectedFlight.liveTracking?.groundSpeedKnots} kts</span>
                </div>
              </div>

              <div className="text-[10px] text-[#777780] pt-1 flex items-center justify-between border-t border-[#ECEBED]">
                <span>Source: {selectedFlight.liveTracking?.source} (Mode-S)</span>
                <span className="text-emerald-700 font-medium">Active FIR Telemetry</span>
              </div>
            </div>
          ) : (
            <div className="bg-[#FAF9FA] border border-dashed border-[#D5D0D5] rounded-lg p-5 text-center text-xs text-[#777780]">
              <Plane className="w-7 h-7 text-[#777780] mx-auto mb-2 opacity-50 -rotate-45" />
              <p className="font-bold text-[#25232A]">Select Aircraft on Radar</p>
              <p className="text-[11px] mt-1 leading-relaxed">
                Click an aircraft icon on the radar map or select an active target from the list to view real-time avionics, Mode-S transponder telemetry, and route data.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Sponsor Advertisement Placement */}
      <AdSenseUnit slotId="map-radar-mid-banner" format="horizontal" className="my-6" />

      {/* SECTION 1: NAV CANADA Flight Information Regions (FIR) Airspace Sectors */}
      <section className="bg-white border border-[#E8E5E8] rounded-lg p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#ECEBED] gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-800">
                NAV CANADA Operational Airspace Surveillance
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[#25232A] mt-0.5">
              Canadian Flight Information Regions (FIR) Control Centers
            </h2>
            <p className="text-xs text-[#777780]">
              Real-time Area Control Centre (ACC) radar tracking sectors, satellite ADS-B constellations, and transponder telemetry status.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#681C35] bg-[#681C35]/10 px-3 py-1.5 rounded-md self-start sm:self-auto">
            <Radio className="w-3.5 h-3.5 text-[#681C35] animate-pulse" />
            <span>1090 MHz ADS-B ACTIVE</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            {
              fir: 'CZYZ',
              name: 'Toronto Area Control Centre (ACC)',
              region: 'Ontario & Golden Horseshoe',
              status: 'Normal Flow',
              activeFlights: 42,
              altRange: 'SFC – FL600',
              radars: 'En-Route PSR/SSR + Space ADS-B'
            },
            {
              fir: 'CZVR',
              name: 'Vancouver Area Control Centre',
              region: 'British Columbia & Coastal Pacific',
              status: 'Normal Flow',
              activeFlights: 28,
              altRange: 'SFC – FL600',
              radars: 'Pacific Oceanic VHF + ADS-B'
            },
            {
              fir: 'CZUL',
              name: 'Montréal Area Control Centre',
              region: 'Québec, Nunavik & Maritime Feeder',
              status: 'Normal Flow',
              activeFlights: 31,
              altRange: 'SFC – FL600',
              radars: 'Dual-Band Primary/Secondary Radar'
            },
            {
              fir: 'CZEG',
              name: 'Edmonton Area Control Centre',
              region: 'Alberta, NWT, Nunavut & Polar FIR',
              status: 'Normal Flow',
              activeFlights: 24,
              altRange: 'SFC – FL600',
              radars: 'Space-Based ADS-B (Aireon 66-Sat)'
            },
            {
              fir: 'CZWG',
              name: 'Winnipeg Area Control Centre',
              region: 'Manitoba & Saskatchewan Prairies',
              status: 'Normal Flow',
              activeFlights: 19,
              altRange: 'SFC – FL600',
              radars: 'Transcontinental Corridor SSR'
            },
            {
              fir: 'CZQX',
              name: 'Gander Oceanic Control (OACC)',
              region: 'North Atlantic Tracks (NAT-CTS)',
              status: 'Peak Track Hours',
              activeFlights: 54,
              altRange: 'FL290 – FL410',
              radars: 'ADS-C / CPDLC & Satellite ADS-B'
            }
          ].map((item) => (
            <div
              key={item.fir}
              className="bg-[#FAF9FA] border border-[#ECEBED] hover:border-[#681C35] rounded-md p-3.5 transition-all group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono font-black text-sm text-[#681C35] bg-white px-2 py-0.5 rounded border border-[#E8E5E8]">
                  {item.fir}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                  {item.status}
                </span>
              </div>
              <h3 className="text-xs font-bold text-[#25232A] group-hover:text-[#681C35] transition-colors">
                {item.name}
              </h3>
              <p className="text-[11px] text-[#777780] mt-0.5">{item.region}</p>

              <div className="mt-2.5 pt-2 border-t border-[#ECEBED] grid grid-cols-2 gap-1 text-[10px] font-mono text-[#504e57]">
                <div>
                  <span className="text-[#999] block font-sans">Coverage:</span>
                  <span className="font-semibold text-[#25232A]">{item.altRange}</span>
                </div>
                <div>
                  <span className="text-[#999] block font-sans">Radar Type:</span>
                  <span className="truncate block font-semibold text-[#25232A]" title={item.radars}>
                    {item.radars}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2: Active Commercial Air Traffic Telemetry Table */}
      <section className="bg-white border border-[#E8E5E8] rounded-lg p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#ECEBED]">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#25232A] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#681C35]" />
              <span>Active Transponder Air Traffic in Canadian Airspace</span>
            </h2>
            <p className="text-xs text-[#777780] mt-0.5">
              Live squawking flights currently transmitting Mode-S Altitude, Calibrated Airspeed, and GPS waypoint coordinates.
            </p>
          </div>
          <button
            onClick={() => onNavigate('/flights')}
            className="text-xs font-semibold text-[#681C35] hover:text-[#8A2948] flex items-center gap-1 transition-colors self-start sm:self-auto cursor-pointer"
          >
            <span>View All Schedules</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF9FA] text-[#777780] font-mono uppercase text-[10px] border-b border-[#ECEBED]">
                <th className="py-2.5 px-3 font-semibold">Flight</th>
                <th className="py-2.5 px-3 font-semibold">Airline</th>
                <th className="py-2.5 px-3 font-semibold">Route</th>
                <th className="py-2.5 px-3 font-semibold">Aircraft</th>
                <th className="py-2.5 px-3 font-semibold">Altitude</th>
                <th className="py-2.5 px-3 font-semibold">Speed</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
                <th className="py-2.5 px-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECEBED]">
              {activeFlights.slice(0, 8).map((f) => (
                <tr
                  key={f.id}
                  className="hover:bg-[#FAF9FA] transition-colors cursor-pointer group"
                  onClick={() => handleFocusFlight(f)}
                >
                  <td className="py-2.5 px-3 font-mono font-bold text-[#681C35]">
                    {f.flightNumber}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-[#25232A] truncate max-w-[140px]">
                    {f.airlineName}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-[#25232A]">
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[11px] font-mono mr-1">{f.departureAirportIata}</span>
                    <span className="text-[#999]">&rarr;</span>
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[11px] font-mono ml-1">{f.arrivalAirportIata}</span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-[#504e57]">
                    {f.aircraftModel}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-emerald-800">
                    {f.liveTracking?.altitudeFeet ? `${f.liveTracking.altitudeFeet.toLocaleString()} ft` : 'FL360'}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[#504e57]">
                    {f.liveTracking?.groundSpeedKnots ? `${f.liveTracking.groundSpeedKnots} kts` : '475 kts'}
                  </td>
                  <td className="py-2.5 px-3">
                    <FlightStatusBadge status={f.status} />
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate(`/flight/${f.flightNumber.toLowerCase()}`);
                      }}
                      className="px-2.5 py-1 bg-[#681C35] hover:bg-[#8A2948] text-white text-[11px] font-semibold rounded transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Details</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 3: Featured Technical Aviation Radar Editorial Articles (High Dwell Time & AdSense Value) */}
      <section className="bg-white border border-[#E8E5E8] rounded-lg p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#ECEBED] gap-2">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#681C35] mb-1">
              <BookOpen className="w-4 h-4" />
              <span>TECHNICAL AVIONICS &amp; RADAR RESEARCH</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[#25232A]">
              In-Depth Radar Systems, Polar Navigation &amp; ATC Operations
            </h2>
            <p className="text-xs text-[#777780]">
              Transport Canada verified whitepapers explaining how space-based ADS-B, oceanic tracks, and mountain turbulence radars keep Canadian airspace safe.
            </p>
          </div>
          <a
            href="/articles"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/articles');
            }}
            className="text-xs font-semibold text-[#681C35] hover:text-[#8A2948] flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>Browse All 20 Aviation Research Guides</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {aviationService.getArticles().slice(0, 4).map((guide) => (
            <a
              key={guide.slug}
              href={`/articles/${guide.slug}`}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(`/articles/${guide.slug}`);
              }}
              className="bg-[#FAF9FA] border border-[#ECEBED] hover:border-[#681C35] rounded-md overflow-hidden hover:shadow-md transition-all cursor-pointer flex flex-col group text-left"
            >
              <div className="h-36 overflow-hidden relative bg-slate-100">
                <img
                  src={guide.featuredImage}
                  alt={guide.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <span className="absolute top-2 left-2 bg-[#681C35] text-white font-mono text-[9px] font-bold uppercase px-2 py-0.5 rounded shadow-xs">
                  {guide.category}
                </span>
                <span className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-xs text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
                  {guide.readTimeMinutes} min
                </span>
              </div>

              <div className="p-3.5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[#25232A] group-hover:text-[#681C35] transition-colors line-clamp-2 leading-snug">
                    {guide.title}
                  </h3>
                  <p className="text-[11px] text-[#777780] mt-1.5 line-clamp-2 leading-relaxed">
                    {guide.excerpt}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-[#ECEBED] flex items-center justify-between text-[11px] font-semibold text-[#681C35]">
                  <span>Read Guide</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* SECTION 4: Major Canadian Hubs Interactive Radar Quick-Jump */}
      <section className="bg-white border border-[#E8E5E8] rounded-lg p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#ECEBED] pb-2.5">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#681C35]" />
            <h2 className="text-sm sm:text-base font-bold text-[#25232A]">
              Direct Radar &amp; Timetable Feeds by Canadian Hub Aerodrome
            </h2>
          </div>
          <span className="text-[11px] font-mono text-[#777780]">6 Primary Gateways</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {[
            { code: 'YYZ', name: 'Toronto Pearson', prov: 'Ontario', rwys: '5 Runways', el: '569 ft' },
            { code: 'YVR', name: 'Vancouver Intl', prov: 'British Columbia', rwys: '3 Runways', el: '14 ft' },
            { code: 'YUL', name: 'Montréal-Trudeau', prov: 'Québec', rwys: '3 Runways', el: '118 ft' },
            { code: 'YYC', name: 'Calgary Intl', prov: 'Alberta', rwys: '4 Runways', el: '3,557 ft' },
            { code: 'YOW', name: 'Ottawa Intl', prov: 'Ontario', rwys: '3 Runways', el: '374 ft' },
            { code: 'YHZ', name: 'Halifax Stanfield', prov: 'Nova Scotia', rwys: '2 Runways', el: '477 ft' }
          ].map((hub) => (
            <button
              key={hub.code}
              type="button"
              onClick={() => onNavigate(`/airport/${hub.code}`)}
              className="bg-[#FAF9FA] hover:bg-white border border-[#ECEBED] hover:border-[#681C35] rounded p-2.5 text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-black text-sm text-[#681C35]">{hub.code}</span>
                <span className="text-[9px] text-[#777780] font-mono">{hub.el}</span>
              </div>
              <div className="text-xs font-bold text-[#25232A] truncate mt-0.5 group-hover:text-[#681C35]">
                {hub.name}
              </div>
              <div className="text-[10px] text-[#777780] flex items-center justify-between mt-1">
                <span>{hub.prov}</span>
                <span className="font-mono text-[#999]">{hub.rwys}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* SECTION 5: Universal Rich Discovery Section */}
      <ExploreMoreSection onNavigate={onNavigate} />
    </div>
  );
};

