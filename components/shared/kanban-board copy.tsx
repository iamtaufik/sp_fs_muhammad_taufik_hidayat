'use client';
import { DndContext, closestCenter, DragEndEvent, useDraggable, useDroppable, DragOverlay } from '@dnd-kit/core';
import { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

type User = {
  id: number;
  name: string;
  avatarUrl?: string;
};

type Task = {
  id: number;
  title: string;
  status: 'todo' | 'in-progress' | 'done';
  assignee?: User;
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

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [newTask, setNewTask] = useState('');
  const [activeTask, setActiveTask] = useState<Task | null>(null);

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
                      <DraggableCardWithClick
                        key={task.id}
                        id={task.id}
                        onClick={() => {
                          setSelectedTask(task);
                          setIsDialogOpen(true);
                        }}
                      >
                        <TaskCard task={task} />
                      </DraggableCardWithClick>
                    ))}
                </CardContent>
              </Card>
            </DroppableColumn>
          ))}
        </div>

        <DragOverlay>{activeTask ? <TaskCard task={activeTask} /> : null}</DragOverlay>
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

function TaskCard({ task }: { task: Task }) {
  return (
    <div className={cn('p-3 rounded-md border shadow-sm bg-muted space-y-2', task.status === 'done' && 'opacity-70 line-through')}>
      <div>{task.title}</div>

      {task.assignee && (
        <Avatar className="w-6 h-6">
          <AvatarImage src={task.assignee.avatarUrl} />
          <AvatarFallback>
            {task.assignee.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

function DraggableCardWithClick({ id, onClick, children }: { id: number; onClick?: () => void; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef } = useDraggable({ id });

  const startPoint = useRef<{ x: number; y: number } | null>(null);

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      className="select-none"
      onPointerDown={(e) => {
        startPoint.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerUp={(e) => {
        if (!startPoint.current) return;

        const deltaX = Math.abs(e.clientX - startPoint.current.x);
        const deltaY = Math.abs(e.clientY - startPoint.current.y);

        // If pointer barely moved → treat as click
        if (deltaX < 5 && deltaY < 5 && onClick) {
          onClick();
        }

        startPoint.current = null;
      }}
    >
      <div {...listeners} className="cursor-grab active:cursor-grabbing">
        {children}
      </div>
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
