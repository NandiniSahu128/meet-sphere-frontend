import './globals.css';
import { AuthProvider } from '../contexts/AuthContext';

export const metadata = {
  title: 'MeetSphere - Video Conferences',
  description: 'Connect with your loved ones anywhere with MeetSphere.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
