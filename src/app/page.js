import dynamic from 'next/dynamic';

// Avoid running AppKit hooks during static prerender on the server.
// We render the full UI only on the client.
const HomeClient = dynamic(() => import('./HomeClient'), { ssr: false });

export default function Home() {
  return <HomeClient />;
}
