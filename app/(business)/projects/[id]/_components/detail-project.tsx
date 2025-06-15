'use client';
import Board from '@/components/shared/kanban-board/board';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getProjectById } from '@/lib/api';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import React from 'react';

interface DetailProjectProps {
  id: string;
}

const DetailProject = ({ id }: DetailProjectProps) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['project', id],
    queryFn: () => getProjectById(id),
    placeholderData: keepPreviousData,
  });

  return (
    <>
      {isLoading && <DetailFallback />}

      {data?.data && <Board project={data?.data} />}
    </>
  );
};

export default DetailProject;

export const DetailFallback = () => {
  return (
    <div className="p-6  bg-background text-foreground">
      <div className="flex justify-between">
        <Skeleton className="h-8 w-60 mb-4" />
        <Skeleton className="h-8 w-30 mb-4" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className={'p-4 rounded-md border shadow-sm '}>
            <Skeleton className="h-6 w-30 relative overflow-hidden" />
            <div className="flex flex-col space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
            <Skeleton className="h-8 w-full" />
          </Card>
        ))}
      </div>
    </div>
  );
};
