import './globals.css';

export const metadata = {
  title: 'Contrario Command Center',
  description: 'Recruiting operations dashboard — Contrario',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,100..900&family=IBM+Plex+Mono:wght@400;500&family=Outfit:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="bg-bg text-fg antialiased min-h-screen"
        style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
