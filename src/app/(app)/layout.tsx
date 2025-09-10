import { Suspense } from 'react';
import ClientLayout from '@/components/ClientLayout';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClientLayout>{children}</ClientLayout>
    </Suspense>
  );
}