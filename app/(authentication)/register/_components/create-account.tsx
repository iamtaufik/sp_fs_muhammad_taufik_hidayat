'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterSchema, registerSchema } from '@/validations/auth.validation';
import { useMutation } from '@tanstack/react-query';
import { createAccount } from '@/lib/api';

const CreateAccount = () => {
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const mutation = useMutation({
    mutationFn: createAccount,
  });

  const onSubmit = (data: RegisterSchema) => {
    mutation.mutate(data, {
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to create account');
      },
      onSuccess: () => {
        toast.success('Account created successfully!');
      },
    });
  };

  return (
    <Card className="w-full max-w-md border-accent">
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardHeader>
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>Enter your email below to create your account</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-3">
            <Label htmlFor="email">Email</Label>
            <Input {...register('email')} type="email" placeholder="m@example.com" />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>
          <div className="flex flex-col gap-3">
            <Label htmlFor="password">Password</Label>
            <Input {...register('password')} type="password" />
            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
          </div>
          <div className="flex flex-col gap-3">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input {...register('confirmPassword')} type="password" />
            {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}
          </div>
          <p className="text-sm my-4">
            Already have an account?{' '}
            <Link href="/login" className="text-primary underline">
              Log in
            </Link>
          </p>
        </CardContent>
        <CardFooter>
          <Button className="w-full" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Creating your account..' : 'Create account'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CreateAccount;
