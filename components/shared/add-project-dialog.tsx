'use client';
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateProjectSchema, createProjectSchema } from '@/validations/project.validation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProject } from '@/lib/api';
import { toast } from 'sonner';

interface AddProjectDialogProps {
  onDialogOpen: () => void;
}

const AddProjectDialog = ({ onDialogOpen }: AddProjectDialogProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createProjectSchema),
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createProject,
    onSuccess: (data, variables, context) => {
      toast.success(`Project "${data.data.name}" created successfully!`);
      onDialogOpen();

      queryClient.invalidateQueries({
        queryKey: ['projects'],
      });
    },
    onError: (error) => {
      toast.error(`Failed to create project: ${error.message}`);
    },
  });

  const onSubmit = async (data: CreateProjectSchema) => {
    mutation.mutate(data);
  };
  return (
    <DialogContent className="sm:max-w-[425px]">
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogHeader>
          <DialogTitle>Create new project</DialogTitle>
          <DialogDescription>Fill out the form below to create a new project</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 my-4">
          <div className="grid gap-3">
            <Label htmlFor="name">Project Name</Label>
            <Input {...register('name')} placeholder="Your project" />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving' : 'Save changes'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default AddProjectDialog;
