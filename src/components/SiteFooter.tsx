import React from 'react';
import { Youtube, Instagram, Facebook, Mail } from 'lucide-react';
import { SOCIAL_LINKS, CONTACT_EMAIL } from '../data/site';

interface SiteFooterProps {
  isDark: boolean;
}

const links = [
  { href: SOCIAL_LINKS.youtube, label: 'YouTube', Icon: Youtube, color: 'text-[#FF0000]', external: true },
  { href: SOCIAL_LINKS.instagram, label: 'Instagram', Icon: Instagram, color: 'text-[#E1306C]', external: true },
  { href: SOCIAL_LINKS.facebook, label: 'Facebook', Icon: Facebook, color: 'text-[#1877F2]', external: true },
  { href: `mailto:${CONTACT_EMAIL}`, label: 'தொடர்புக்கு', Icon: Mail, color: '', external: false },
];

/** One simple line at the bottom of every page: social icons + contact. */
export const SiteFooter: React.FC<SiteFooterProps> = ({ isDark }) => (
  <footer
    id="contact"
    className={`w-full flex flex-wrap items-center justify-center gap-x-3.5 sm:gap-x-6 gap-y-2 px-2 py-5 text-[12.5px] sm:text-[13px] ${
      isDark ? 'text-[#9FB0A6]' : 'text-[#6D766F]'
    }`}
  >
    {links.map(({ href, label, Icon, color, external }) => (
      <a
        key={label}
        href={href}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        title={label === 'தொடர்புக்கு' ? CONTACT_EMAIL : label}
        className={`inline-flex items-center gap-1 sm:gap-1.5 transition-colors ${isDark ? 'hover:text-white' : 'hover:text-[#16392E]'}`}
      >
        <Icon className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${color}`} />
        {label}
      </a>
    ))}
  </footer>
);
