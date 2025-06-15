'use client';

import SectionCards from './_components/section-cards';
import { useQuery } from '@tanstack/react-query';
import { getProjects } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

const Page = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  });

  return (
    <main className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 ">
      {isLoading && <FallBack />}
      {data?.data ? <SectionCards projects={data.data} /> : null}
    </main>
  );
};

export default Page;

const FallBack = () => {
  return (
    <>
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} className="pt-0 overflow-hidden">
          <Skeleton className="h-48 w-full relative overflow-hidden" />
          <CardContent>
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </>
  );
};
