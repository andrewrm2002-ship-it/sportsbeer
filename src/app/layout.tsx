import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { SessionWrapper } from '@/components/providers/SessionWrapper';
import { ToastProvider } from '@/components/providers/ToastProvider';
import { Navbar } from '@/components/layout/Navbar';
import { BreakingNewsBanner } from '@/components/layout/BreakingNewsBanner';
import { Footer } from '@/components/layout/Footer';
import { ScrollToTop } from '@/components/layout/ScrollToTop';
import { SkipToContent } from '@/components/ui/SkipToContent';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Brews & Box Scores',
  description: 'Where Sports News Gets a Cold One - AI-powered sports coverage with a humorous twist',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=JSON.parse(localStorage.getItem('theme-preference')||'{}');document.documentElement.dataset.theme=t.state&&t.state.theme||'dark'}catch(e){document.documentElement.dataset.theme='dark'}})()`,
          }}
        />
      </head>
      <body className={`${geistSans.variable} antialiased bg-bg-primary text-text-primary min-h-screen flex flex-col`}>
        <SessionWrapper>
          <ToastProvider>
            <SkipToContent />
            <Navbar />
            <BreakingNewsBanner />
            <ScrollToTop />
            <main id="main-content" className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {children}
            </main>
            <Footer />
          </ToastProvider>
        </SessionWrapper>
      </body>
    </html>
  );
}
