'use client';

import SectionCards from './_components/section-cards';
import { useQuery } from '@tanstack/react-query';
import { getProjects } from '@/lib/api';

const Page = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  });

  return (
    <main className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 ">
      {isLoading && <p>Loading projects...</p>}
      {data?.data ? <SectionCards projects={data.data} /> : null}
    </main>
  );
};

export default Page;
