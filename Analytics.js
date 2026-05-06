/* __imports_rewritten__ */
import { useParams } from 'https://esm.sh/react-router-dom@7.13.0?deps=react@19.2.0';
import { html } from '../jsx.js';
import { getMetrics, statusCounts, statusTone } from '../utils/metrics.js';
import { PageTitle } from '../components/UI.js';
import { useAppShell } from '../mainProviders.js';

export function Analytics() {
  const { code } = useParams();
  const { visibleProjects } = useAppShell();
  const scopedProjects = code ? visibleProjects.filter(p => p.code === code) : visibleProjects;
  const metrics = getMetrics(scopedProjects);
  const counts = statusCounts(scopedProjects);
  return html`<div><${PageTitle} eyebrow="Analytics" title="Analytics" description="Overall progress, completed and pending steps, overdue tasks, and upcoming work." /><div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">${['Overall Progress %','Completed Steps','Pending Steps','Overdue Tasks','Upcoming Tasks'].map((l,i)=>html`<div key=${l} className="card p-4"><p className="text-xs text-[hsl(var(--muted))]">${l}</p><p className="mt-2 text-3xl font-semibold">${[metrics.progress+'%',metrics.completed,metrics.pending,metrics.overdue,metrics.upcoming][i]}</p></div>`)}</div><div className="grid gap-4 xl:grid-cols-2"><div className="card card-hover p-6"><h3 className="font-semibold">Donut chart (progress)</h3><${Donut} completed=${metrics.completed} pending=${metrics.pending} /></div><div className="card card-hover p-6"><h3 className="font-semibold">Bar chart (status breakdown)</h3><div className="mt-6 space-y-4">${counts.map(item => html`<${Bar} key=${item.status} item=${item} max=${Math.max(...counts.map(c => c.count), 1)} />`)}</div></div></div></div>`;
}
function Donut({ completed, pending }) { const pct = Math.round((completed / Math.max(completed + pending, 1)) * 100); return html`<div className="mt-6 flex items-center justify-center gap-8"><div className="grid h-44 w-44 place-items-center rounded-full" style=${{ background: `conic-gradient(hsl(var(--green)) 0 ${pct}%, hsl(var(--secondary)) ${pct}% 100%)` }}><div className="grid h-28 w-28 place-items-center rounded-full bg-[hsl(var(--card))]"><div className="text-center"><p className="text-3xl font-semibold">${pct}%</p><p className="text-xs text-[hsl(var(--muted))]">complete</p></div></div></div><div className="space-y-2 text-sm"><p>Completed: ${completed}</p><p>Pending: ${pending}</p></div></div>`; }
function Bar({ item, max }) { const tone = statusTone(item.status); return html`<div><div className="mb-2 flex justify-between text-sm"><span>${item.status}</span><span className="text-[hsl(var(--muted))]">${item.count}</span></div><div className="h-3 rounded-full bg-[hsl(var(--secondary))]"><div className="h-full rounded-full" style=${{ width: `${(item.count / Math.max(max, 1)) * 100}%`, backgroundColor: `hsl(${tone.hsl})` }}></div></div></div>`; }
