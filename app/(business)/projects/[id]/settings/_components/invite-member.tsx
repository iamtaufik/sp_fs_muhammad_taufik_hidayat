'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandList } from '@/components/ui/command';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { addMembersToProject, deleteProject, getNonMembersProjectUsers } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CommandItem } from 'cmdk';
import { CheckIcon, PlusIcon, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { FormEvent, useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface InviteMemberProps {
  projectId: string;
}

const InviteMember = ({ projectId }: InviteMemberProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUserNewMembership, setSelectedUserNewMembership] = useState<{ id: string; email: string }[]>([]);
  const router = useRouter();

  const handleSelectUser = useCallback((user: { id: string; email: string }) => {
    setSelectedUserNewMembership((prevSelectedUsers) => {
      const isSelected = prevSelectedUsers.some((u) => u.id === user.id);
      if (isSelected) {
        return prevSelectedUsers.filter((selectedUser) => selectedUser.id !== user.id);
      } else {
        return [...prevSelectedUsers, { ...user }];
      }
    });
  }, []);

  const { data: users, isLoading } = useQuery({
    queryKey: ['non-membership', projectId],
    queryFn: () => getNonMembersProjectUsers(projectId),
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: addMembersToProject,
    onSuccess: (data) => {
      toast.success(`Successfully added ${selectedUserNewMembership.length} members to the project!`);
      setSelectedUserNewMembership([]);

      queryClient.invalidateQueries({
        queryKey: ['non-membership', projectId],
      });

      queryClient.invalidateQueries({
        queryKey: ['membership', projectId],
      });
    },
    onError: (error) => {
      toast.error(`Failed to add members: ${error.message}`);
    },
  });

  const mutationDelete = useMutation({
    mutationFn: (projectId: string) => deleteProject(projectId),
    onSuccess: () => {
      toast.success(`Project has been deleted successfully.`);
      queryClient.invalidateQueries({
        queryKey: ['projects'],
      });
      setIsDialogOpen(false);
      router.push('/dashboard');
    },
    onError: (error) => {
      toast.error(`Failed to delete project: ${error.message}`);
      setIsDialogOpen(false);
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (selectedUserNewMembership.length > 0) {
      mutation.mutate({ projectId, users: selectedUserNewMembership });
    } else {
      toast.error('Please select at least one user to add.');
    }
  };

  const handleDelete = () => {
    mutationDelete.mutate(projectId);
  };

  return (
    <main className="w-full">
      <h1 className="text-2xl">Setting</h1>
      <p className="text-muted-foreground text-base">Setting page for the project. Here you can manage project details, invite members, and configure settings.</p>
      <Separator className="my-4" />
      <form onSubmit={handleSubmit} className="max-w-xl">
        <div className="grid gap-3">
          <Label>
            <div className="flex items-center gap-2">
              <UserPlus className="size-4" />
              <span>Invite Members</span>
            </div>
          </Label>
          <p className="text-sm text-muted-foreground mb-2">Invite members to your project by searching for their email addresses. You can add multiple members at once.</p>
          <Command className="overflow-hidden rounded-t-none border-t bg-transparent ">
            <CommandInput placeholder="Search users..." />
            <ScrollArea className="h-full max-h-44">
              <CommandList>
                {isLoading ? <CommandEmpty>Loading...</CommandEmpty> : null}
                {users?.data.length === 0 ? (
                  <CommandEmpty>Nothing user to add...</CommandEmpty>
                ) : (
                  <CommandGroup>
                    {users?.data.map((user) => {
                      const isUserSelected = selectedUserNewMembership.some((u) => u.id === user.id);

                      return (
                        <CommandItem key={user.id} data-active={isUserSelected} className={cn('flex items-center p-2', isUserSelected && 'bg-muted')} onSelect={() => handleSelectUser(user)}>
                          <Avatar className="border h-8 w-8">
                            <AvatarFallback>{user.email[0].toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="ml-3">
                            <p className="text-sm leading-none font-medium">{user.email}</p>
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
          <div className="flex">
            <Button className="ml-auto" disabled={mutation.isPending}>
              <UserPlus className="size-4" />
              <span>{mutation.isPending ? 'Adding member...' : 'Add Members'}</span>
            </Button>
          </div>
        </div>
      </form>
      <Separator className="my-4" />
      <div className="max-w-xl">
        <h2 className="text-lg font-semibold mb-2">Delete Project</h2>
        <p className="text-sm text-destructive mb-4">This action is irreversible. Please proceed with caution.</p>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive">Delete Project</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Project</DialogTitle>
              <DialogDescription>Are you sure you want to delete this project? This action cannot be undone.</DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex items-center border-t p-4 @2xl:justify-between">
              <Button variant="destructive" onClick={handleDelete} disabled={mutationDelete.isPending}>
                {mutationDelete.isPending ? 'Deleteing...' : 'Delete'}
              </Button>
              <Button variant="outline">Cancel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
};

export default InviteMember;
