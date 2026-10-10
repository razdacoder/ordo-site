import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Ordo is set up per institution, so there's no public sign-up: anyone who
 * wants in writes to us and we provision their access.
 */
export const ACCESS_HREF = `mailto:hello@ordo.app?subject=${encodeURIComponent("Access to Ordo")}`;

/** Header call-to-action: ask us for access. */
export function RequestAccessButton({
  size = "sm",
  className,
}: {
  size?: "sm" | "default";
  className?: string;
}) {
  return (
    <Button
      render={<a href={ACCESS_HREF} />}
      variant="brand"
      size={size}
      className={cn(className)}
    >
      Request access
      <ArrowUpRight data-icon="inline-end" strokeWidth={2.25} />
    </Button>
  );
}
