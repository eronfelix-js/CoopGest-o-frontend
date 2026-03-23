import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LoadingSpinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-8 w-8 animate-spin text-primary', className)} />;
}

export function PageLoader() {
  return (
    <div className="flex min-h-[40vh] w-full items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}
