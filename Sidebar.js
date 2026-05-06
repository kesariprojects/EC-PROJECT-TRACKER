/* __imports_rewritten__ */
import {LayoutDashboard, Users, GitBranch, BarChart3, Bell, X} from 'https://esm.sh/lucide-react?deps=react@19.2.0';
import { NavLink, useParams } from 'https://esm.sh/react-router-dom@7.13.0?deps=react@19.2.0';
import { html } from '../jsx.js';
import { useAppShell } from '../mainProviders.js';

const items = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'Clients', to: '/clients', icon: Users, admin: true },
  { label: 'Process Tracker', to: '/process', icon: GitBranch, projectPath: 'process' },
  { label: 'Analytics', to: '/analytics', icon: BarChart3, projectPath: 'analytics' },
  { label: 'Alerts', to: '/alerts', icon: Bell, projectPath: 'alerts' }
];
export function Sidebar({ open, setOpen }) {
  const { code } = useParams();
  const { session, visibleProjects } = useAppShell();
  const filtered = items.filter(item => !item.admin || session?.role === 'Admin');
  return html`<div><div className=${`fixed inset-0 z-30 bg-black/30 transition-opacity lg:hidden ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`} onClick=${() => setOpen(false)}></div><aside className=${`fixed left-0 top-0 z-40 flex h-screen w-72 flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--card))]/95 px-4 py-5 shadow-[var(--shadow-lg)] backdrop-blur-xl transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}><div className="mb-8 flex items-center justify-between"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-2xl bg-[hsl(var(--primary))] text-white shadow-[var(--shadow-md)]">EC</div><div><p className="text-sm text-[hsl(var(--muted))]">KIPL</p><h1 className="font-semibold tracking-tight">EC Tracker</h1></div></div><button className="rounded-xl p-2 hover:bg-[hsl(var(--secondary))] lg:hidden" onClick=${() => setOpen(false)}><${X} size=${18} /></button></div><nav className="space-y-1">${filtered.map(item => html`<${NavItem} key=${item.to} item=${item} code=${code} close=${() => setOpen(false)} />`)}</nav><div className="mt-auto rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))]/60 p-4"><p className="text-sm font-medium">Projects</p><p className="mt-1 text-xs text-[hsl(var(--muted))]">${visibleProjects.length} active client project${visibleProjects.length === 1 ? '' : 's'}</p></div></aside></div>`;
}
function NavItem({ item, code, close }) { const Icon = item.icon; const to = code && item.projectPath ? `/projects/${code}/${item.projectPath}` : item.to; return html`<${NavLink} to=${to} onClick=${close} className=${({ isActive }) => `focus-ring flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium ${isActive ? 'bg-[hsl(var(--primary))] text-white shadow-[var(--shadow-md)]' : 'text-[hsl(var(--muted))] hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--foreground))]'}`}><${Icon} size=${18} /><span>${item.label}</span></${NavLink}>`; }
