import { RegisterSchema } from '@/validations/auth.validation';
import { CreateProjectSchema } from '@/validations/project.validation';

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
}
