'use client';
import './globals.css';
import { Providers } from './providers';
import { SecurityManager } from './utils/security';
import { useEffect } from 'react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Handle unhandled promise rejections globally
      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        console.warn('Unhandled promise rejection:', event.reason);
        event.preventDefault();
      };

      window.addEventListener('unhandledrejection', handleUnhandledRejection);

      try {
        SecurityManager.getInstance();
      } catch (error) {
        console.warn('Failed to initialize security manager:', error);
      }

      return () => {
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      };
    }
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Monad Profile Card</title>
        <link rel="icon" href="/monad_logo.ico" />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}