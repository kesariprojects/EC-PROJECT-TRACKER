/* __imports_rewritten__ */
import { useParams } from 'https://esm.sh/react-router-dom@7.13.0?deps=react@19.2.0';
import { html } from '../jsx.js';
import { PageTitle, EmptyState } from '../components/UI.js';
import { useAppShell } from '../mainProviders.js';
import { isOverdue, isUpcoming } from '../utils/metrics.js';

export function Alerts() {
  const { code } = useParams();
  const { visibleProjects } = useAppShell();
  const scopedProjects = code ? visibleProjects.filter(p => p.code === code) : visibleProjects;
  const alerts = scopedProjects.flatMap(p => (p.steps || []).filter(s => isOverdue(s) || isUpcoming(s)).map(s => ({...s, project:p.projectName, code:p.code, tone:isOverdue(s) ? 'Overdue' : 'Upcoming'})));
  if (alerts.length === 0) return html`<${EmptyState} title="No alerts" detail="Everything is on track. New risks will appear here automatically." />`;
  return html`<div><${PageTitle} eyebrow="Alerts" title="Alerts" description="Red overdue and yellow upcoming tasks by due date." /><div className="grid gap-4 lg:grid-cols-2">${alerts.map(alert => { const color = alert.tone === 'Overdue' ? 'var(--red)' : 'var(--yellow)'; return html`<div key=${`${alert.code}-${alert.id}`} className="card card-hover p-5" style=${{ borderColor: `hsl(${color} / .35)`, background: `hsl(${color} / .08)` }}><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wide" style=${{ color: `hsl(${color})` }}>${alert.tone}</p><h3 className="mt-2 font-semibold">${alert.activity}</h3><p className="mt-1 text-sm text-[hsl(var(--muted))]">${alert.project} · ${alert.code}</p></div><div className="rounded-2xl bg-[hsl(var(--card))] px-3 py-2 text-sm font-medium shadow-[var(--shadow-sm)]">${alert.endDate || 'No due date'}</div></div></div>`; })}</div></div>`;
}