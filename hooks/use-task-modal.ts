import { create } from 'zustand';

interface ModalState {
  taskId?: string;
  isOpen: boolean;
  onOpen: (taskId?: string) => void;
  onClose: () => void;
}

export const useTaskModal = create<ModalState>((set) => ({
  taskId: undefined,
  isOpen: false,
  onOpen: (taskId?: string) => set({ taskId, isOpen: true }),
  onClose: () => set({ taskId: undefined, isOpen: false }),
}));
