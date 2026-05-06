/* __imports_rewritten__ */
import React from 'https://esm.sh/react@19.2.0';
import { Outlet } from 'https://esm.sh/react-router-dom@7.13.0?deps=react@19.2.0';
import { html } from '../jsx.js';
import { Sidebar } from './Sidebar.js';
import { Header } from './Header.js';

export function Layout() {
  const [open, setOpen] = React.useState(false);
  return html`
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <${Sidebar} open=${open} setOpen=${setOpen} />
      <div className="lg:pl-72">
        <${Header} onMenu=${() => setOpen(true)} />
        <main className="px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          <${Outlet} />
        </main>
      </div>
    </div>
  `;
}
