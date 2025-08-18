
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import JoinForm from './JoinForm';
import { AuthProvider } from '@/hooks/use-auth';

export default function JoinPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4">Loading...</p>
      </div>
    }>
        <JoinForm />
    </Suspense>
  );
}
