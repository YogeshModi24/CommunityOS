import './globals.css';

import { ConfigurationValidationError, validateClientEnv } from '@community-os/config';

try {
  validateClientEnv();
} catch (error) {
  if (error instanceof ConfigurationValidationError) {
    // eslint-disable-next-line no-console
    console.error(error.message);
    throw new Error(
      'CommunityOS Client Configuration Validation Failed. See startup logs for details.'
    );
  }
  throw error;
}

import type { Metadata } from 'next';
import { SessionProvider } from 'next-auth/react';

export const metadata: Metadata = {
  title: 'CommunityOS — Civic Intelligence Platform',
  description:
    'AI-powered civic management platform. Report infrastructure issues, track resolutions, and build better cities together.',
  keywords: 'civic, community, infrastructure, AI, reporting, city management',
  authors: [{ name: 'CommunityOS' }],
  openGraph: {
    title: 'CommunityOS — Civic Intelligence Platform',
    description: 'AI-powered civic issue reporting and resolution platform',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font, @next/next/google-font-display */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#09090B" />
      </head>
      <body className="antialiased bg-bg text-text-primary">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
