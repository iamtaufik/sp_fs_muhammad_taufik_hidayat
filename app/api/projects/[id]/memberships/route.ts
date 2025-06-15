import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getUserIdByEmail } from '@/lib/server-helper';
import { addUsersToProjectSchema } from '@/validations/membership.validation';

export const POST = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;

    const session = await auth();
    if (!session?.user || !session.user.email) {
      return Response.json({ status: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = await getUserIdByEmail(session.user.email);
    if (!userId) {
      return Response.json({ status: false, error: 'User not found' }, { status: 404 });
    }

    const project = await prisma.project.findUnique({
      where: { id, ownerId: userId },
    });

    if (!project) {
      return Response.json({ status: false, error: 'You are not authorized to add members to this project' }, { status: 401 });
    }

    const body = await req.json();

    const validFields = addUsersToProjectSchema.safeParse(body);

    if (!validFields.success) {
      return Response.json({ status: false, error: validFields.error.errors }, { status: 400 });
    }

    const { users } = validFields.data;

    await prisma.membership.createMany({
      data: users.map((user) => ({
        userId: user.id,
        projectId: id,
      })),
      skipDuplicates: true, // Skip duplicates to avoid errors
    });

    return Response.json({ status: true, data: 'success' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ status: false, error: error }, { status: 500 });
  }
};

export const GET = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;

    const session = await auth();
    if (!session?.user || !session.user.email) {
      return Response.json({ status: false, error: 'Unauthorized' }, { status: 401 });
    }
    const userId = await getUserIdByEmail(session.user.email);
    if (!userId) {
      return Response.json({ status: false, error: 'User not found' }, { status: 404 });
    }

    const memberships = await prisma.membership.findMany({
      where: { projectId: id },
      select: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    return Response.json({ status: true, data: memberships }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ status: false, error: error }, { status: 500 });
  }
};
