import React from 'react';
import DetailProject from './_components/detail-project';

interface PageProps {
  params: Promise<{ id: string }>;
}

const Page = async ({ params }: PageProps) => {
  const id = (await params).id;
  return <DetailProject id={id} />;
};

export default Page;
