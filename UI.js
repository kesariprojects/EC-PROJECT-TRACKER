import { html } from '../jsx.js';
import { statusTone } from '../utils/metrics.js';

export function PageTitle({ eyebrow, title, description }) {
  return html`<div className="mb-6 animate-rise"><p className="text-sm font-medium text-[hsl(var(--primary))]">${eyebrow}</p><h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">${title}</h1><p className="mt-2 max-w-2xl text-sm text-[hsl(var(--muted))]">${description}</p></div>`;
}

export function Badge({ status }) {
  const tone = statusTone(status);
  return html`<span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold" style=${{ backgroundColor: `hsl(${tone.hsl} / .12)`, color: `hsl(${tone.hsl})` }}>${tone.label}</span>`;
}

export function ProgressBar({ value, status }) {
  const tone = statusTone(status);
  return html`<div className="h-2 w-full overflow-hidden rounded-full bg-[hsl(var(--secondary))]"><div className="h-full rounded-full transition-all duration-700" style=${{ width: `${value}%`, backgroundColor: `hsl(${tone.hsl})` }}></div></div>`;
}

export function EmptyState({ title, detail }) {
  return html`<div className="card grid min-h-56 place-items-center p-8 text-center"><div><div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-[hsl(var(--secondary))]">✨</div><h3 className="font-semibold">${title}</h3><p className="mt-1 text-sm text-[hsl(var(--muted))]">${detail}</p></div></div>`;
}

export function SkeletonCards() {
  return html`<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">${[1,2,3,4,5].map(i => html`<div key=${i} className="skeleton h-32 rounded-[var(--radius-lg)]"></div>`)}</div>`;
}