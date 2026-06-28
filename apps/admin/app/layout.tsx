import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CommunityOS Admin Dashboard',
  description: 'Scaffolded Admin Dashboard for CommunityOS',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
