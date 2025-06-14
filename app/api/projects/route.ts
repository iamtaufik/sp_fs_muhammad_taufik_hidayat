import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getUserIdByEmail } from '@/lib/server-helper';
import { createProjectSchema } from '@/validations/project.validation';

export const POST = async (req: Request) => {
  try {
    const body = await req.json();

    const session = await auth();

    if (!session?.user || !session.user.email) {
      return Response.json({ status: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = await getUserIdByEmail(session?.user?.email);

    const validFields = createProjectSchema.safeParse(body);
    if (!validFields.success) {
      return Response.json({ status: false, error: validFields.error.errors }, { status: 400 });
    }

    const { name } = validFields.data;

    const project = await prisma.project.create({
      data: {
        name,
        image: 'https://placehold.co/400x200',
        ownerId: userId,
      },
    });

    return Response.json(
      {
        status: true,
        data: {
          id: project.id,
          name: project.name,
          createdAt: project.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return Response.json({ status: false, error: error }, { status: 500 });
  }
};

export const GET = async (req: Request) => {
  try {
    const session = await auth();
    if (!session?.user || !session.user.email) {
      return Response.json({ status: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = await getUserIdByEmail(session.user.email);

    const projects = await prisma.project.findMany({
      where: {
        OR: [
          {
            ownerId: userId,
          },
          {
            memberships: {
              some: {
                userId: userId,
              },
            },
          },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        image: true,
        createdAt: true,
      },
    });

    return Response.json({ status: true, data: projects }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ status: false, error: error }, { status: 500 });
  }
};
