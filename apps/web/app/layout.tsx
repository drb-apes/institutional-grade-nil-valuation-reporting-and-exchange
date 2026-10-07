import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NIL Exchange | Institutional Dashboard',
  description: 'Institutional-grade NIL valuation reporting and exchange platform.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
