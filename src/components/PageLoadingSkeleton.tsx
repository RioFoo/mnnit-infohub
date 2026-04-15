import { Skeleton } from '@/components/ui/skeleton';

const PageLoadingSkeleton = () => (
  <div className="page-container max-w-2xl animate-in fade-in duration-150">
    <Skeleton className="h-8 w-48 mb-4" />
    <Skeleton className="h-40 w-full rounded-2xl mb-4" />
    <Skeleton className="h-24 w-full rounded-2xl mb-3" />
    <Skeleton className="h-24 w-full rounded-2xl" />
  </div>
);

export default PageLoadingSkeleton;
