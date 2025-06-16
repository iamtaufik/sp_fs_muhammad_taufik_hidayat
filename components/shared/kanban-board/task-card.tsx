import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { PencilIcon } from 'lucide-react';

type Task = {
  id: string;
  title: string;
  description: string;
  status: string;
  assignee?: User;
};

type User = {
  id: string;
  email: string;
};

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

function TaskCard({ task, onClick }: TaskCardProps) {
  return (
    <div className={'p-3 rounded-md border shadow-sm bg-muted space-y-2'}>
      <div className="flex justify-between items-center">
        <div className={cn('bg-muted', task.status === 'DONE' && 'opacity-70 line-through')}>{task.title}</div>
        <Button variant="ghost" size="icon" onClick={onClick} onPointerDown={(e) => e.preventDefault()} className="w-6 h-6">
          <PencilIcon className="w-4 h-4" />
        </Button>
      </div>
      {task.assignee && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Avatar className="w-6 h-6">
              <AvatarFallback>{task.assignee.email[0].toUpperCase()}</AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{task.assignee.email}</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

export default TaskCard;
