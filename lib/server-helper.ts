'use server';

import { prisma } from './prisma';

export const getUserIdByEmail = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!user) {
    throw new Error(`User not found`);
  }

  return user.id;
};
