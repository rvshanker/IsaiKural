import React from 'react';
import { Youtube, Instagram, Facebook, Mail, MessageCircle } from 'lucide-react';
import { SOCIAL_LINKS, MESSAGE_LINKS, CONTACT_EMAIL } from '../data/site';

interface SiteFooterProps {
  isDark: boolean;
}

const socials = [
  { href: SOCIAL_LINKS.youtube, label: 'YouTube', sub: 'Creative Corner Tamil', Icon: Youtube, color: 'text-[#FF0000]' },
  { href: SOCIAL_LINKS.instagram, label: 'Instagram', sub: '@isaiyil.thirukkural', Icon: Instagram, color: 'text-[#E1306C]' },
  { href: SOCIAL_LINKS.facebook, label: 'Facebook', sub: 'இசையில் திருக்குறள்', Icon: Facebook, color: 'text-[#1877F2]' },
];

/** Follow-us links and a contact section, shown at the bottom of every page. */
export const SiteFooter: React.FC<SiteFooterProps> = ({ isDark }) => {
  const card = isDark ? 'bg-[#161A17] border-[#2A302C]' : 'bg-white/70 border-[#ECEBE5]';
  const heading = isDark ? 'text-[#EEE8DC]' : 'text-[#16392E]';
  const muted = isDark ? 'text-[#9FB0A6]' : 'text-[#6D766F]';
  const pill = `inline-flex items-center gap-2 px-4 py-2.5 rounded-full border text-[14px] font-medium transition-colors ${
    isDark
      ? 'border-[#2A302C] text-[#DDE6E0] hover:bg-white/5'
      : 'border-[#E2DFD8] bg-white text-[#1D3B30] hover:bg-[#F5F8F6]'
  }`;

  return (
    <footer id="contact" className="w-full max-w-[1100px] mx-auto px-3 sm:px-8 pb-10 pt-2 scroll-mt-24">
      <div className={`rounded-[14px] border px-5 sm:px-8 py-6 sm:py-7 ${card}`}>
        <div className="grid gap-7 md:grid-cols-2">
          {/* Follow us */}
          <section>
            <h2 className={`font-tamil-sans text-[20px] sm:text-[22px] font-bold ${heading}`}>எங்களைப் பின்தொடர</h2>
            <p className={`text-[13px] mt-0.5 ${muted}`}>Follow இசையில் திருக்குறள் for new songs</p>
            <div className="mt-4 space-y-2.5">
              {socials.map(({ href, label, sub, Icon, color }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-3 rounded-xl border px-3.5 py-2.5 transition-colors ${
                    isDark ? 'border-[#2A302C] hover:bg-white/5' : 'border-[#ECEBE5] bg-white hover:bg-[#F5F8F6]'
                  }`}
                >
                  <Icon className={`w-6 h-6 shrink-0 ${color}`} />
                  <span className="min-w-0">
                    <span className={`block text-[14.5px] font-semibold ${heading}`}>{label}</span>
                    <span className={`block text-[12.5px] truncate ${muted}`}>{sub}</span>
                  </span>
                </a>
              ))}
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className={`font-tamil-sans text-[20px] sm:text-[22px] font-bold ${heading}`}>தொடர்புக்கு</h2>
            <p className={`text-[13px] mt-0.5 ${muted}`}>
              கருத்துகள், பரிந்துரைகள், அல்லது ஒத்துழைப்புக்கு எங்களைத் தொடர்பு கொள்ளுங்கள்.
              <br />
              Questions, feedback or a Kural you'd like us to sing? Reach out.
            </p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              <a
                href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('இசையில் திருக்குறள் — தொடர்பு')}`}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-[14px] font-semibold text-white bg-[#1D5A43] hover:bg-[#164433] transition-colors`}
              >
                <Mail className="w-4 h-4" /> {CONTACT_EMAIL}
              </a>
              <a href={MESSAGE_LINKS.instagram} target="_blank" rel="noopener noreferrer" className={pill}>
                <Instagram className="w-4 h-4 text-[#E1306C]" /> Instagram-ல் செய்தி
              </a>
              <a href={MESSAGE_LINKS.facebook} target="_blank" rel="noopener noreferrer" className={pill}>
                <MessageCircle className="w-4 h-4 text-[#1877F2]" /> Facebook-ல் செய்தி
              </a>
            </div>
          </section>
        </div>

        <div className={`mt-7 pt-4 border-t text-[12.5px] flex flex-wrap items-center justify-between gap-2 ${
          isDark ? 'border-[#2A302C]' : 'border-[#ECEBE5]'
        } ${muted}`}>
          <span>© {new Date().getFullYear()} இசையில் திருக்குறள் · isaikural.com</span>
          <span className="flex items-center gap-3">
            {socials.map(({ href, label, Icon }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="hover:opacity-80">
                <Icon className="w-4.5 h-4.5" />
              </a>
            ))}
          </span>
        </div>
      </div>
    </footer>
  );
};
