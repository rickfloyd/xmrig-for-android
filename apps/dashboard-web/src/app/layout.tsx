import './globals.css';
import Navigation from '@/components/Navigation';

export const metadata = {
  title: 'XMRig for Android - Dashboard',
  description: 'Web dashboard for XMRig Android mining application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-gray-900 font-sans">
        <div className="flex flex-col min-h-screen">
          <Navigation />
          <main className="flex-1 container mx-auto px-4 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}