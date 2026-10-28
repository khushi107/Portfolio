import type { Metadata, Viewport } from 'next';

// Fonts are self-hosted through Fontsource, so no request goes to Google at runtime.
import '@fontsource/familjen-grotesk/500.css';
import '@fontsource/familjen-grotesk/600.css';
import '@fontsource/familjen-grotesk/700.css';
import '@fontsource/geist-sans/400.css';
import '@fontsource/geist-sans/500.css';
import '@fontsource/geist-mono/400.css';
import '@fontsource/geist-mono/500.css';
import '@fontsource/homemade-apple/400.css';

import '@/styles/tokens.css';
import '@/styles/base.css';
import '@/styles/intro.css';
import '@/styles/sections.css';
import '@/styles/skills.css';

import { profile } from '@/data/profile';

export const metadata: Metadata = {
  title: profile.fullName,
  description: profile.metaDescription,
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // `intro` locks scrolling and `hold` keeps the page lowered until the intro curtain lifts.
  return (
    <html lang="en" className="intro hold" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
