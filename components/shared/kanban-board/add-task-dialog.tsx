import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { addTaskToProject, getMembershipsByProjectId } from '@/lib/api';
import { CreateTaskSchema, createTaskSchema } from '@/validations/task.validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckIcon, PlusIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface AddTaskDialogProps {
  projectId: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddTaskDialog({ projectId, isOpen, onOpenChange, status }: AddTaskDialogProps) {
  const [slectedMember, setslectedMember] = useState<{ id: string; email: string } | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      status: status,
    },
  });

  useEffect(() => {
    reset({ status });
  }, [status, reset]);

  const {
    data: memberships,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['membership', projectId],
    queryFn: () => getMembershipsByProjectId(projectId),
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: addTaskToProject,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['project', projectId],
      });
      toast.success(`Successfully added task to ${status.toLocaleLowerCase()}!`);

      onOpenChange(false);
      setslectedMember(null);
    },
    onError: (error) => {
      toast.error(`Failed to add task: ${error.message}`);
    },
  });

  const onSubmit = async (data: CreateTaskSchema) => {
    mutation.mutate({
      projectId: projectId,
      task: {
        ...data,
        assigneeId: slectedMember?.id || undefined,
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="capitalize">Add {status.toLocaleLowerCase().replace('_', ' ')} Tasks</DialogTitle>
          <DialogDescription>Make changes to your profile here. Click save when you&apos;re done.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="title">Title</Label>
              <Input {...register('title')} placeholder="Deploy project" />
              {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
            </div>
            <div className="grid gap-3">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea {...register('description')} placeholder="Description of your task" />
              {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
            </div>
            <div className="grid gap-3">
              <Label htmlFor="assignee">Assignee Member (Optional)</Label>
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
          </div>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">{mutation.isPending ? 'Submitting...' : 'Add Task'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
