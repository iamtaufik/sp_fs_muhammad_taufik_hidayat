'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema, loginSchema } from '@/validations/auth.validation';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const SiginAccount = () => {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const onSubmit = (data: LoginSchema) => {
    setIsLoading(true);
    signIn('credentials', {
      ...data,
      redirect: false,
    }).then((result) => {
      setIsLoading(false);
      if (result?.error) {
        if (result.error === 'CredentialsSignin') {
          toast.error('Invalid email or password');
        } else {
          toast.error(result.error);
        }
      } else {
        toast.success('Login successful! Redirecting to dashboard...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      }
    });
  };

  return (
    <Card className="w-full max-w-md border-accent">
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardHeader>
          <CardTitle className="text-2xl">Login account</CardTitle>
          <CardDescription>Enter your credentials below to login your account</CardDescription>
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

          <p className="text-sm my-4">
            Don't have an account?{' '}
            <Link href="/register" className="text-primary underline">
              Create account
            </Link>
          </p>
        </CardContent>
        <CardFooter>
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default SiginAccount;
