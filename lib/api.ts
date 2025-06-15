import { RegisterSchema } from '@/validations/auth.validation';
import { CreateProjectSchema } from '@/validations/project.validation';
import { CreateTaskSchema, UpdateTaskSchema, UpdateTaskStatusSchema } from '@/validations/task.validation';
import { $Enums } from '@prisma/client';

export const createAccount = async (data: RegisterSchema) => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.error || 'Failed to create account');
  }

  return json;
};

export const createProject = async (data: CreateProjectSchema) => {
  const response = await fetch('/api/projects', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.error || 'Failed to create project');
  }

  return json as {
    status: boolean;
    data: {
      id: string;
      name: string;
      image: string;
      createdAt: string;
    };
  };
};

export const getProjects = async () => {
  const response = await fetch('/api/projects', {
    method: 'GET',
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.error || 'Failed to fetch projects');
  }

  return json as {
    status: boolean;
    data: {
      id: string;
      name: string;
      image: string;
      createdAt: string;
    }[];
  };
};

export const deleteProject = async (id: string) => {
  const response = await fetch(`/api/projects/${id}`, {
    method: 'DELETE',
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.error || 'Failed to delete project');
  }

  return json as {
    status: boolean;
    data: string;
  };
};

export const getProjectById = async (id: string) => {
  const response = await fetch(`/api/projects/${id}`, {
    method: 'GET',
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.error || 'Failed to fetch project');
  }

  return json as {
    status: boolean;
    data: {
      id: string;
      name: string;
      image: string;
      createdAt: string;
      ownerId: string;
      tasks: {
        id: string;
        title: string;
        description: string;
        status: $Enums.TaskStatus;
        assaignee?: {
          id: string;
          email: string;
        };
      }[];
      memberships: {
        userId: string;
        user: {
          id: string;
          email: string;
        };
      }[];
    };
  };
};

export const getNonMembersProjectUsers = async (projectId: string) => {
  const response = await fetch(`/api/projects/${projectId}/non-memberships`, {
    method: 'GET',
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.error || 'Failed to fetch non-member users');
  }

  return json as {
    status: boolean;
    data: {
      id: string;
      email: string;
    }[];
  };
};

export const addMembersToProject = async (data: { projectId: string; users: { id: string; email: string }[] }) => {
  const response = await fetch(`/api/projects/${data.projectId}/memberships`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ users: data.users }),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.error || 'Failed to add members to project');
  }

  return json as {
    status: boolean;
    data: string;
  };
};

export const getMembershipsByProjectId = async (projectId: string) => {
  const response = await fetch(`/api/projects/${projectId}/memberships`, {
    method: 'GET',
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.error || 'Failed to fetch memberships');
  }

  return json as {
    status: boolean;
    data: {
      user: {
        id: string;
        email: string;
      };
    }[];
  };
};

export const addTaskToProject = async (data: { projectId: string; task: CreateTaskSchema }) => {
  const response = await fetch(`/api/projects/${data.projectId}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data.task),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.error || 'Failed to add task to project');
  }

  return json as {
    status: boolean;
    data: {
      id: string;
      title: string;
      description: string;
      status: string;
      createdAt: string;
      updatedAt: string;
    };
  };
};

export const getTaskById = async (projectId: string, taskId: string) => {
  const response = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
    method: 'GET',
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.error || 'Failed to fetch task');
  }

  return json as {
    status: boolean;
    data: {
      id: string;
      title: string;
      description: string;
      status: $Enums.TaskStatus;
      assignee?: {
        id: string;
        email: string;
      };
    };
  };
};

export const updateTask = async (data: { projectId: string; taskId: string; task: UpdateTaskSchema }) => {
  const response = await fetch(`/api/projects/${data.projectId}/tasks/${data.taskId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data.task),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.error || 'Failed to update task');
  }

  return json as {
    status: boolean;
    data: string;
  };
};

export const deleteTask = async (data: { projectId: string; taskId: string }) => {
  const response = await fetch(`/api/projects/${data.projectId}/tasks/${data.taskId}`, {
    method: 'DELETE',
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.error || 'Failed to delete task');
  }

  return json as {
    status: boolean;
    data: string;
  };
};

export const updateTaskStatus = async (data: { projectId: string; task: UpdateTaskStatusSchema}) => {
  const response = await fetch(`/api/projects/${data.projectId}/tasks/${data.task.id}/update-status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status: data.task.status }),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.error || 'Failed to update task status');
  }

  return json as {
    status: boolean;
    data: string;
  };
};
