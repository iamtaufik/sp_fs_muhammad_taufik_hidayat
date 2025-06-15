import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getUserIdByEmail } from '@/lib/server-helper';

export const GET = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;

    const session = await auth();
    if (!session?.user || !session.user.email) {
      return Response.json({ status: false, error: 'Unauthorized' }, { status: 401 });
    }

    const [userId, memberships] = await Promise.all([
      getUserIdByEmail(session.user.email),
      prisma.membership.findMany({
        where: { projectId: id },
        select: {
          userId: true,
        },
      }),
    ]);

    const ownerId = await prisma.project.findUnique({
      where: { id },
      select: { ownerId: true },
    });

    const users = await prisma.user.findMany({
      where: {
        id: {
          notIn: memberships.map((m) => m.userId),
        },
      },
      select: {
        id: true,
        email: true,
      },
    });

    const excludeCurrentUser = users.filter((user) => user.id !== userId && user.id !== ownerId?.ownerId);

    return Response.json({ status: true, data: excludeCurrentUser }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ status: false, error: error }, { status: 500 });
  }
};
