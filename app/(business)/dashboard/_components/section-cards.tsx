import CardProject from '@/components/shared/card-project';
import { Button } from '@/components/ui/button';
import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useProjects } from '@/hooks/use-projects';
import { deleteProject } from '@/lib/api';
import { DialogTrigger } from '@radix-ui/react-dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'sonner';

interface Project {
  id: string;
  name: string;
  image: string;
  createdAt: string;
}

const SectionCards = ({ projects }: { projects: Project[] }) => {
  // const { deleteProject } = useProjects();
  const { deleteProject: deleteProjectFromContext } = useProjects();
  const [open, setOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const handleDeleteClick = (project: Project) => {
    setSelectedProject(project);
    setOpen(true);
  };

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (projectId: string) => deleteProject(projectId),
    onSuccess: () => {
      setOpen(false);
      setSelectedProject(null);
      toast.success(`Project has been deleted successfully.`);
      queryClient.invalidateQueries({
        queryKey: ['projects'], // Adjust the query key based on your implementation
      }); // Invalidate the projects query to refresh the list
    },
    onError: (error) => {
      toast.error(`Failed to delete project: ${error.message}`);
    },
  });

  const handleConfirmDelete = () => {
    // call onDelete(selectedProject.id)
    mutation.mutate(selectedProject?.id || '');
    setOpen(false);
    setSelectedProject(null);
  };

  return (
    <>
      {projects.map((project) => (
        <CardProject key={project.id} id={project.id} name={project.name} image={project.image} createdAt={project.createdAt} onDelete={() => handleDeleteClick(project)} />
      ))}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>This action cannot be undone. This will permanently delete your project and remove your data from our servers.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
            <DialogTrigger asChild>
              <Button variant="outline">Cancel</Button>
            </DialogTrigger>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SectionCards;
