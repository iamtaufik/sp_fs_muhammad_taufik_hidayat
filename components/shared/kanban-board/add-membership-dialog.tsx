import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandList } from '@/components/ui/command';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { addMembersToProject, getNonMembersProjectUsers } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CommandItem } from 'cmdk';
import { CheckIcon, PlusIcon, UserPlus } from 'lucide-react';
import React, { FormEvent, useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface AddMembershipDialogProps {
  projectId: string;
}

const AddMembershipDialog = ({ projectId }: AddMembershipDialogProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUserNewMembership, setSelectedUserNewMembership] = useState<{ id: string; email: string }[]>([]);
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
      setIsDialogOpen(false);
      // Optionally, you can show a success message or update the UI
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

  // const handleSubmit = useCallback(
  //   (e: React.FormEvent) => {
  //     e.preventDefault();
  //     if (selectedUserNewMembership.length > 0) {
  //       mutation.mutate({ projectId, users: selectedUserNewMembership });
  //     }
  //   },
  //   [mutation, projectId, selectedUserNewMembership]
  // );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (selectedUserNewMembership.length > 0) {
      mutation.mutate({ projectId, users: selectedUserNewMembership });
    } else {
      toast.error('Please select at least one user to add.');
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="ml-auto">
          <UserPlus className="size-6" />
          <span>Add Members</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite user</DialogTitle>
          <DialogDescription>Invite a user to join this project by search users below.</DialogDescription>
        </DialogHeader>
        <Command className="overflow-hidden rounded-t-none border-t bg-transparent">
          <CommandInput placeholder="Search users..." />
          <ScrollArea className='h-full max-h-44'>
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
        <form onSubmit={handleSubmit}>
          <DialogFooter className="flex items-center border-t p-4 @2xl:justify-between">
            {selectedUserNewMembership.length > 0 ? (
              <div className="flex -space-x-2 overflow-hidden">
                {selectedUserNewMembership.map((user) => (
                  <Avatar key={user.id} className="inline-block border">
                    <AvatarFallback>{user.email[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Select users to add to this project.</p>
            )}
            <Button type="submit" disabled={selectedUserNewMembership.length < 1 || mutation.isPending} size="sm">
              {mutation.isPending ? 'Submiting...' : 'Continue'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMembershipDialog;
