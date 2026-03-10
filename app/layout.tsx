import type { Metadata } from 'next';
import { getMetadataBase } from '../seo/metadata';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: 'CRED KIT',
  description: 'Cyberpunk RED Digital Kit'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
