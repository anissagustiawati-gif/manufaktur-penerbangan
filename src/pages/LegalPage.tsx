import React, { useState } from 'react';
import {
  ShieldCheck,
  Mail,
  FileText,
  AlertTriangle,
  Info,
  CheckCircle,
  Plane,
  Building,
  Send
} from 'lucide-react';
import { ExploreMoreSection } from '../components/ExploreMoreSection';
import { aviationService, ADMIN_CONFIG } from '../services/aviationService';

interface Props {
  pageType: 'about' | 'contact' | 'privacy' | 'terms' | 'disclaimer' | 'editorial-policy';
  onNavigate: (path: string) => void;
}

export const LegalPage: React.FC<Props> = ({ pageType, onNavigate }) => {
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (contactName && contactEmail && contactMessage) {
      aviationService.submitContactMessage({
        name: contactName,
        email: contactEmail,
        subject: contactSubject,
        message: contactMessage
      });
      setIsSubmitted(true);
    }
  };

  const navLinks = [
    { type: 'about', label: 'About Us', path: '/about' },
    { type: 'contact', label: 'Contact Us', path: '/contact' },
    { type: 'privacy', label: 'Privacy Policy', path: '/privacy' },
    { type: 'terms', label: 'Terms & Conditions', path: '/terms' },
    { type: 'disclaimer', label: 'Aviation Disclaimer', path: '/disclaimer' },
    { type: 'editorial-policy', label: 'Editorial Policy', path: '/editorial-policy' }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-8 font-sans">
      {/* Sub-Navigation Tabs */}
      <nav aria-label="Legal and company pages" className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar border-b border-[#E8E5E8] pb-2">
        {navLinks.map((link) => (
          <a
            key={link.type}
            href={link.path}
            onClick={(e) => {
              e.preventDefault();
              onNavigate(link.path);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded whitespace-nowrap transition-colors cursor-pointer ${
              pageType === link.type
                ? 'bg-[#681C35] text-white shadow-xs'
                : 'bg-white border border-[#E8E5E8] text-[#504e57] hover:border-[#681C35]'
            }`}
          >
            {link.label}
          </a>
        ))}
      </nav>

      {/* 1. ABOUT US */}
      {pageType === 'about' && (
        <section className="bg-white border border-[#E8E5E8] rounded-md p-6 sm:p-8 space-y-6 shadow-2xs">
          <div className="border-b border-[#E8E5E8] pb-4">
            <h1 className="text-2xl font-extrabold text-[#25232A]">
              About World Flight Schedule
            </h1>
            <p className="text-xs text-[#777780] mt-1">
              Mission, editorial independence, aviation engineering expertise, and global data transparency.
            </p>
          </div>

          <div className="text-xs sm:text-sm text-[#3a3740] leading-relaxed space-y-4">
            <p>
              <strong>WORLD FLIGHT SCHEDULE</strong> is an independent international aviation information platform dedicated to delivering transparent, accurate, and timely civil aviation data. We provide global passengers, airline crew, aviation analysts, and air freight forwarders with comprehensive flight schedules, airport timetables, aircraft telemetry, and operational news.
            </p>

            <h2 className="text-base font-bold text-[#681C35] pt-2">Our Core Pillars</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Data Accuracy Over Speculation:</strong> We ingest timetable records and transponder telemetry strictly from verified civil aviation authorities and authenticated ADS-B networks. We never fabricate flight numbers or invent statistics.
              </li>
              <li>
                <strong>Global Accessibility:</strong> Our platform serves international travelers across 190+ sovereign airspace jurisdictions with standardized UTC and airport local time calculations.
              </li>
              <li>
                <strong>Editorial Integrity:</strong> All technical guides, route analyses, and aircraft directory entries undergo review by certified dispatchers and aviation specialists.
              </li>
            </ul>

            <h2 className="text-base font-bold text-[#681C35] pt-2">Operational Data Architecture &amp; Coverage</h2>
            <p>
              Our backend integrates multi-source timetable feeds alongside ADS-B Mode-S telemetry provided by the OpenSky Network, Transport Canada civil aerodrome publications, NAV CANADA Flight Information Region boundaries, and verified airport master records across all ten provinces and three territories.
            </p>
            <p>
              From major transcontinental gateways such as Toronto Pearson (YYZ), Vancouver (YVR), Montréal–Trudeau (YUL), and Calgary (YYC) to northern Arctic and regional corridors including Iqaluit (YFB), Yellowknife (YZF), Whitehorse (YXY), and Billy Bishop Toronto City Airport (YTZ), every airport board and fleet entry is structured to eliminate stale guesswork and provide clean, standardized reference data for travelers and dispatch observers alike.
            </p>
            <h2 className="text-base font-bold text-[#681C35] pt-2">Independent Editorial Stewardship</h2>
            <p>
              World Flight Schedule (manufaktur.biz.id) operates independently from commercial ticket resellers and airlines. Our research library publishes long-form technical explainers on cold-weather de-icing holdover engineering, Air Passenger Protection Regulations (APPR), Mirabel Airbus A220 assembly, and space-based polar ADS-B surveillance, backed by transparent source citations and direct reader correction channels.
            </p>
          </div>
        </section>
      )}

      {/* 2. CONTACT US */}
      {pageType === 'contact' && (
        <section className="bg-white border border-[#E8E5E8] rounded-md p-6 sm:p-8 space-y-6 shadow-2xs">
          <div className="border-b border-[#E8E5E8] pb-4">
            <h1 className="text-2xl font-extrabold text-[#25232A]">
              Contact Our Editorial & Technical Desk
            </h1>
            <p className="text-xs text-[#777780] mt-1">
              Inquire regarding data syndication, press inquiries, schedule corrections, or technical support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-7">
              {isSubmitted ? (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-6 rounded-md space-y-2 text-center">
                  <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h3 className="font-bold text-base">Inquiry Recorded for {ADMIN_CONFIG.EMAIL}</h3>
                  <p className="text-xs text-emerald-800">
                    Thank you, <strong>{contactName}</strong>. Your inquiry has been logged for our editorial &amp; operations desk (<strong>{ADMIN_CONFIG.EMAIL}</strong>). You can also send a direct email copy below.
                  </p>
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    <a
                      href={`mailto:${ADMIN_CONFIG.EMAIL}?subject=${encodeURIComponent(`[World Flight Schedule Contact] ${contactSubject}`)}&body=${encodeURIComponent(`From: ${contactName} (${contactEmail})\n\nMessage:\n${contactMessage}`)}`}
                      className="px-4 py-1.5 bg-white border border-emerald-300 text-emerald-900 text-xs font-semibold rounded hover:bg-emerald-100"
                    >
                      Open Email Client
                    </a>
                    <button
                      type="button"
                      onClick={() => setIsSubmitted(false)}
                      className="px-4 py-1.5 bg-[#681C35] text-white text-xs font-semibold rounded cursor-pointer"
                    >
                      Send Another Inquiry
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitContact} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-medium text-[#25232A] mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g. Captain Marcus Vance"
                      className="w-full bg-[#F8F8FA] border border-[#E8E5E8] rounded p-2 focus:outline-none focus:border-[#681C35]"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-[#25232A] mb-1">Official Email Address</label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="e.g. contact@domain.com"
                      className="w-full bg-[#F8F8FA] border border-[#E8E5E8] rounded p-2 focus:outline-none focus:border-[#681C35]"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-[#25232A] mb-1">Subject / Inquiry Type</label>
                    <input
                      type="text"
                      required
                      value={contactSubject}
                      onChange={(e) => setContactSubject(e.target.value)}
                      placeholder="e.g. Airport Timetable Correction / Press Inquiry"
                      className="w-full bg-[#F8F8FA] border border-[#E8E5E8] rounded p-2 focus:outline-none focus:border-[#681C35]"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-[#25232A] mb-1">Message Content</label>
                    <textarea
                      required
                      rows={5}
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Please provide flight identifiers, airport codes, or detailed operational context..."
                      className="w-full bg-[#F8F8FA] border border-[#E8E5E8] rounded p-2 focus:outline-none focus:border-[#681C35]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#681C35] hover:bg-[#8A2948] text-white text-xs font-semibold rounded shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Transmit Message</span>
                  </button>
                </form>
              )}
            </div>

            <div className="md:col-span-5 bg-[#FAF9FA] p-5 rounded border border-[#E8E5E8] space-y-4 text-xs">
              <h3 className="font-bold text-[#25232A] text-xs uppercase tracking-wider text-[#681C35]">
                Operations Desk
              </h3>
              <p className="text-[#777780] leading-relaxed">
                Our aviation data coordinators monitor timetable feed adjustments, gate reallocations, and carrier alliance updates continuously.
              </p>
              <div className="space-y-2 text-[#3a3740]">
                <div>
                  <strong>Official Admin Desk:</strong> {ADMIN_CONFIG.EMAIL}
                </div>
                <div>
                  <strong>Direct Inquiries:</strong> anissagustiawati@gmail.com
                </div>
                <div>
                  <strong>Operating Response Hours:</strong> 24/7 Global Airspace Coverage
                </div>
                <div>
                  <strong>Primary Publisher Domain:</strong> https://manufaktur.biz.id
                </div>
              </div>
              <div className="pt-3 border-t border-[#E8E5E8] space-y-2 text-[#504e57]">
                <p>
                  <strong>Timetable &amp; Aerodrome Corrections:</strong> Please include the flight designator (e.g., AC103, WS711), IATA/ICAO airport code, and scheduled UTC or local departure window so our coordinators can cross-verify against published carrier filings.
                </p>
                <p>
                  <strong>Editorial &amp; Rights Inquiries:</strong> Requests regarding Transport Canada regulatory updates, privacy compliance under GDPR/CCPA, copyright notices, or advertising partnerships receive documented review within one to two business days.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-[#E8E5E8] pt-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#3a3740]">
            <div className="p-4 bg-[#F8F8FA] rounded border border-[#E8E5E8] space-y-1">
              <h3 className="font-bold text-[#681C35]">1. Schedule Verification Desk</h3>
              <p className="text-[#504e57] leading-relaxed">
                Report terminal gate reallocations, runway closures, aircraft type substitutions, or codeshare updates across Canadian hub and regional airports.
              </p>
            </div>
            <div className="p-4 bg-[#F8F8FA] rounded border border-[#E8E5E8] space-y-1">
              <h3 className="font-bold text-[#681C35]">2. Technical Editorial Review</h3>
              <p className="text-[#504e57] leading-relaxed">
                Submit peer engineering feedback, type-certificate references, or APPR compensation clarification requests directly to our aviation writers.
              </p>
            </div>
            <div className="p-4 bg-[#F8F8FA] rounded border border-[#E8E5E8] space-y-1">
              <h3 className="font-bold text-[#681C35]">3. Privacy &amp; Governance</h3>
              <p className="text-[#504e57] leading-relaxed">
                Contact our Data Protection Coordinator regarding Google AdSense cookie choices, GDPR data inquiries, or institutional media attribution.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* 3. PRIVACY POLICY */}
      {pageType === 'privacy' && (
        <section className="bg-white border border-[#E8E5E8] rounded-md p-6 sm:p-8 space-y-6 shadow-2xs">
          <div className="border-b border-[#E8E5E8] pb-4">
            <h1 className="text-2xl font-extrabold text-[#25232A]">
              Privacy Policy & Cookie Disclosure
            </h1>
            <p className="text-xs text-[#777780] mt-1">
              Last updated: November 2, 2026 · Compliant with GDPR, CCPA, and Google AdSense publisher policies.
            </p>
          </div>

          <div className="text-xs sm:text-sm text-[#3a3740] leading-relaxed space-y-4">
            <p>
              World Flight Schedule (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) respects your privacy and is dedicated to protecting your personal data. This comprehensive Privacy Policy outlines how information is collected, processed, and safeguarded when you access <strong>manufaktur.biz.id</strong> and our global aviation information services.
            </p>

            <h2 className="text-base font-bold text-[#681C35] pt-2">1. Personal Information We Do Not Collect</h2>
            <p>
              World Flight Schedule is a public civil aviation intelligence and flight tracking reference. We do not require user account registration, credit card details, or personal passenger identification to view live flight radars, airport arrival/departure timetables, or aeronautical research guides.
            </p>

            <h2 className="text-base font-bold text-[#681C35] pt-2">2. Google AdSense & Third-Party Advertising Vendors</h2>
            <p>
              We partner with third-party advertising vendors, including Google AdSense, to display non-intrusive advertisements across our pages:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Third-party vendors, including Google, use cookies</strong> to serve ads based on a user&apos;s prior visits to this website or other websites on the internet.
              </li>
              <li>
                <strong>Google&apos;s use of advertising cookies</strong> enables it and its partners to serve ads to users based on their visit to our sites and/or other sites on the Internet.
              </li>
              <li>
                Users may opt out of personalized advertising by visiting <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-[#681C35] underline font-medium">Google Ads Settings</a>.
              </li>
              <li>
                Alternatively, users can opt out of a third-party vendor&apos;s use of cookies for personalized advertising by visiting <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-[#681C35] underline font-medium">AboutAds.info</a> or the <a href="https://optout.networkadvertising.org/" target="_blank" rel="noopener noreferrer" className="text-[#681C35] underline font-medium">Network Advertising Initiative (NAI)</a> opt-out tool.
              </li>
            </ul>

            <h2 className="text-base font-bold text-[#681C35] pt-2">3. Cookies, Web Beacons & Local Storage</h2>
            <p>
              Our website uses technical cookies and browser local storage to preserve your user interface preferences (such as selected airport timetable tabs, UTC vs local time displays, and search filter parameters). These do not contain personally identifiable information. You can configure your browser (Google Chrome, Apple Safari, Mozilla Firefox, Microsoft Edge) to reject or delete cookies at any time.
            </p>

            <h2 className="text-base font-bold text-[#681C35] pt-2">4. European Economic Area (GDPR) Compliance</h2>
            <p>
              For visitors residing within the European Economic Area (EEA), United Kingdom, and Switzerland, our data processing activities comply with the General Data Protection Regulation (GDPR). You retain full statutory rights to access, rectify, or request erasure of any technical server telemetry associated with your IP address, as well as the right to lodge inquiries with your national Data Protection Authority.
            </p>

            <h2 className="text-base font-bold text-[#681C35] pt-2">5. California Consumer Privacy Act (CCPA / CPRA)</h2>
            <p>
              Under the California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA), California residents are entitled to know what categories of personal data are collected and whether such data is sold or shared. <strong>We do not sell, rent, or monetize your personal information to any third party.</strong>
            </p>

            <h2 className="text-base font-bold text-[#681C35] pt-2">6. Children&apos;s Privacy (COPPA Compliance)</h2>
            <p>
              Our services are directed to adult air travel consumers, aviation professionals, and academic researchers. We do not knowingly solicit or collect information from children under 13 years of age.
            </p>

            <h2 className="text-base font-bold text-[#681C35] pt-2">7. Contact the Data Protection Officer</h2>
            <p>
              For any questions regarding this Privacy Policy, cookie disclosures, or data protection practices, please contact us at <strong>anissagustiawati@gmail.com</strong> or submit an inquiry through our{' '}
              <a
                href="/contact"
                onClick={(e) => { e.preventDefault(); onNavigate('/contact'); }}
                className="text-[#681C35] underline font-semibold cursor-pointer"
              >
                Contact Desk
              </a>.
            </p>
          </div>
        </section>
      )}

      {/* 4. TERMS AND CONDITIONS */}
      {pageType === 'terms' && (
        <section className="bg-white border border-[#E8E5E8] rounded-md p-6 sm:p-8 space-y-6 shadow-2xs">
          <div className="border-b border-[#E8E5E8] pb-4">
            <h1 className="text-2xl font-extrabold text-[#25232A]">
              Terms and Conditions
            </h1>
            <p className="text-xs text-[#777780] mt-1">
              Standard operating agreement governing the usage of World Flight Schedule.
            </p>
          </div>

          <div className="text-xs sm:text-sm text-[#3a3740] leading-relaxed space-y-4">
            <p>
              By accessing World Flight Schedule (<strong>manufaktur.biz.id</strong>), including its airport flight boards, Canadian carrier schedules, aircraft specification references, live radar maps, and technical editorial guides, you agree to comply with and be bound by the following Terms and Conditions.
            </p>
            <h2 className="text-base font-bold text-[#681C35] pt-2">1. Acceptable Usage &amp; Fair Access</h2>
            <p>
              You agree to use our flight search, airport directories, and live tracking radar strictly for lawful personal, academic, or informational reference. High-frequency automated scraping, denial-of-service behavior, unauthorized framing of proprietary schedule matrices, or any activity that degrades platform responsiveness for fellow aviation readers is strictly prohibited.
            </p>
            <h2 className="text-base font-bold text-[#681C35] pt-2">2. Informational Aviation Schedules Only</h2>
            <p>
              All flight departure times, arrival windows, gate indicators, equipment models, and telemetry coordinates presented on World Flight Schedule are supplied for general travel planning and aviation research. Carriers may adjust gates, equipment, or departure slots at short notice due to air traffic control flow programs, de-icing queues, or severe weather diversions. Users must confirm final boarding obligations directly with their operating carrier.
            </p>
            <h2 className="text-base font-bold text-[#681C35] pt-2">3. Intellectual Property &amp; Editorial Licensing</h2>
            <p>
              All original aviation research articles, structured directory layouts, software interfaces, visual brand identity, and compiled timetable schemas are protected under international copyright and intellectual property conventions. Short academic citations are permitted with clear source attribution and a canonical link back to the original page on manufaktur.biz.id.
            </p>
            <h2 className="text-base font-bold text-[#681C35] pt-2">4. Limitation of Liability &amp; Governing Inquiries</h2>
            <p>
              World Flight Schedule makes no warranty regarding uninterrupted availability or real-time completeness of external third-party transponder or airline feeds and assumes no liability for missed connections, travel expenses, or commercial losses arising from schedule reliance. Questions regarding these Terms may be directed to <strong>anissagustiawati@gmail.com</strong>.
            </p>
          </div>
        </section>
      )}

      {/* 5. DISCLAIMER */}
      {pageType === 'disclaimer' && (
        <section className="bg-white border border-[#E8E5E8] rounded-md p-6 sm:p-8 space-y-6 shadow-2xs">
          <div className="border-b border-[#E8E5E8] pb-4">
            <h1 className="text-2xl font-extrabold text-[#25232A]">
              Aviation Data Accuracy & Navigational Disclaimer
            </h1>
            <p className="text-xs text-[#777780] mt-1">
              Mandatory civil aviation operational guidance and informational limitation notice.
            </p>
          </div>

          <div className="text-xs sm:text-sm text-[#3a3740] leading-relaxed space-y-4">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded text-amber-900 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong>NOT FOR OPERATIONAL FLIGHT PLANNING OR IN-FLIGHT NAVIGATION:</strong> Flight schedules, estimated times, altitudes, aircraft tracks, and gate assignments displayed on this platform are for general informational purposes only. Licensed aircrews must consult official NOTAMs, NAV CANADA Aeronautical Information Publications (AIP), METAR/TAF aviation weather advisories, and certified airline dispatch releases.
              </div>
            </div>

            <h2 className="text-base font-bold text-[#681C35] pt-2">Dynamic Schedule &amp; Airspace Variability</h2>
            <p>
              While World Flight Schedule implements rigorous automated normalization and timetable cross-checks across Canadian international, regional, and Arctic aerodromes, commercial airline schedules, tail-number equipment substitutions, air traffic control Ground Delay Programs (GDPs), and winter de-icing holdover delays occur dynamically.
            </p>
            <h2 className="text-base font-bold text-[#681C35] pt-2">ADS-B Telemetry &amp; Coverage Constraints</h2>
            <p>
              Mode-S ADS-B altitude, velocity, and track indicators depend on terrestrial receiver reception and satellite-based ADS-B relay intervals over oceanic and high-latitude northern airspace. Apparent gaps in ground speed or low-altitude taxi coverage do not represent aircraft emergencies or route cancellations.
            </p>
            <h2 className="text-base font-bold text-[#681C35] pt-2">Passenger Verification Obligation</h2>
            <p>
              Passengers traveling through Canadian or transborder pre-clearance terminals must always re-confirm check-in cutoff deadlines, boarding times, gate reallocations, and baggage claim carousels directly with their operating airline or the official airport Flight Information Display System (FIDS). Editorial &amp; data discrepancy reports can be sent to <strong>anissagustiawati@gmail.com</strong>.
            </p>
          </div>
        </section>
      )}

      {/* 6. EDITORIAL POLICY */}
      {pageType === 'editorial-policy' && (
        <section className="bg-white border border-[#E8E5E8] rounded-md p-6 sm:p-8 space-y-6 shadow-2xs">
          <div className="border-b border-[#E8E5E8] pb-4">
            <h1 className="text-2xl font-extrabold text-[#25232A]">
              Editorial Standards & Fact Verification Policy
            </h1>
            <p className="text-xs text-[#777780] mt-1">
              Our commitment to journalistic integrity, technical rigor, and factual aviation research across Canadian civil airspace.
            </p>
          </div>

          <div className="text-xs sm:text-sm text-[#3a3740] leading-relaxed space-y-4">
            <p>
              World Flight Schedule adheres to strict standards of civil aviation journalism, engineering transparency, and timetable verification across every directory page and long-form technical report hosted at <strong>manufaktur.biz.id</strong>.
            </p>
            <h2 className="text-base font-bold text-[#681C35] pt-2">1. Primary-Source Factual Verification</h2>
            <p>
              We prohibit the fabrication of aviation news, traffic statistics, official agency statements, carrier fleet orders, or aerodrome runway specifications. All technical claims, aircraft weights, holdover times, and regulatory obligations are grounded in primary authoritative sources: Transport Canada Canadian Aviation Regulations (CARs), Air Passenger Protection Regulations (APPR), NAV CANADA airspace directives, manufacturer Type Certificate Data Sheets (TCDS), and official airport authority engineering reports.
            </p>

            <h2 className="text-base font-bold text-[#681C35] pt-2">2. Specialist Author Attribution &amp; Review</h2>
            <p>
              Every long-form guide published in our Aviation News &amp; Operational Insights repository carries transparent author attribution, technical credentials, publication dates, and structured reading times. Content covering winter glycol holdover tables, space-based ADS-B, Pratt &amp; Whitney geared turbofan dispatch metrics, and polar ETOPS routing undergoes verification against current operational standards before publication.
            </p>

            <h2 className="text-base font-bold text-[#681C35] pt-2">3. Editorial Independence &amp; Advertising Separation</h2>
            <p>
              Our editorial analyses and airport/airline directories remain strictly independent from commercial advertising placements or carrier sponsorships. Automated display advertising serves strictly to sustain open-access aviation documentation without influencing route evaluations, carrier profiles, or regulatory explanations.
            </p>

            <h2 className="text-base font-bold text-[#681C35] pt-2">4. Prompt Corrections &amp; Archive Integrity</h2>
            <p>
              When civil aviation rules evolve, runways are re-designated, or a reader identifies a factual discrepancy in any article or aerodrome profile, our editorial desk (<strong>anissagustiawati@gmail.com</strong>) audits the primary filing and updates the record promptly with refreshed timestamps and clear documentation.
            </p>
          </div>
        </section>
      )}

      {/* Comprehensive Bottom Discovery Section */}
      <ExploreMoreSection
        onNavigate={onNavigate}
        title="Explore Featured Canadian Aviation Research & Airspace Timetables"
        subtitle="Discover our certified editorial analyses, winter operations guidelines, and daily synchronized flight matrices across Canada."
      />
    </div>
  );
};
