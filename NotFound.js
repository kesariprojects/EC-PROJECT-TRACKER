/* __imports_rewritten__ */
import { Link } from 'https://esm.sh/react-router-dom@7.13.0?deps=react@19.2.0';
import { html } from '../jsx.js';

export function NotFound() {
  return html`<div className="card mx-auto mt-12 max-w-lg p-8 text-center"><p className="text-5xl">🛰️</p><h1 className="mt-4 text-2xl font-semibold">Page not found</h1><p className="mt-2 text-sm text-[hsl(var(--muted))]">This workspace route is unavailable.</p><${Link} to="/" className="mt-6 inline-flex rounded-2xl bg-[hsl(var(--primary))] px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-md)]">Back to dashboard</${Link}></div>`;
}