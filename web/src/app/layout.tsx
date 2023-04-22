import { getServerSession } from 'next-auth';
import { SessionProvider } from './components/providers/SessionProvider';
import { authConfig } from './config/authConfig';
import './globals.css';

export const metadata = {
  title: 'Full Cycle Chat',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authConfig);

  return (
    <html lang='en'>
      <body className='bg-gray-950 text-gray-50'>
        <SessionProvider session={session}>{children}</SessionProvider>
      </body>
    </html>
  );
}
