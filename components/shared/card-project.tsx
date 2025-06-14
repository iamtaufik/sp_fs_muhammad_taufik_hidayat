import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { cn, formatDate } from '@/lib/utils';
import Image from 'next/image';
import React from 'react';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import Link from 'next/link';

interface CardProjectProps {
  id: string;
  name: string;
  image: string;
  createdAt: string;
  onDelete?: () => void;
  className?: string;
}

const CardProject = ({ id, name, image, createdAt, className, onDelete }: CardProjectProps) => {
  return (
    <Card className={cn('pt-0 overflow-hidden', className)}>
      <Link href={`/projects/${id}`}>
        <div className="relative h-48 w-full overflow-hidden">
          <Image src={image} alt={name} fill className="object-cover" unoptimized />
        </div>
        <CardContent>
          <div className="my-1 text-lg font-medium">{name}</div>
          <p className="text-sm text-muted-foreground">{formatDate(createdAt)}</p>
        </CardContent>
      </Link>
      <CardFooter>
        <Button variant="destructive" className="ml-auto" onClick={onDelete}>
          Delete Project
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CardProject;
