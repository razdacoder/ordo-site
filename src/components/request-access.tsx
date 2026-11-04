import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Ordo is set up per institution, so there's no public sign-up: people book
 * a demo or ask for setup help on /demo, and the request lands in the
 * console's Requests page.
 */
export const ACCESS_HREF = "/demo";
export const SETUP_HREF = "/demo?kind=setup";
export const QUESTION_HREF = "/demo?kind=question";

/** Header call-to-action: book a demo. */
export function RequestAccessButton({
  size = "sm",
  className,
}: {
  size?: "sm" | "default";
  className?: string;
}) {
  return (
    <Button render={<Link to="/demo" />} variant="brand" size={size} className={cn(className)}>
      Book a demo
      <ArrowRight data-icon="inline-end" strokeWidth={2.25} />
    </Button>
  );
}
