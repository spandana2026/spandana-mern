import { Construction } from "lucide-react";

interface AdminPlaceholderProps {
  title: string;
  description?: string;
}

export default function AdminPlaceholder({ title, description }: AdminPlaceholderProps) {
  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-serif font-bold">{title}</h2>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      <div className="bg-card border-2 border-dashed border-border rounded-2xl p-12 text-center">
        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
          <Construction size={24} className="text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg mb-2">Coming Soon</h3>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto">
          This admin section is being built as part of the CMS rollout.
        </p>
      </div>
    </div>
  );
}
