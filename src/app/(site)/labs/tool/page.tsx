import type { Metadata } from "next";
import { ToolViewerPage } from "@/minitools/components/ToolViewerPage";
import { viewerCopy } from "@/minitools/data/copy";

export const metadata: Metadata = {
  title: viewerCopy.pageTitle,
  description: viewerCopy.pageDescription,
  /* Every URL here is one visitor's generated tool, not content anyone should
     land on from a search. */
  robots: { index: false, follow: false },
};

/**
 * Host page for a generated mini tool.
 *
 * Deliberately empty of data: the spec arrives in the URL fragment, which the
 * browser never sends, so this stays a single prebuilt page.
 */
export default function ToolPage() {
  return <ToolViewerPage />;
}
