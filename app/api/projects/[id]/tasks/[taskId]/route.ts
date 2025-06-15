import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getUserIdByEmail } from '@/lib/server-helper';
import { updateTaskSchema } from '@/validations/task.validation';

export const GET = async (req: Request, { params }: { params: Promise<{ id: string; taskId: string }> }) => {
  try {
    const { id: projectId, taskId } = await params;

    const session = await auth();
    if (!session?.user || !session.user.email) {
      return Response.json({ status: false, error: 'Unauthorized' }, { status: 401 });
    }

    const task = await prisma.task.findUnique({
      where: {
        id: taskId,
        projectId: projectId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        assignee: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!task) {
      return Response.json({ status: false, error: 'Task not found' }, { status: 404 });
    }

    return Response.json(
      {
        status: true,
        data: task,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return Response.json({ status: false, error: error }, { status: 500 });
  }
};

export const PUT = async (req: Request, { params }: { params: Promise<{ id: string; taskId: string }> }) => {
  try {
    const { id: projectId, taskId } = await params;

    const session = await auth();
    if (!session?.user || !session.user.email) {
      return Response.json({ status: false, error: 'Unauthorized' }, { status: 401 });
    }

    const [userId, task] = await Promise.all([
      getUserIdByEmail(session.user.email),
      prisma.task.findUnique({
        where: {
          id: taskId,
          projectId: projectId,
        },
      }),
    ]);

    if (!task) {
      return Response.json({ status: false, error: 'Task not found' }, { status: 404 });
    }

    const isOwner = await prisma.project.findUnique({
      where: {
        id: projectId,
        ownerId: userId,
      },
    });

    if (!isOwner) {
      return Response.json({ status: false, error: 'You are not the owner of this project or task. You cannot update it.' }, { status: 403 });
    }

    const body = await req.json();
    const validFields = updateTaskSchema.safeParse(body);

    if (!validFields.success) {
      return Response.json({ status: false, error: validFields.error.errors }, { status: 400 });
    }

    const { id, title, description, status, assigneeId } = validFields.data;

    await prisma.task.update({
      where: {
        id: id,
        projectId: projectId,
      },
      data: {
        title: title,
        description: description,
        status: status,
        assigneeId: assigneeId || null,
      },
    });

    return Response.json({ status: true, data: 'success' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ status: false, error: error }, { status: 500 });
  }
};

export const DELETE = async (req: Request, { params }: { params: Promise<{ id: string; taskId: string }> }) => {
  try {
    const { id: projectId, taskId } = await params;

    const session = await auth();
    if (!session?.user || !session.user.email) {
      return Response.json({ status: false, error: 'Unauthorized' }, { status: 401 });
    }

    const [userId, task] = await Promise.all([
      getUserIdByEmail(session.user.email),
      prisma.task.findUnique({
        where: {
          id: taskId,
          projectId: projectId,
        },
      }),
    ]);

    if (!task) {
      return Response.json({ status: false, error: 'Task not found' }, { status: 404 });
    }

    const isOwner = await prisma.project.findUnique({
      where: {
        id: projectId,
        ownerId: userId,
      },
    });

    if (!isOwner) {
      return Response.json({ status: false, error: 'You are not the owner of this project or task. You cannot delete it.' }, { status: 403 });
    }

    await prisma.task.delete({
      where: {
        id: taskId,
        projectId: projectId,
      },
    });

    return Response.json({ status: true, data: 'success' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ status: false, error: error }, { status: 500 });
  }
};
