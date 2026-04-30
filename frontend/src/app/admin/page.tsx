import { notFound } from 'next/navigation';

export default function AdminPage() {
  // DEPLOYMENT LOCK: The entire admin UI tree has been physically removed
  // from this chunk to ensure it is not shipped in the Netlify production build.
  return notFound();
}
