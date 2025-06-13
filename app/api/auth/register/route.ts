import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/utils';
import { registerSchema } from '@/validations/auth.validation';

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    const validFields = registerSchema.safeParse(body);
    if (!validFields.success) {
      return Response.json({ status: false, error: validFields.error }, { status: 400 });
    }

    const { email, password } = validFields.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return Response.json({ status: false, error: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    return Response.json({ status: true, data: 'success' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ status: false, error: error }, { status: 500 });
  }
};
