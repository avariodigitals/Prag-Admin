export const dynamic = 'force-dynamic';

import { getSession } from '@/lib/auth';
import CategoryVisibilityClient from './CategoryVisibilityClient';

export default async function CategoryVisibilityPage() {
  const session = await getSession();
  return <CategoryVisibilityClient token={session?.token ?? ''} />;
}
