import { useState, type FormEvent, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { Wordmark } from "@/components/logo";
import { cn } from "@/lib/utils";
import { submitDemoRequest, type DemoKind, type DemoRequestInput } from "@/lib/site-api";

const KINDS: Array<{ value: DemoKind; label: string; blurb: string }> = [
  { value: "demo", label: "Book a demo", blurb: "A 30 minute walkthrough on your own exam session." },
  { value: "setup", label: "Help me set up", blurb: "We load your faculties, halls and students with you." },
  { value: "question", label: "Ask a question", blurb: "Pricing, data, security, anything else." },
];

const STUDENT_COUNTS = [
  { value: "under_2k", label: "Under 2,000" },
  { value: "2k_10k", label: "2,000 – 10,000" },
  { value: "10k_30k", label: "10,000 – 30,000" },
  { value: "over_30k", label: "Over 30,000" },
];

const NEXT_STEPS: Record<DemoKind, string[]> = {
  demo: [
    "We reply within one working day to find a time.",
    "We walk through Ordo on a sample of your own timetable.",
    "If it fits, we set up your institution's private workspace.",
  ],
  setup: [
    "We reply within one working day to book a setup call.",
    "Together we import your faculties, courses, halls and students.",
    "Your first administrator gets an invite and you're ready to schedule.",
  ],
  question: [
    "A person on the Ordo team reads every message.",
    "We reply by email within one working day.",
  ],
};

// Design system recipes (design-system/components.md): underline fields and
// the Card elevation. Input and Label are the dashboard's own primitives.
const UNDERLINE =
  "w-full border border-transparent border-b-input bg-transparent px-0 text-base outline-none transition-[color,border-color] placeholder:text-muted-foreground focus-visible:border-b-ring aria-invalid:border-b-destructive md:text-sm dark:aria-invalid:border-b-destructive/50";
const SELECT = `${UNDERLINE} h-10 cursor-pointer appearance-none pr-6`;
const TEXTAREA = `${UNDERLINE} min-h-[110px] py-2`;
const CARD = "bg-card text-card-foreground shadow-sm ring-1 ring-foreground/5 p-6 sm:p-8";

const EMPTY: DemoRequestInput = {
  kind: "demo",
  name: "",
  email: "",
  phone: "",
  institution: "",
  job_title: "",
  student_count: "",
  message: "",
  website: "",
};

function Field({
  label,
  name,
  optional,
  error,
  children,
  className,
}: {
  label: string;
  name: string;
  optional?: boolean;
  error?: string[];
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={name} className="gap-1.5">
        {label}
        {optional && <span className="font-medium text-muted-foreground">Optional</span>}
      </Label>
      {children}
      {error && (
        <p id={`${name}-error`} className="text-sm text-destructive">
          {error.join(" ")}
        </p>
      )}
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-[color:var(--border)] bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 sm:px-8">
        <Link to="/" className="flex items-center">
          <Wordmark size="lg" />
        </Link>
        <nav className="hidden items-center gap-8 text-[14px] text-muted-foreground md:flex">
          <Link to="/" className="transition-colors hover:text-[color:var(--brand-strong)]">
            Home
          </Link>
          <Link to="/features" className="transition-colors hover:text-[color:var(--brand-strong)]">
            Modules
          </Link>
        </nav>
        <ThemeToggle iconOnly />
      </div>
    </header>
  );
}

/** Book a demo, ask for setup help or ask a question. */
export default function DemoPage({ initialKind }: { initialKind: DemoKind }) {
  const [values, setValues] = useState<DemoRequestInput>({ ...EMPTY, kind: initialKind });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [topError, setTopError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (key: keyof DemoRequestInput) => (value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors(({ [key]: _gone, ...rest }) => rest);
  };
  const bind = (key: keyof DemoRequestInput) => ({
    id: key,
    name: key,
    value: values[key],
    onChange: (e: { target: { value: string } }) => set(key)(e.target.value),
    "aria-invalid": errors[key] ? true : undefined,
    "aria-describedby": errors[key] ? `${key}-error` : undefined,
  });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const missing: Record<string, string[]> = {};
    if (!values.name.trim()) missing.name = ["Tell us your name."];
    if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) missing.email = ["Enter a valid email address."];
    if (!values.institution.trim()) missing.institution = ["Which institution is this for?"];
    if (Object.keys(missing).length) {
      setErrors(missing);
      return;
    }
    setSending(true);
    setTopError(null);
    const result = await submitDemoRequest({ data: values }).catch(() => ({
      ok: false as const,
      detail: "We couldn't send that just now. Please try again, or email hello@ordo.app.",
      errors: undefined,
    }));
    setSending(false);
    if (result.ok) {
      setSent(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setErrors(result.errors ?? {});
    if (!result.errors) setTopError(result.detail);
  };

  const kind = KINDS.find((k) => k.value === values.kind)!;

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <Header />
      <main className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:py-24">
        <div className="grid grid-cols-12 gap-y-12 lg:gap-x-16">
          <div className="col-span-12 lg:col-span-5">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em]"
              style={{ backgroundColor: "var(--brand-soft)", color: "var(--brand-strong)" }}
            >
              <span aria-hidden className="size-1 rounded-full" style={{ backgroundColor: "var(--brand-strong)" }} />
              Contact · Demo
            </span>
            <h1 className="mt-4 text-balance font-serif text-[2.75rem] leading-[1.02] tracking-[-0.02em] sm:text-[3.5rem]">
              See Ordo on
              <br />
              <span className="italic" style={{ color: "var(--brand-strong)" }}>
                your exams.
              </span>
            </h1>
            <p className="mt-6 max-w-md text-[14.5px] leading-[1.65] text-muted-foreground">
              Ordo is set up for each institution, so there's no sign up form. Tell us a little about your
              school and we'll show you around, or help you get running.
            </p>

            <div className="mt-10 border-t border-[color:var(--border)] pt-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                What happens next
              </p>
              <ol className="mt-4 space-y-3">
                {NEXT_STEPS[values.kind].map((step, i) => (
                  <li key={step} className="flex gap-3 text-[14px] leading-[1.6]">
                    <span className="font-mono text-[12px] font-semibold text-[color:var(--brand-strong)]">0{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
              <p className="mt-8 text-[13.5px] text-muted-foreground">
                Prefer email?{" "}
                <a
                  href="mailto:hello@ordo.app"
                  className="text-foreground underline decoration-border underline-offset-4 hover:decoration-[color:var(--brand)]"
                >
                  hello@ordo.app
                </a>
              </p>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-7">
            {sent ? (
              <div className={CARD} role="status">
                <span
                  className="grid size-10 place-items-center rounded-full"
                  style={{ backgroundColor: "var(--brand-soft)", color: "var(--brand-strong)" }}
                >
                  <Check className="size-5" strokeWidth={2.25} aria-hidden />
                </span>
                <h2 className="mt-6 text-[2rem] leading-[1.1] tracking-tight">
                  Thanks, {values.name.trim().split(/\s+/)[0]}.
                </h2>
                <p className="mt-3 max-w-md text-[14.5px] leading-[1.65] text-muted-foreground">
                  We've got your request for {values.institution.trim()}. Someone from the Ordo team will
                  email {values.email.trim()} within one working day.
                </p>
                <Button render={<Link to="/features" />} variant="outline" className="mt-8">
                  Explore the modules
                  <ArrowRight data-icon="inline-end" strokeWidth={2.25} />
                </Button>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate className={cn(CARD, "relative")}>
                <fieldset>
                  <legend className="text-xs font-semibold uppercase tracking-wide">I'd like to</legend>
                  <div className="mt-3 grid gap-1 bg-muted p-1 sm:grid-cols-3">
                    {KINDS.map((k) => (
                      <label
                        key={k.value}
                        className={cn(
                          "flex h-9 cursor-pointer items-center justify-center px-4 text-xs font-semibold uppercase tracking-wider transition-all has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring/30",
                          values.kind === k.value
                            ? "bg-background text-foreground shadow-sm"
                            : "text-foreground/60 hover:text-foreground dark:text-muted-foreground",
                        )}
                      >
                        <input
                          type="radio"
                          name="kind"
                          value={k.value}
                          checked={values.kind === k.value}
                          onChange={() => set("kind")(k.value)}
                          className="sr-only"
                        />
                        {k.label}
                      </label>
                    ))}
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{kind.blurb}</p>
                </fieldset>

                <div className="mt-8 grid gap-6 sm:grid-cols-2">
                  <Field label="Your name" name="name" error={errors.name}>
                    <Input autoComplete="name" placeholder="Ada Obi" {...bind("name")} />
                  </Field>
                  <Field label="Work email" name="email" error={errors.email}>
                    <Input
                      type="email"
                      autoComplete="email"
                      placeholder="exams@unilag.edu.ng"
                      {...bind("email")}
                    />
                  </Field>
                  <Field label="Institution" name="institution" error={errors.institution}>
                    <Input
                      autoComplete="organization"
                      placeholder="University of Lagos"
                      {...bind("institution")}
                    />
                  </Field>
                  <Field label="Your role" name="job_title" optional error={errors.job_title}>
                    <Input
                      autoComplete="organization-title"
                      placeholder="Exams officer"
                      {...bind("job_title")}
                    />
                  </Field>
                  <Field label="Phone" name="phone" optional error={errors.phone}>
                    <Input
                      type="tel"
                      autoComplete="tel"
                      placeholder="+234 800 000 0000"
                      {...bind("phone")}
                    />
                  </Field>
                  <Field label="Students" name="student_count" optional error={errors.student_count}>
                    <div className="relative">
                    <select className={SELECT} {...bind("student_count")}>
                      <option value="">Choose a range</option>
                      {STUDENT_COUNTS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown aria-hidden className="pointer-events-none absolute top-1/2 right-0 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </Field>
                  <Field
                    label={values.kind === "question" ? "Your question" : "Anything we should know"}
                    name="message"
                    optional={values.kind !== "question"}
                    error={errors.message}
                    className="sm:col-span-2"
                  >
                    <textarea
                      className={TEXTAREA}
                      maxLength={2000}
                      placeholder={
                        values.kind === "setup"
                          ? "Our first exam session on Ordo starts in March. We have 40 halls across two campuses."
                          : "What would you like to see?"
                      }
                      {...bind("message")}
                    />
                  </Field>
                  {/* Hidden from people; bots fill it in. */}
                  <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                    <label htmlFor="website">Website</label>
                    <input id="website" name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={(e) => set("website")(e.target.value)} />
                  </div>
                </div>

                {topError && (
                  <p role="alert" className="mt-6 text-sm text-destructive">
                    {topError}
                  </p>
                )}

                <div className="mt-8 flex flex-col-reverse items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    We only use this to reply to you.
                  </p>
                  <Button type="submit" variant="brand" size="lg" disabled={sending}>
                    {sending ? <Loader2 className="animate-spin" aria-hidden /> : null}
                    {values.kind === "question" ? "Send question" : values.kind === "setup" ? "Request setup help" : "Request a demo"}
                    {!sending && <ArrowRight data-icon="inline-end" strokeWidth={2.25} />}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
      <footer className="border-t border-[color:var(--border)]">
        <div className="mx-auto max-w-7xl px-6 py-8 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground sm:px-8">
          &copy; {new Date().getFullYear()} Ordo · All rights reserved.
        </div>
      </footer>
    </div>
  );
}
