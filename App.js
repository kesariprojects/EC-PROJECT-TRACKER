/* __imports_rewritten__ */
import { HashRouter, Routes, Route, Navigate } from 'https://esm.sh/react-router-dom@7.13.0?deps=react@19.2.0';
import { html } from './jsx.js';
import { Layout } from './components/Layout.js';
import { Login } from './pages/Login.js';
import { Dashboard } from './pages/Dashboard.js';
import { ProcessTracker } from './pages/ProcessTracker.js';
import { Analytics } from './pages/Analytics.js';
import { Alerts } from './pages/Alerts.js';
import { Clients } from './pages/Clients.js';
import { NotFound } from './pages/NotFound.js';
import { useAppShell } from './mainProviders.js';

function Guard({ children }) {
  const { session, authReady } = useAppShell();
  if (!authReady) return html`<div className="grid min-h-screen place-items-center bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"><div className="skeleton h-20 w-64 rounded-3xl"></div></div>`;
  return session ? children : html`<${Navigate} to="/login" replace />`;
}

export function App() {
  return html`<${HashRouter}><${Routes}><${Route} path="/login" element=${html`<${Login} />`} /><${Route} element=${html`<${Guard}>${html`<${Layout} />`}</${Guard}>`}><${Route} path="/" element=${html`<${Dashboard} />`} /><${Route} path="/projects/:code" element=${html`<${Dashboard} />`} /><${Route} path="/projects/:code/process" element=${html`<${ProcessTracker} />`} /><${Route} path="/projects/:code/analytics" element=${html`<${Analytics} />`} /><${Route} path="/projects/:code/alerts" element=${html`<${Alerts} />`} /><${Route} path="/dashboard" element=${html`<${Navigate} to="/" replace />`} /><${Route} path="/clients" element=${html`<${Clients} />`} /><${Route} path="/process" element=${html`<${ProcessTracker} />`} /><${Route} path="/analytics" element=${html`<${Analytics} />`} /><${Route} path="/alerts" element=${html`<${Alerts} />`} /><${Route} path="*" element=${html`<${NotFound} />`} /></${Route}></${Routes}></${HashRouter}>`;
}
