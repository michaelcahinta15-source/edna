import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((_, i) => (
        <Skeleton key={i} className="h-12" />
      ))}
    </div>
  );
}
