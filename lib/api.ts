import { RegisterSchema } from '@/validations/auth.validation';

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
