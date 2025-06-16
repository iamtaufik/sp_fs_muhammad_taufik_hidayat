import { create } from 'zustand';

interface ModalState {
  taskId?: string;
  projectId?: string;
  isOpen: boolean;
  onOpen: ({ taskId, projectId }: { taskId: string; projectId: string }) => void;
  onClose: () => void;
}

export const useTaskModal = create<ModalState>((set) => ({
  taskId: undefined,
  projectId: undefined,
  isOpen: false,
  onOpen: ({ projectId, taskId }) => set({ taskId, projectId, isOpen: true }),
  onClose: () => set({ taskId: undefined, projectId: undefined, isOpen: false }),
}));
