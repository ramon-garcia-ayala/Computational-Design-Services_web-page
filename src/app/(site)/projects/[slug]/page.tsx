import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectIntro } from "@/components/sections/project/ProjectIntro";
import { HorizontalScroll } from "@/components/sections/project/HorizontalScroll";
import { ProjectFooterNav } from "@/components/sections/project/ProjectFooterNav";
import { BackToTop } from "@/components/ui/BackToTop";
import { coverOf, getNextProject, getProjectBySlug, projects } from "@/data/projects";

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

  const cover = coverOf(project.slug);

  return {
    title: project.title,
    description: project.summary,
    openGraph: {
      title: project.title,
      description: project.summary,
      ...(cover ? { images: [{ url: cover.src, width: cover.width, height: cover.height }] } : {}),
    },
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <>
      <ProjectIntro project={project} />
      <HorizontalScroll project={project} />
      <ProjectFooterNav next={getNextProject(project.slug)} />

      {/* Fixed to the viewport, so it stays put through the pinned horizontal
          section — where the reader is furthest from the top and the page
          gives no other way back. */}
      <BackToTop />
    </>
  );
}
