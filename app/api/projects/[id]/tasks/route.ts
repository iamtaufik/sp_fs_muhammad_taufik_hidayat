import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getUserIdByEmail } from '@/lib/server-helper';
import { createTaskSchema } from '@/validations/task.validation';

export const POST = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
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

    const body = await req.json();

    const validFields = createTaskSchema.safeParse(body);

    if (!validFields.success) {
      return Response.json({ status: false, error: validFields.error.errors }, { status: 400 });
    }

    const { title, description, status, assigneeId } = validFields.data;
    const task = await prisma.task.create({
      data: {
        title,
        projectId: id,
        description: description,
        status: status,
        assigneeId: assigneeId || null,
      },
    });

    return Response.json({ status: true, data: task }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ status: false, error: error }, { status: 500 });
  }
};
