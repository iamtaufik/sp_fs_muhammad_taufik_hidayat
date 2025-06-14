import SidebarLayout from './_components/sidebar-layout';

const RootAuthLayout = ({ children }: { children: React.ReactNode }) => {
  return <SidebarLayout>{children}</SidebarLayout>;
};

export default RootAuthLayout;
