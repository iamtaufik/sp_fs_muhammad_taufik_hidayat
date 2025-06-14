'use client';

import { DndContext, closestCenter, DragEndEvent, useDraggable, useDroppable, DragOverlay } from '@dnd-kit/core';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { PencilIcon } from 'lucide-react';

type Task = {
  id: number;
  title: string;
  status: 'todo' | 'in-progress' | 'done';
  assignee?: User;
};

type User = {
  id: number;
  name: string;
  avatarUrl?: string;
};

const statuses = ['todo', 'in-progress', 'done'] as const;

const users: User[] = [
  { id: 1, name: 'Alice Anderson' },
  { id: 2, name: 'Bob Brown' },
  { id: 3, name: 'Charlie Cruz' },
];

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: 'Set up project', status: 'todo' },
    { id: 2, title: 'Build Kanban UI', status: 'in-progress' },
    { id: 3, title: 'Deploy to Vercel', status: 'done' },
  ]);

  const [newTask, setNewTask] = useState('');
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks([...tasks, { id: Date.now(), title: newTask.trim(), status: 'todo' }]);
    setNewTask('');
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over || !active) return;
    const taskId = Number(active.id);
    const newStatus = over.id as Task['status'];

    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task)));
  };

  const openAssignDialog = (task: Task) => {
    setSelectedTask(task);
    setIsDialogOpen(true);
  };

  return (
    <div className="p-6 min-h-screen bg-background text-foreground">
      <h1 className="text-3xl font-bold mb-6">Kanban Board</h1>
      <div className="flex items-center gap-2 mb-6">
        <Input placeholder="Add new task..." value={newTask} onChange={(e) => setNewTask(e.target.value)} className="w-64" />
        <Button onClick={addTask}>Add</Button>
      </div>

      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        onDragStart={(event) => {
          const taskId = Number(event.active.id);
          const task = tasks.find((t) => t.id === taskId);
          setActiveTask(task || null);
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {statuses.map((status) => (
            <DroppableColumn key={status} id={status}>
              <Card className="flex flex-col h-full max-h-[80vh]">
                <CardHeader>
                  <CardTitle className="capitalize">{status.replace('-', ' ')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 overflow-y-auto min-h-[200px]">
                  {tasks
                    .filter((task) => task.status === status)
                    .map((task) => (
                      <DraggableCard key={task.id} id={task.id}>
                        {/* Pass the openAssignDialog function to TaskCard */}
                        <TaskCard task={task} onAssignClick={() => openAssignDialog(task)} />
                      </DraggableCard>
                    ))}
                </CardContent>
              </Card>
            </DroppableColumn>
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <TaskCard
              onAssignClick={() => {
                console.log('ok ok ok');
              }}
              task={activeTask}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign User</DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-2 cursor-pointer hover:bg-muted rounded-md p-2"
                onClick={() => {
                  if (selectedTask) {
                    setTasks((prev) => prev.map((t) => (t.id === selectedTask.id ? { ...t, assignee: user } : t)));
                    setIsDialogOpen(false);
                  }
                }}
              >
                <Avatar className="w-6 h-6">
                  <AvatarImage src={user.avatarUrl} />
                  <AvatarFallback>
                    {user.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span>{user.name}</span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Update TaskCard to accept onAssignClick prop
function TaskCard({ task, onAssignClick }: { task: Task; onAssignClick: () => void }) {
  return (
    <div className={cn('p-3 rounded-md border shadow-sm bg-muted space-y-2')}>
      <div className="flex justify-between items-center">
        <div className={cn('bg-muted', task.status === 'done' && 'opacity-70 line-through')}>{task.title}</div>
        <Button variant="ghost" size="icon" onClick={onAssignClick} onMouseDown={onAssignClick} className="w-6 h-6">
          <PencilIcon className="w-4 h-4" />
        </Button>
      </div>

      {task.assignee && (
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-background">
            <span className="text-xs">
              {task.assignee.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()}
            </span>
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

function DraggableCard({ id, children }: { id: number; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id,
  });

  return (
    <div ref={setNodeRef} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

function DroppableColumn({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({
    id,
  });

  return <div ref={setNodeRef}>{children}</div>;
}
