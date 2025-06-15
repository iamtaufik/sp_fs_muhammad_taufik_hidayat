import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getUserIdByEmail } from '@/lib/server-helper';
import { $Enums } from '@prisma/client';

export const PUT = async (req: Request, { params }: { params: Promise<{ id: string; taskId: string }> }) => {
  try {
    const { id: projectId, taskId } = await params;
    const session = await auth();
    if (!session?.user || !session.user.email) {
      return Response.json({ status: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = await getUserIdByEmail(session.user.email);

    const body = await req.json();
    const status = body.status as $Enums.TaskStatus;
    // check if the user is a member of the project but the owner isn't the member
    const project = await prisma.project.findUnique({
      where: { id: projectId, ownerId: userId },
    });

    if (project) {
      await prisma.task.update({
        where: { id: taskId, projectId: projectId },
        data: { status: status },
      });
    } else {
      const membership = await prisma.membership.findFirst({
        where: { projectId: projectId, userId: userId },
      });

      if (!membership) {
        return Response.json({ status: false, error: 'You are not a member of this project' }, { status: 403 });
      }

      await prisma.task.update({
        where: { id: taskId, projectId: projectId },
        data: { status: status },
      });
    }

    return Response.json({ status: true, data: 'success' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ status: false, error: error }, { status: 500 });
  }
};
