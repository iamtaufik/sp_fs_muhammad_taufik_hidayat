import NextAuth, { User } from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { loginSchema } from '@/validations/auth.validation';
import { prisma } from './prisma';
import { comparePasswords } from './utils';

export const { auth, handlers, signIn, signOut } = NextAuth({
  pages: {
    newUser: '/register',
    signIn: '/login',
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
          id: user.id, // Example ID, replace with actual user ID logic
          email: user.email,
        } as User; // Ensure the returned object matches the User type
      },
    }),
  ],
});
