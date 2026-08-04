import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' });

export const metadata: Metadata = {
  title: 'PRAG Admin',
  description: 'PRAG Control Center — Developed by Avario Digitals',
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '4567x4567', type: 'image/png' },
    ],
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} font-['Space_Grotesk'] antialiased bg-gray-50`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
