import CardProject from '@/components/shared/card-project';

interface Project {
  id: string;
  name: string;
  image: string;
  createdAt: string;
}

const SectionCards = ({ projects }: { projects: Project[] }) => {
  return (
    <>
      {projects.map((project) => (
        <CardProject key={project.id} id={project.id} name={project.name} image={project.image} createdAt={project.createdAt} />
      ))}
    </>
  );
};

export default SectionCards;
