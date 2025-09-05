import { Analytics } from '@vercel/analytics/react';
import type { Metadata } from 'next';
import { appConfig } from '../config/app';
import './styles/globals.scss';

export const metadata: Metadata = {
  title: appConfig.name,
  description: appConfig.description,
  openGraph: {
    title: appConfig.name,
    description: appConfig.description,
    type: 'website',
    url: appConfig.url,
    images: [
      {
        url: process.env.NEXT_PUBLIC_OG_IMAGE_URL || '/og-image.png',
        width: 800,
        height: 600,
        alt: appConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: appConfig.name,
    description: appConfig.description,
    images: [process.env.NEXT_PUBLIC_TWITTER_IMAGE_URL || '/og-image.png'],
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
      {appConfig.enableAnalytics && <Analytics />}
    </html>
  );
}
