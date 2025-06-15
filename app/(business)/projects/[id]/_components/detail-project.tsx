'use client';
import Board from '@/components/shared/kanban-board/board';
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

  console.log(data?.data);
  return (
    <>
      {isLoading && <div>Loading...</div>}

      {data?.data && <Board project={data?.data} />}
    </>
  );
};

export default DetailProject;
