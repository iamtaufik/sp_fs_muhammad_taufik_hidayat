import NextAuth, { User } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { loginSchema } from '@/validations/auth.validation';
import { prisma } from './prisma';
import { comparePasswords } from './utils';

export const { auth, handlers, signIn, signOut } = NextAuth({
  pages: {
    newUser: '/register',
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24, // 1 day
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials, request) {
        const validatedFileds = loginSchema.safeParse(credentials);

        if (!validatedFileds.success) {
          return null;
        }

        const { email, password } = validatedFileds.data;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          return null;
        }

        const isValidPassword = await comparePasswords(password, user.password);

        if (!isValidPassword) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
        } as User;
      },
    }),
  ],
  callbacks: {
    authorized(params) {
      const isLoggedIn = !!params.auth?.user;
      const protectedRoutes = ['/dashboard', '/projects'];
      const currentPath = params.request.nextUrl.pathname;

      if (protectedRoutes.includes(currentPath) && !isLoggedIn) {
        return Response.redirect(new URL('/login', params.request.nextUrl));
      }

      return true;
    },
  },
});
