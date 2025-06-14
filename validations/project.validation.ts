import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(3, { message: 'Project name must be at least 3 characters long' }).max(16, { message: 'Project name must be at most 16 characters long' }),
});

export type CreateProjectSchema = z.infer<typeof createProjectSchema>;
