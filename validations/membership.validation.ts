import { z } from 'zod';

export const addUsersToProjectSchema = z.object({
  users: z.array(
    z.object({
      id: z.string().min(1, { message: 'User ID is required' }),
      email: z.string().email({ message: 'Invalid email format' }),
    })
  ),
});

export type AddUserToProjectSchema = z.infer<typeof addUsersToProjectSchema>;
