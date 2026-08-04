import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectIntro } from "@/components/sections/project/ProjectIntro";
import { HorizontalScroll } from "@/components/sections/project/HorizontalScroll";
import { ProjectFooterNav } from "@/components/sections/project/ProjectFooterNav";
import { getNextProject, getProjectBySlug, projects } from "@/data/projects";

type PageProps = { params: Promise<{ slug: string }> };

/** Every detail route is generated at build time from data/projects.ts */
export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};

  return {
    title: project.title,
    description: project.summary,
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <>
      <ProjectIntro project={project} />
      <HorizontalScroll panels={project.panels} />
      <ProjectFooterNav next={getNextProject(project.slug)} />
    </>
  );
}
