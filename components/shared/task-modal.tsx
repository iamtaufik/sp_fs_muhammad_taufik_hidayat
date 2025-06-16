'use client';
import { useTaskModal } from '@/hooks/use-task-modal';
import React, { useEffect, useState } from 'react';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { CheckIcon, PlusIcon } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteTask, getMembershipsByProjectId, getTaskById, updateTask } from '@/lib/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UpdateTaskSchema, updateTaskSchema } from '@/validations/task.validation';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { Skeleton } from '../ui/skeleton';

const TaskModal = () => {
  const { taskId, projectId, isOpen, onClose, onOpen } = useTaskModal();
  const [slectedMember, setslectedMember] = useState<{ id: string; email: string } | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(updateTaskSchema),
  });

  const {
    data: memberships,
    isLoading: isLoadingMember,
    error,
  } = useQuery({
    queryKey: ['membership', projectId],
    queryFn: () => getMembershipsByProjectId(projectId!),
  });

  const { data: task, isLoading: isLoadingTask } = useQuery({
    queryKey: ['tasks', taskId],
    queryFn: () => getTaskById(projectId!, taskId!),
  });

  useEffect(() => {
    if (task?.data) {
      reset({
        id: task?.data.id,
        title: task?.data.title,
        description: task?.data.description,
        status: task?.data.status,
        assigneeId: task?.data.assignee ? task?.data.assignee.id : undefined,
      });
      if (task.data.assignee) {
        setslectedMember({ id: task.data.assignee.id, email: task.data.assignee.email });
      }
    } else {
      setslectedMember(null);
    }
  }, [task]);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: updateTask,
    onSuccess: () => {
      toast.success('Task saved successfully!');
      setslectedMember(null);

      queryClient.invalidateQueries({
        queryKey: ['project', projectId],
      });

      queryClient.invalidateQueries({
        queryKey: ['membership', projectId],
      });

      queryClient.invalidateQueries({
        queryKey: ['task', taskId],
      });

      onClose();
    },
    onError: (error) => {
      toast.error(`Failed to save task: ${error.message}`);
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      toast.success('Task deleted successfully!');
      onClose();
      queryClient.invalidateQueries({
        queryKey: ['project', projectId],
      });

      queryClient.invalidateQueries({
        queryKey: ['membership', projectId],
      });

      queryClient.invalidateQueries({
        queryKey: ['task', taskId],
      });
    },
    onError: (error) => {
      toast.error(`Failed to delete task: ${error.message}`);
    },
  });

  const onSubmit = async (data: UpdateTaskSchema) => {
    if (projectId && taskId) {
      mutation.mutate({
        projectId: projectId,
        taskId: taskId,
        task: {
          ...data,
          assigneeId: slectedMember?.id || undefined,
        },
      });
    }
  };

  const onDelete = async () => {
    if (projectId && taskId) {
      deleteTaskMutation.mutate({
        projectId: projectId,
        taskId: taskId,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Detail Task</DialogTitle>
            <DialogDescription>Here you can view and manage the details of the task.</DialogDescription>
          </DialogHeader>
          {isLoadingMember || isLoadingTask ? (
            <DialogFallback />
          ) : (
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
              <div className="grid gap-3">
                <Label htmlFor="assignee">Assignee Member (Optional)</Label>
                <Label className="text-sm text-muted-foreground">Select a member to assign this task.</Label>
                <Command className="overflow-hidden rounded-t-none border-t bg-transparent">
                  <CommandInput placeholder="Search users..." />
                  <ScrollArea className="h-full max-h-32">
                    <CommandList>
                      {error ? <CommandEmpty>Error fetching memberships</CommandEmpty> : null}
                      {!memberships?.data ? (
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
            </div>
          )}

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
                  <Button variant="destructive" disabled={deleteTaskMutation.isPending} type="button" onClick={() => onDelete()}>
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

export default TaskModal;

const DialogFallback = () => {
  return (
    <div className="grid gap-4">
      <div className="grid gap-3">
        <div className="grid gap-3">
          <Skeleton className="w-16 h-4" />
          <Skeleton className="w-full h-8" />
        </div>
        <div className="grid gap-3">
          <Skeleton className="w-16 h-4" />
          <Skeleton className="w-full h-8" />
        </div>
        <div className="grid gap-3">
          <Skeleton className="w-16 h-4" />
          <Skeleton className="w-full h-8" />
          <Skeleton className="w-full h-8" />
          <Skeleton className="w-full h-8" />
          <Skeleton className="w-full h-8" />
        </div>
      </div>
    </div>
  );
};
