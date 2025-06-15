import React from 'react';
import InviteMember from './_components/invite-member';

interface PageProps {
  params: Promise<{ id: string }>;
}

const Page = async ({ params }: PageProps) => {
  const projectId = (await params).id;

  return <InviteMember projectId={projectId} />;
};

export default Page;
