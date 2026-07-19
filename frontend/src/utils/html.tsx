import { type ElementType } from "react";

export function HtmlContent({
  html,
  className,
  tag: Tag = "span",
}: {
  html?: string | null;
  className?: string;
  tag?: ElementType;
}) {
  if (!html) return null;
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

export function renderHtml(text: string | undefined | null): string {
  return text ?? "";
}
