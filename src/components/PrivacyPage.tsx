import React from 'react';

/** Privacy policy (also used as the App Store privacy policy URL: https://isaikural.com/#/privacy). */
export const PrivacyPage: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const h = `mt-6 mb-1.5 text-[17px] font-bold ${isDark ? 'text-[#EEE8DC]' : 'text-[#16392E]'}`;
  const p = `text-[15px] leading-relaxed ${isDark ? 'text-[#C9D6CD]' : 'text-[#2E3B35]'}`;
  return (
    <article className="mt-2">
      <h1 className={`font-tamil-sans text-[24px] sm:text-[30px] font-bold ${isDark ? 'text-[#EEE8DC]' : 'text-[#16392E]'}`}>தனியுரிமைக் கொள்கை · Privacy Policy</h1>
      <p className={`mt-1 text-[13px] ${isDark ? 'text-[#9FB0A6]' : 'text-[#6D766F]'}`}>
        இசையில் திருக்குறள் (isaikural.com and the iPhone app) · Last updated 21 November 2026
      </p>

      <h2 className={h}>In short</h2>
      <p className={p}>
        You can read every Kural, listen to the songs and use every feature without an account. We do not sell or share your information,
        and we do not show ads.
      </p>

      <h2 className={h}>Kept only on your device</h2>
      <p className={p}>
        Your saved (bookmarked) Kurals, theme choice and daily-reminder time are stored in your own browser or app. They never leave your
        device. Daily Kural reminders in the iPhone app are scheduled on the phone itself; no notification server is involved.
      </p>

      <h2 className={h}>Feedback you send</h2>
      <p className={p}>
        When you use the feedback form we store your message, the type of feedback, a Kural number if you give one, and your name and
        email or phone only if you choose to enter them. To prevent spam we also store your device type (phone or computer), your
        country and a one-way scrambled code of your network address (the address itself is not kept). Feedback is used only to improve
        the site and to reply to you, and you can ask us to delete it at any time.
      </p>

      <h2 className={h}>Visit statistics</h2>
      <p className={p}>
        We use Cloudflare Web Analytics, which counts visits and page views without cookies and without identifying you. The site is
        served through Cloudflare, which processes standard request information to deliver and protect the site.
      </p>

      <h2 className={h}>Songs (YouTube)</h2>
      <p className={p}>
        The musical Kurals play through YouTube's privacy-enhanced player (youtube-nocookie.com). When you play a song, YouTube's own
        privacy policy applies to that video.
      </p>

      <h2 className={h}>Children</h2>
      <p className={p}>The site and app are suitable for all ages and do not knowingly collect personal information from children.</p>

      <h2 className={h}>Contact</h2>
      <p className={p}>
        Questions or deletion requests: <a className="underline" href="mailto:contact@isaikural.com">contact@isaikural.com</a> or the{' '}
        <a className="underline" href="#/feedback">feedback page</a>.
      </p>
    </article>
  );
};

export default PrivacyPage;
