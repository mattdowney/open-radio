import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './styles/globals.scss';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Matt Downey — Radio',
  description: 'Lock in, vibe out, be productive.',
  openGraph: {
    title: 'Matt Downey — Radio',
    description: 'Lock in. Vibe out. Get productive.',
    type: 'website',
    url: 'https://radio.mattdowney.com/',
    images: [
      {
        url: 'https://cdn.shopify.com/s/files/1/0614/6565/7577/files/open-graph_d1c5e113-8f9d-41b3-bdbd-4df59c4793d5.jpg?v=1713496521',
        width: 800,
        height: 600,
        alt: 'Radio Image',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Matt Downey — Radio',
    description: 'Lock in. Vibe out. Get productive.',
    images: [
      'https://cdn.shopify.com/s/files/1/0614/6565/7577/files/twitter_74424e7e-a303-493e-87f7-7414932c44bf.jpg?v=1713496521',
    ],
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
