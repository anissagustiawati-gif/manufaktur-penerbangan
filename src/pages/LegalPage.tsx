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

            <h2 className="text-base font-bold text-[#681C35] pt-2">Operational Data Architecture</h2>
            <p>
              Our backend integrates multi-source timetable feeds alongside ADS-B Mode-S telemetry provided by the OpenSky Network, European and North American civil aviation databases, and verified airport master records.
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
              </div>
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
              By accessing World Flight Schedule, you agree to comply with and be bound by the following terms of service.
            </p>
            <h2 className="text-base font-bold text-[#681C35] pt-2">Acceptable Usage</h2>
            <p>
              You agree to use our flight search, airport directories, and live tracking radar strictly for lawful informational purposes. Automated scraping that exceeds rate limits or disrupts service availability is prohibited.
            </p>
            <h2 className="text-base font-bold text-[#681C35] pt-2">Intellectual Property</h2>
            <p>
              All editorial articles, software interfaces, visual brand identity, and compiled datasets are protected under international copyright and intellectual property conventions.
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
              Mandatory civil aviation operational guidance.
            </p>
          </div>

          <div className="text-xs sm:text-sm text-[#3a3740] leading-relaxed space-y-4">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded text-amber-900 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong>NOT FOR OPERATIONAL FLIGHT PLANNING OR IN-FLIGHT NAVIGATION:</strong> Flight schedules, estimated times, altitudes, aircraft tracks, and gate assignments displayed on this platform are for general informational purposes only. Licensed aircrews must consult official NOTAMs, aeronautical AIP publications, and airline dispatch releases.
              </div>
            </div>

            <p>
              While World Flight Schedule implements rigorous automated normalization and timetable cross-checks, airline schedules, aircraft substitutions, air traffic control hold patterns, and weather diversions occur dynamically.
            </p>
            <p>
              Always re-confirm boarding times, gate allocations, and terminal changes directly with your operating airline or the airport flight information display system (FIDS).
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
              Our commitment to journalistic integrity, technical rigor, and factual aviation research.
            </p>
          </div>

          <div className="text-xs sm:text-sm text-[#3a3740] leading-relaxed space-y-4">
            <p>
              World Flight Schedule adheres to strict standards of aviation journalism and technical verification:
            </p>
            <h2 className="text-base font-bold text-[#681C35] pt-2">Factual Sources Only</h2>
            <p>
              We prohibit the fabrication of aviation news, statistics, official statements, airline fleet decisions, or aerodrome specifications. All factual data points are grounded in primary sources: certified airline filings, aircraft manufacturer type-certificate data sheets (TCDS), and official airport authority publications.
            </p>

            <h2 className="text-base font-bold text-[#681C35] pt-2">Human Editorial Review</h2>
            <p>
              Every article published in our Aviation News & Travel Insights repository is reviewed and authenticated by accredited aviation specialists with experience in airline dispatch, piloting, or airport logistics.
            </p>

            <h2 className="text-base font-bold text-[#681C35] pt-2">Corrections Policy</h2>
            <p>
              If a factual error is identified in any article or directory entry, our editorial desk updates the record promptly with a transparent update notice indicating the nature of the correction.
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
