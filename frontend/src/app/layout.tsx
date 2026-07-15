import type { Metadata } from 'next';
import { WalletProvider } from '@/components/WalletProvider';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Borealis Engine',
  description: 'Sustainable open-source funding powered by Stellar',
  viewport: 'width=device-width, initial-scale=1',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script src="https://freighter.app/freighter.js"></script>
      </head>
      <body className="bg-slate-950 text-slate-50">
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
