/* __imports_rewritten__ */
import React from 'https://esm.sh/react@19.2.0';
import { useNavigate } from 'https://esm.sh/react-router-dom@7.13.0?deps=react@19.2.0';
import { html } from '../jsx.js';
import { useAppShell } from '../mainProviders.js';

export function Login() {
  const { sendAdminLink, clientLogin } = useAppShell();
  const navigate = useNavigate();
  const [adminCode, setAdminCode] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [clientCode, setClientCode] = React.useState('');
  const [loading, setLoading] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');
  const adminSubmit = async e => { e.preventDefault(); setError(''); setMessage(''); setLoading('admin'); try { await sendAdminLink(adminCode, email); setMessage('Verification link sent. Check your email.'); } catch (err) { setError(err.message || 'Unable to send verification link.'); } finally { setLoading(''); } };
  const clientSubmit = e => { e.preventDefault(); setError(''); setMessage(''); try { const project = clientLogin(clientCode); navigate(`/projects/${project.code}`, { replace: true }); } catch (err) { setError(err.message || 'Invalid Client Code'); } };
  return html`<main className="grid min-h-screen place-items-center bg-[hsl(var(--background))] px-4 text-[hsl(var(--foreground))]"><div className="w-full max-w-md"><h1 className="mb-8 text-center text-3xl font-semibold tracking-tight">EC Project Progress Tracker</h1><div className="card p-5"><form onSubmit=${adminSubmit} className="space-y-3"><input value=${adminCode} onInput=${e=>setAdminCode(e.target.value)} disabled=${loading==='admin'} placeholder="Admin Code" className="w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 focus-ring" /><input value=${email} onInput=${e=>setEmail(e.target.value)} disabled=${loading==='admin'} placeholder="Admin Email" type="email" className="w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 focus-ring" /><button disabled=${loading==='admin'} className="w-full rounded-2xl bg-[hsl(var(--primary))] px-4 py-3 font-semibold text-white disabled:opacity-60">${loading==='admin'?'Sending...':'Admin Login'}</button></form><div className="my-5 h-px bg-[hsl(var(--border))]"></div><form onSubmit=${clientSubmit} className="space-y-3"><input value=${clientCode} onInput=${e=>setClientCode(e.target.value)} placeholder="Client Code" className="w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 focus-ring" /><button className="w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] px-4 py-3 font-semibold">Client Login</button></form>${message && html`<p className="mt-4 rounded-2xl bg-[hsl(var(--green))]/10 p-3 text-sm text-[hsl(var(--green))]">${message}</p>`}${error && html`<p className="mt-4 rounded-2xl bg-[hsl(var(--red))]/10 p-3 text-sm text-[hsl(var(--red))]">${error}</p>`}</div></div></main>`;
}