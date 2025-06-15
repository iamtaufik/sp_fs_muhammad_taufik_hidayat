import { z } from 'zod';
import { $Enums } from '@prisma/client';

export const createTaskSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  description: z.string().max(200, { message: 'Description too long' }).optional(),
  status: z.nativeEnum($Enums.TaskStatus, {
    message: 'Invalid status',
  }),
  assigneeId: z.string().optional(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  id: z.string().min(1, { message: 'Task ID is required' }),
});

export const updateTaskStatusSchema = z.object({
  id: z.string().min(1, { message: 'Task ID is required' }),
  status: z.nativeEnum($Enums.TaskStatus, {
    message: 'Invalid status',
  }),
});

export type UpdateTaskStatusSchema = z.infer<typeof updateTaskStatusSchema>;
export type UpdateTaskSchema = z.infer<typeof updateTaskSchema>;
export type CreateTaskSchema = z.infer<typeof createTaskSchema>;
