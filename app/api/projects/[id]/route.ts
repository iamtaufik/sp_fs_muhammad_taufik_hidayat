import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getUserIdByEmail } from '@/lib/server-helper';

export const DELETE = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;

    const session = await auth();
    if (!session?.user || !session.user.email) {
      return Response.json({ status: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = await getUserIdByEmail(session.user.email);

    const project = await prisma.project.findUnique({
      where: { id, ownerId: userId },
    });

    if (!project) {
      return Response.json({ status: false, error: 'Project not found or unauthorized' }, { status: 404 });
    }

    await prisma.project.delete({
      where: { id },
    });

    return Response.json({ status: true, data: 'success' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ status: false, error: error }, { status: 500 });
  }
};
