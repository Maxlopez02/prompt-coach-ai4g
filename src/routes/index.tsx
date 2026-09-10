import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Check, CircleAlert, CircleHelp, Copy, Loader2, RotateCcw } from "lucide-react";

import {
  analyzePrompt,
  comparePrompts,
  type Analysis,
  type Comparison,
  type DimensionStatus,
} from "@/lib/coach.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Prompt Coach — Learn to Write Better AI Prompts" },
      {
        name: "description",
        content:
          "A free coaching tool for students: paste a draft AI prompt and get clear feedback on goal, context, constraints and output, then practise a revision.",
      },
      { property: "og:title", content: "Prompt Coach — Learn to Write Better AI Prompts" },
      {
        property: "og:description",
        content:
          "Get friendly, specific feedback on your AI prompts and practise revising them. Built for beginner university students.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PromptCoach,
});

const MAX_DRAFT = 1200;

const ANATOMY = [
  { label: "GOAL", note: "What you want to learn or make." },
  { label: "CONTEXT", note: "Who you are, your level, the course." },
  { label: "CONSTRAINTS", note: "Length, tone, language, don't solve it." },
  { label: "OUTPUT", note: "Steps, analogy, checklist, example." },
];

function statusStyle(status: DimensionStatus) {
  if (status === "Clear")
    return { icon: Check, cls: "text-teal", ring: "border-teal/40 bg-teal/5" };
  if (status === "Needs work")
    return { icon: CircleAlert, cls: "text-coral", ring: "border-coral/40 bg-coral/5" };
  return { icon: CircleHelp, cls: "text-muted-foreground", ring: "border-rule bg-muted" };
}

function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
    >
      {children}
    </label>
  );
}

function PromptCoach() {
  const runAnalyze = useServerFn(analyzePrompt);
  const runCompare = useServerFn(comparePrompts);

  const [goal, setGoal] = useState("");
  const [draft, setDraft] = useState("");
  const [revision, setRevision] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [comparison, setComparison] = useState<Comparison | null>(null);
  const [loading, setLoading] = useState<"analyze" | "compare" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const canAnalyze = goal.trim().length > 0 && draft.trim().length > 0 && loading === null;

  async function onAnalyze(event: React.FormEvent) {
    event.preventDefault();
    if (!canAnalyze) return;
    setLoading("analyze");
    setError(null);
    setComparison(null);
    try {
      const result = await runAnalyze({ data: { goal: goal.trim(), draft: draft.trim() } });
      setAnalysis(result);
    } catch (err) {
      setAnalysis(null);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  async function onCompare() {
    if (revision.trim().length === 0 || loading !== null) return;
    setLoading("compare");
    setError(null);
    try {
      const result = await runCompare({
        data: { goal: goal.trim(), draft: draft.trim(), revision: revision.trim() },
      });
      setComparison(result);
    } catch (err) {
      setComparison(null);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  function onExample() {
    setGoal("Understand Python while loops");
    setDraft("Help me learn Python.");
    setAnalysis(null);
    setComparison(null);
    setError(null);
  }

  function onReset() {
    setGoal("");
    setDraft("");
    setRevision("");
    setAnalysis(null);
    setComparison(null);
    setError(null);
  }

  async function onCopy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Your browser blocked copying. Select the text and copy it manually.");
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-rule bg-paper">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 sm:px-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-cobalt">
            SDG 4 · Quality Education
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl">
            Prompt Coach
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground">
            Paste a draft prompt, see what a strong one needs, and practise rewriting it in your
            own words. The coach teaches the prompt — it never does your assignment.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[42%_58%] lg:gap-12">
          {/* Left: inputs */}
          <section aria-labelledby="workspace-heading" className="space-y-6">
            <h2 id="workspace-heading" className="sr-only">
              Your prompt
            </h2>

            <form onSubmit={onAnalyze} className="space-y-5 rounded-xl border border-rule bg-paper p-6">
              <div className="space-y-2">
                <Label htmlFor="goal">What are you trying to learn or make?</Label>
                <input
                  id="goal"
                  required
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g. Understand Python while loops"
                  className="w-full rounded-md border border-rule bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="draft">Paste your draft prompt</Label>
                <textarea
                  id="draft"
                  required
                  rows={7}
                  maxLength={MAX_DRAFT}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value.slice(0, MAX_DRAFT))}
                  placeholder="e.g. Help me learn Python."
                  className="w-full resize-y rounded-md border border-rule bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <p className="text-right font-mono text-[11px] text-muted-foreground">
                  {draft.length} / {MAX_DRAFT}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={!canAnalyze}
                  className="inline-flex items-center gap-2 rounded-md bg-cobalt px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading === "analyze" && <Loader2 className="size-4 animate-spin" />}
                  {loading === "analyze" ? "Reading your prompt…" : "Coach my prompt"}
                </button>
                <button
                  type="button"
                  onClick={onExample}
                  disabled={loading !== null}
                  className="rounded-md border border-rule px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-muted disabled:opacity-50"
                >
                  Try an example
                </button>
                <button
                  type="button"
                  onClick={onReset}
                  disabled={loading !== null}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground underline-offset-4 hover:underline disabled:opacity-50"
                >
                  <RotateCcw className="size-3.5" /> Start over
                </button>
              </div>
            </form>

            {/* Prompt Anatomy margin rail */}
            <aside
              aria-label="Prompt anatomy"
              className="rounded-xl border border-rule bg-paper p-6"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Prompt anatomy
              </p>
              <ol className="mt-4 space-y-4 border-l-2 border-rule pl-5">
                {ANATOMY.map((item, i) => (
                  <li
                    key={item.label}
                    className="rail-reveal relative"
                    style={{ animationDelay: `${i * 120}ms` }}
                  >
                    <span className="absolute -left-[27px] top-1.5 size-2.5 rounded-full bg-cobalt" />
                    <p className="font-mono text-xs font-medium tracking-[0.12em] text-cobalt">
                      {item.label}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.note}</p>
                  </li>
                ))}
              </ol>
            </aside>
          </section>

          {/* Right: feedback */}
          <section aria-labelledby="feedback-heading" className="space-y-6">
            <h2 id="feedback-heading" className="sr-only">
              Coach feedback
            </h2>

            <div aria-live="polite" className="space-y-6">
              {loading === "analyze" && (
                <p className="rounded-xl border border-rule bg-paper p-6 text-sm text-muted-foreground">
                  Reading your prompt…
                </p>
              )}

              {error && (
                <p
                  role="alert"
                  className="rounded-xl border border-coral/50 bg-coral/5 p-4 text-sm text-foreground"
                >
                  {error}
                </p>
              )}

              {!analysis && loading !== "analyze" && !error && (
                <div className="rounded-xl border border-dashed border-rule p-8 text-sm text-muted-foreground">
                  Your feedback will appear here: four dimensions scored, what already works, what
                  to improve, and a coach&apos;s example prompt.
                </div>
              )}

              {analysis && (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {analysis.dimensions.map((d, i) => {
                      const s = statusStyle(d.status);
                      const Icon = s.icon;
                      return (
                        <article
                          key={d.name}
                          className={`rail-reveal rounded-xl border p-4 ${s.ring}`}
                          style={{ animationDelay: `${i * 90}ms` }}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-display text-base font-semibold">{d.name}</h3>
                            <span
                              className={`inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em] ${s.cls}`}
                            >
                              <Icon className="size-3.5" aria-hidden="true" />
                              {d.status}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground">{d.explanation}</p>
                        </article>
                      );
                    })}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-rule bg-paper p-5">
                      <h3 className="font-display text-base font-semibold">What already works</h3>
                      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                        {analysis.works.map((w) => (
                          <li key={w} className="flex gap-2">
                            <Check className="mt-0.5 size-4 shrink-0 text-teal" aria-hidden="true" />
                            <span>{w}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-xl border border-rule bg-paper p-5">
                      <h3 className="font-display text-base font-semibold">What to improve next</h3>
                      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                        {analysis.improve.map((w) => (
                          <li key={w} className="flex gap-2">
                            <CircleAlert
                              className="mt-0.5 size-4 shrink-0 text-coral"
                              aria-hidden="true"
                            />
                            <span>{w}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="rounded-xl border-2 border-cobalt/30 bg-paper p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-display text-base font-semibold">Coach&apos;s example</h3>
                      <button
                        type="button"
                        onClick={() => onCopy(analysis.example)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-rule px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors hover:bg-muted"
                      >
                        <Copy className="size-3.5" aria-hidden="true" />
                        {copied ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">
                      {analysis.example}
                    </p>
                    <p className="mt-3 font-mono text-[11px] text-muted-foreground">
                      A model to learn from — not an answer to your assignment.
                    </p>
                  </div>

                  <div className="rounded-xl border border-rule bg-paper p-5">
                    <div className="space-y-2">
                      <Label htmlFor="revision">Revise it in your own words</Label>
                      <textarea
                        id="revision"
                        rows={6}
                        maxLength={MAX_DRAFT}
                        value={revision}
                        onChange={(e) => setRevision(e.target.value.slice(0, MAX_DRAFT))}
                        placeholder="Write your improved prompt here — don't copy the example."
                        className="w-full resize-y rounded-md border border-rule bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                      <p className="text-right font-mono text-[11px] text-muted-foreground">
                        {revision.length} / {MAX_DRAFT}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={onCompare}
                      disabled={revision.trim().length === 0 || loading !== null}
                      className="mt-2 inline-flex items-center gap-2 rounded-md bg-cobalt px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loading === "compare" && <Loader2 className="size-4 animate-spin" />}
                      {loading === "compare" ? "Reading your revision…" : "Compare my revision"}
                    </button>
                  </div>
                </>
              )}

              {comparison && (
                <div className="rail-reveal rounded-xl border border-teal/40 bg-teal/5 p-5">
                  <h3 className="font-display text-base font-semibold">What changed</h3>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {comparison.improved.map((item) => (
                      <li key={item} className="flex gap-2">
                        <Check className="mt-0.5 size-4 shrink-0 text-teal" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-coral">
                        One gap left
                      </p>
                      <p className="mt-1 text-sm">{comparison.remainingGap}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-cobalt">
                        Next tip
                      </p>
                      <p className="mt-1 text-sm">{comparison.nextTip}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      <footer className="mt-8 border-t border-rule bg-paper">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
          <h2 className="font-display text-xl font-semibold">About this learning tool</h2>
          <div className="mt-5 grid gap-6 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-foreground">
                Who it&apos;s for
              </p>
              <p className="mt-1.5">
                Beginner university and college students who are new to writing prompts for AI
                tools.
              </p>
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-foreground">
                Not a homework solver
              </p>
              <p className="mt-1.5">
                The coach improves your prompt only. It will not write your essay, code or exam
                answers, and copying AI work as your own is plagiarism.
              </p>
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-foreground">
                Privacy
              </p>
              <p className="mt-1.5">
                Your text is sent to an AI service for analysis. Don&apos;t paste personal details,
                student IDs or confidential coursework.
              </p>
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-foreground">
                AI can be wrong
              </p>
              <p className="mt-1.5">
                Feedback is generated by AI and may be mistaken. Always check your course rules and
                your instructor&apos;s guidance.
              </p>
            </div>
          </div>
          <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Built for UN Sustainable Development Goal 4 — Quality Education
          </p>
        </div>
      </footer>
    </div>
  );
}
