import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getUserIdByEmail } from '@/lib/server-helper';

export const GET = async (req: Request) => {
  try {
    const session = await auth();

    if (!session?.user || !session.user.email) {
      return Response.json({ status: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = await getUserIdByEmail(session.user.email);

    const projects = await prisma.project.findMany({
      where: {
        ownerId: userId,
      },
      select: {
        id: true,
        name: true,
        tasks: {
          select: {
            status: true,
          },
        },
      },
    });

    const chartData = projects.map((project) => {
      const counts = {
        TODO: 0,
        IN_PROGRESS: 0,
        DONE: 0,
      };

      for (const task of project.tasks) {
        counts[task.status]++;
      }

      return {
        project: project.name,
        todo: counts.TODO,
        in_progress: counts.IN_PROGRESS,
        done: counts.DONE,
      };
    });

    return Response.json({ status: true, data: chartData }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ status: false, error: error }, { status: 500 });
  }
};
