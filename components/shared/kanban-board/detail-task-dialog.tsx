import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { deleteProject, deleteTask, getMembershipsByProjectId, getTaskById, updateTask } from '@/lib/api';
import { UpdateTaskSchema, updateTaskSchema } from '@/validations/task.validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { DialogTrigger } from '@radix-ui/react-dialog';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckIcon, PlusIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

type Task = {
  id: string;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  assignee?: {
    id: string;
    email: string;
  };
};

interface DetailTaskDialogProps {
  projectId: string;
  task: Task;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const DetailTaskDialog = ({ task, projectId, isOpen, onOpenChange }: DetailTaskDialogProps) => {
  const [slectedMember, setslectedMember] = useState<{ id: string; email: string } | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(updateTaskSchema),
    defaultValues: {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      assigneeId: task.assignee ? task.assignee.id : undefined,
    },
  });

  const {
    data: memberships,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['membership', projectId],
    queryFn: () => getMembershipsByProjectId(projectId),
  });

  const { data } = useQuery({
    queryKey: ['tasks', task.id],
    queryFn: () => getTaskById(projectId, task.id),
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: updateTask,
    onSuccess: () => {
      toast.success('Task saved successfully!');
      onOpenChange(false);
      setslectedMember(null);

      queryClient.invalidateQueries({
        queryKey: ['project', projectId],
      });

      queryClient.invalidateQueries({
        queryKey: ['membership', projectId],
      });

      queryClient.invalidateQueries({
        queryKey: ['task', task.id],
      });
    },
    onError: (error) => {
      toast.error(`Failed to save task: ${error.message}`);
    },
  });

  useEffect(() => {
    if (data?.data) {
      reset({
        id: data?.data.id,
        title: data?.data.title,
        description: data?.data.description,
        status: data?.data.status,
        assigneeId: data?.data.assignee ? data?.data.assignee.id : undefined,
      });
      if (data.data.assignee) {
        setslectedMember({ id: data.data.assignee.id, email: data.data.assignee.email });
      }
    } else {
      setslectedMember(null);
    }
  }, [data]);

  const onSubmit = async (data: UpdateTaskSchema) => {
    mutation.mutate({
      projectId: projectId,
      taskId: task.id,
      task: {
        ...data,
        assigneeId: slectedMember?.id || undefined,
      },
    });
  };

  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      toast.success('Task deleted successfully!');
      onOpenChange(false);
      queryClient.invalidateQueries({
        queryKey: ['project', projectId],
      });

      queryClient.invalidateQueries({
        queryKey: ['membership', projectId],
      });

      queryClient.invalidateQueries({
        queryKey: ['task', task.id],
      });
    },
    onError: (error) => {
      toast.error(`Failed to delete task: ${error.message}`);
    },
  });

  const onDelete = async (projectId: string, taskId: string) => {
    deleteTaskMutation.mutate({
      projectId: projectId,
      taskId: taskId,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Detail Task</DialogTitle>
            <DialogDescription>Here you can view and manage the details of the task.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <div className="grid gap-3">
                <Label htmlFor="title">Title</Label>
                <Input {...register('title')} placeholder="Deploy project" />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="description">Description</Label>
                <Textarea {...register('description')} placeholder="Add your description project here" />
              </div>
            </div>
          </div>
          <div className="grid gap-3 mt-2">
            <Label htmlFor="assignee">Assignee Member (Optional)</Label>
            <Label className="text-sm text-muted-foreground">Select a member to assign this task.</Label>
            <Command className="overflow-hidden rounded-t-none border-t bg-transparent">
              <CommandInput placeholder="Search users..." />
              <ScrollArea className="h-full max-h-32">
                <CommandList>
                  {isLoading ? <CommandEmpty>Loading...</CommandEmpty> : null}
                  {error ? <CommandEmpty>Error fetching memberships</CommandEmpty> : null}
                  {memberships?.data.length === 0 ? (
                    <CommandEmpty>Nothing member to add...</CommandEmpty>
                  ) : (
                    <CommandGroup>
                      {memberships?.data.map((user) => {
                        const isUserSelected = slectedMember?.id === user.user.id;

                        return (
                          <CommandItem
                            key={user.user.id}
                            data-active={isUserSelected}
                            className={`flex items-center p-2 ${isUserSelected ? 'bg-muted' : ''}`}
                            onSelect={() => setslectedMember({ id: user.user.id, email: user.user.email })}
                          >
                            <Avatar className="border h-8 w-8">
                              <AvatarFallback>{user.user.email[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="ml-3">
                              <p className="text-sm leading-none font-medium">{user.user.email}</p>
                            </div>
                            {isUserSelected ? <CheckIcon className="text-primary ml-auto flex size-4" /> : <PlusIcon className="text-muted-foreground ml-auto flex size-4" />}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  )}
                </CommandList>
              </ScrollArea>
            </Command>
          </div>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive">Delete</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Delete Task</DialogTitle>
                  <DialogDescription>Are you sure you want to delete this task? This action cannot be undone.</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button variant="destructive" disabled={deleteTaskMutation.isPending} type="button" onClick={() => onDelete(projectId, task.id)}>
                    {deleteTaskMutation.isPending ? 'Deleting task' : 'Delete Task'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Submitting...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DetailTaskDialog;
