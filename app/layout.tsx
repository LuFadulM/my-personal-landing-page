import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Contrario Dashboard',
  description: 'Operations dashboard for Contrario',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
