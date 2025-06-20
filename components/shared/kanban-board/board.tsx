'use client';

import { DndContext, closestCenter, DragEndEvent, DragOverlay } from '@dnd-kit/core';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Settings } from 'lucide-react';
import DroppableColumn from './droppable-column';
import DraggableCard from './draggable-card';
import TaskCard from './task-card';
import { AddTaskDialog } from './add-task-dialog';
import { $Enums } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import { updateTaskStatus } from '@/lib/api';
import { toast } from 'sonner';
import Link from 'next/link';
import { useTaskModal } from '@/hooks/use-task-modal';

type Task = {
  id: string;
  title: string;
  description: string;
  status: $Enums.TaskStatus;
  assignee?: User;
};

type User = {
  id: string;
  email: string;
};

const statuses = ['todo', 'in-progress', 'done'] as const;

interface BoardProps {
  project: {
    id: string;
    name: string;
    image: string;
    createdAt: string;
    ownerId: string;
    tasks: Task[];
    memberships: {
      userId: string;
      user: {
        id: string;
        email: string;
      };
    }[];
  };
}

export default function Board({ project }: BoardProps) {
  const { onOpen } = useTaskModal();
  const [tasks, setTasks] = useState<Task[]>(project.tasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isDialogAddTaskOpen, setIsDialogAddTaskOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'TODO' | 'IN_PROGRESS' | 'DONE'>('TODO');

  const mutation = useMutation({
    mutationFn: updateTaskStatus,
    onError: (error) => {
      toast.error('Failed to update task: ', { description: error.message });
    },
  });

  useEffect(() => {
    setTasks(project.tasks);
  }, [project.tasks]);

  let toastId: string | number;
  useEffect(() => {
    if (mutation.isPending) {
      toastId = toast.loading('Please wait updating this changes');
    } else {
      toast.dismiss(toastId);
    }
    if (mutation.isSuccess) {
      toast.success('Updated task successfully!', { id: toastId });
    }
  }, [mutation.isPending]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over || !active) return;
    const taskId = active.id;
    const newStatus = String(over.id).toUpperCase().replace('-', '_') as Task['status'];
    console.log('Drag End:', { taskId, newStatus });

    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task)));
    mutation.mutate({
      projectId: project.id,
      task: {
        id: taskId.toString(),
        status: newStatus,
      },
    });
  };

  return (
    <div className="p-6 min-h-screen bg-background text-foreground">
      <div className="flex items-center mb-6 justify-between">
        <h1 className="text-3xl font-bold">{project.name}</h1>
        <Link href={`/projects/${project.id}/settings`} className="flex bg-primary py-2 px-3 rounded-md">
          <Settings />
          <span className="ml-2">Settings</span>
        </Link>
      </div>
      <DndContext
        id="kanban-board-project"
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        onDragStart={(event) => {
          const taskId = event.active.id;
          const task = project.tasks.find((t) => t.id === taskId);
          setActiveTask(task || null);
        }}
      >
        <div className="overflow-x-auto w-full ">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {statuses.map((status) => (
              <DroppableColumn key={status} id={status}>
                <Card className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="capitalize">{status.replace('-', ' ')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 overflow-y-auto min-h-max">
                    {tasks
                      .filter((task) => task.status.toLowerCase().replace('_', '-') === status)
                      .map((task) => (
                        <DraggableCard key={task.id} id={task.id}>
                          <TaskCard
                            task={task}
                            onClick={() => {
                              onOpen({
                                taskId: task.id,
                                projectId: project.id,
                              });
                            }}
                          />
                        </DraggableCard>
                      ))}
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        // setSelectedTask(null);
                        setIsDialogAddTaskOpen(true);
                        setSelectedStatus(status.toUpperCase().replace('-', '_') as 'TODO' | 'IN_PROGRESS' | 'DONE');
                      }}
                    >
                      <Plus className="mr-2" />
                      Add Task
                    </Button>
                  </CardFooter>
                </Card>
              </DroppableColumn>
            ))}
          </div>
          <AddTaskDialog projectId={project.id} status={selectedStatus} isOpen={isDialogAddTaskOpen} onOpenChange={setIsDialogAddTaskOpen} />
        </div>

        <DragOverlay>{activeTask ? <TaskCard task={activeTask} /> : null}</DragOverlay>
      </DndContext>
    </div>
  );
}
