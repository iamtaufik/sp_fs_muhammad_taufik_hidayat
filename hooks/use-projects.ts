import { create } from 'zustand';

const projectsFromDb = [
  {
    id: 'osduquwdh97127hgd7u9as',
    name: 'Project 1',
    image: 'https://placehold.co/400x200',
    createdAt: '2025-06-14T04:46:44.000Z',
  },
  {
    id: 'saidjdas98duy3h7p098sa',
    name: 'Project 2',
    image: 'https://picsum.photos/800/600',
    createdAt: '2025-06-14T04:46:44.000Z',
  },
  {
    id: 'saduiaosdh2178satd',
    name: 'Project 3',
    image: 'https://picsum.photos/800/600',
    createdAt: '2025-06-14T04:46:44.000Z',
  },
];

type Project = {
  id: string;
  name: string;
  image: string;
  createdAt: string;
};

type ProjectsState = {
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  deleteProject: (id: string) => void;
};

const useProjectsStore = create<ProjectsState>((set) => ({
  projects: [], // Initialize with projects from the database or an empty array if none exist
  setProjects: (projects) => set({ projects }),
  addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),
  deleteProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((project) => project.id !== id),
    })),
}));

export const useProjects = () => {
  const { projects, setProjects, addProject, deleteProject } = useProjectsStore();

  return {
    projects,
    setProjects,
    addProject,
    deleteProject,
  };
};
