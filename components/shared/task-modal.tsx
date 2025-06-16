'use client';
import { useTaskModal } from '@/hooks/use-task-modal';
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';

const TaskModal = () => {
  const { taskId, isOpen, onClose, onOpen } = useTaskModal();
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Task Details</DialogTitle>
          <DialogDescription>{taskId ? `Details for task ID: ${taskId}` : 'No task selected.'}</DialogDescription>
          <button onClick={onClose} className="text-red-500 hover:text-red-700">
            Close
          </button>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default TaskModal;
