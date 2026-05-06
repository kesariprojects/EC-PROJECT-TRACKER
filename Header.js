/* __imports_rewritten__ */
import {Menu, Moon, Sun, LogOut} from 'https://esm.sh/lucide-react?deps=react@19.2.0';
import { useParams } from 'https://esm.sh/react-router-dom@7.13.0?deps=react@19.2.0';
import { html } from '../jsx.js';
import { useAppShell } from '../mainProviders.js';

export function Header({ onMenu }) {
  const { code } = useParams();
  const { dark, setDark, session, visibleProjects, logout } = useAppShell();
  const project = code ? visibleProjects.find(p => p.code === code) : session?.role === 'Client' ? visibleProjects[0] : null;
  return html`<header className="sticky top-0 z-20 border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/80 backdrop-blur-xl"><div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8"><div className="flex items-center gap-3"><button className="rounded-2xl p-2 hover:bg-[hsl(var(--secondary))] lg:hidden" onClick=${onMenu} aria-label="Open menu"><${Menu} size=${20} /></button><div><p className="text-xs text-[hsl(var(--muted))]">EC Project Progress Tracker KIPL</p><h2 className="font-semibold tracking-tight">${project?.projectName || 'Project Directory'}</h2></div></div><div className="flex items-center gap-2"><button className="focus-ring rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2 shadow-[var(--shadow-sm)] hover:-translate-y-0.5" onClick=${() => setDark(!dark)} aria-label="Toggle theme">${dark ? html`<${Sun} size=${18} />` : html`<${Moon} size=${18} />`}</button><span className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-sm font-medium">${session?.role || 'Client'}</span><button className="focus-ring rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2" onClick=${logout} aria-label="Logout"><${LogOut} size=${18} /></button></div></div></header>`;
}
