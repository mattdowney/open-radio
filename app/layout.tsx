import { Analytics } from '@vercel/analytics/react';
import type { Metadata } from 'next';
import { getAppConfig } from '../config/app';
import { getConfig } from '../config/configReader';
import { ThemeProvider } from './contexts/ThemeContext';
import { VisualizerProvider } from './contexts/VisualizerContext';
import './styles/globals.scss';

export async function generateMetadata(): Promise<Metadata> {
  const [appConfig, config] = await Promise.all([getAppConfig(), getConfig()]);

  return {
    title: appConfig.name,
    description: appConfig.description,
    openGraph: {
      title: appConfig.name,
      description: appConfig.description,
      type: 'website',
      url: appConfig.url,
      images: [
        {
          url: config.social.ogImageUrl,
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
      images: [config.social.twitterImageUrl],
    },
  };
}

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const appConfig = await getAppConfig();

  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Silkscreen:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider>
          <VisualizerProvider>{children}</VisualizerProvider>
        </ThemeProvider>
      </body>
      {appConfig.enableAnalytics && <Analytics />}
    </html>
  );
}
