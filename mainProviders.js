/* __imports_rewritten__ */
import React from 'https://esm.sh/react@19.2.0';
import { html } from './jsx.js';
import { seedProjects, createSteps } from './data/sampleData.js';

const AppContext = React.createContext(null);
const ADMIN_CODE = 'ADMIN@KESARI001';
const ADMIN_DOMAIN = '@kesariprojects.com';
const DATA_KEY = 'ec-kipl-projects';
const SESSION_KEY = 'ec-kipl-session';
const THEME_KEY = 'ec-kipl-theme';
const OWNERS_KEY = 'ec-kipl-owners';

function safeGet(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }
function save(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }
function generateCode(projects, mep, architect, client) {
  const base = `${(mep || '').trim().toUpperCase()}${(architect || '').trim().toUpperCase()}${(client || 'CL').trim().slice(0,2).toUpperCase()}`.replace(/\s/g, '');
  let serial = (projects?.length || 0) + 3;
  let code = `${base}${String(serial).padStart(2, '0')}`;
  while ((projects || []).some(p => p.code?.toUpperCase() === code.toUpperCase())) code = `${base}${String(++serial).padStart(2, '0')}`;
  return code;
}
function normalizeProjects(list) { return (list || []).map(p => ({ ...p, projectOwner: p.projectOwner || 'Others', projectDetails: p.projectDetails || '', startDate: p.startDate || '', endDate: p.endDate || '' })); }

export function Providers({ children }) {
  const [dark, setDark] = React.useState(() => localStorage.getItem(THEME_KEY) === 'dark');
  const [projects, setProjects] = React.useState(() => normalizeProjects(safeGet(DATA_KEY, seedProjects)));
  const [owners, setOwners] = React.useState(() => Array.from(new Set([...safeGet(OWNERS_KEY, []), ...normalizeProjects(safeGet(DATA_KEY, seedProjects)).map(p => p.projectOwner || 'Others'), 'Others'])));
  const [session, setSession] = React.useState(() => safeGet(SESSION_KEY, null));
  const [authReady, setAuthReady] = React.useState(false);
  const [authError, setAuthError] = React.useState('');

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
  }, [dark]);
  React.useEffect(() => save(DATA_KEY, projects), [projects]);
  React.useEffect(() => save(OWNERS_KEY, owners), [owners]);
  React.useEffect(() => save(SESSION_KEY, session), [session]);

  React.useEffect(() => {
    let unsub = () => {};
    const boot = async () => {
      try {
        if (window.genmb?.auth) {
          await window.genmb.auth.ready();
          unsub = window.genmb.auth.onAuthStateChange(user => {
            if (user && user.email?.endsWith(ADMIN_DOMAIN)) setSession({ role: 'Admin', email: user.email, name: user.name || 'Admin' });
          });
        }
      } catch (err) { setAuthError(err?.message || 'Authentication service could not start.'); }
      finally { setAuthReady(true); }
    };
    boot();
    return () => unsub();
  }, []);

  const selectedProject = React.useMemo(() => session?.role === 'Client' ? projects.find(p => p.code === session.code) || null : null, [projects, session]);
  const visibleProjects = session?.role === 'Client' ? projects.filter(p => p.code === session.code) : projects;

  const sendAdminLink = async (code, email) => {
    setAuthError('');
    if (code !== ADMIN_CODE) throw new Error('Invalid admin code.');
    if (!email?.toLowerCase().endsWith(ADMIN_DOMAIN)) throw new Error('Admin email must end with @kesariprojects.com');
    if (!window.genmb?.auth) throw new Error('Authentication service is unavailable.');
    await window.genmb.auth.sendMagicLink(email);
  };
  const clientLogin = code => {
    const found = projects.find(p => p.code.toUpperCase() === (code || '').trim().toUpperCase());
    if (!found) throw new Error('Invalid Client Code');
    setSession({ role: 'Client', code: found.code, name: found.clientName });
    return found;
  };
  const logout = async () => { try { if (window.genmb?.auth) await window.genmb.auth.signOut(); } catch {} setSession(null); };
  const upsertOwner = owner => { const clean = (owner || 'Others').trim() || 'Others'; setOwners(prev => prev.includes(clean) ? prev : [...prev, clean]); return clean; };
  const createProject = form => setProjects(prev => { const projectOwner = upsertOwner(form.projectOwner); return [...prev, { ...form, projectOwner, code: generateCode(prev, form.mepInitial, form.architectInitial, form.clientName), createdAt: new Date().toISOString().slice(0,10), steps: createSteps() }]; });
  const updateProject = (projectCode, patch) => setProjects(prev => prev.map(p => p.code !== projectCode ? p : { ...p, ...patch, code: p.code, projectOwner: upsertOwner(patch.projectOwner || p.projectOwner) }));
  const deleteProject = projectCode => setProjects(prev => prev.filter(p => p.code !== projectCode));
  const updateStep = (projectCode, stepId, patch) => setProjects(prev => prev.map(p => p.code !== projectCode ? p : { ...p, steps: p.steps.map(s => s.id === stepId ? { ...s, ...patch } : s) }));
  const updateCollation = (projectCode, stepId, name, patch) => setProjects(prev => prev.map(p => p.code !== projectCode ? p : { ...p, steps: p.steps.map(s => s.id !== stepId ? s : { ...s, collation: (s.collation || []).map(c => c.name === name ? { ...c, ...patch } : c) }) }));

  const value = React.useMemo(() => ({ dark, setDark, projects, owners, visibleProjects, selectedProject, session, authReady, authError, sendAdminLink, clientLogin, logout, createProject, updateProject, deleteProject, updateStep, updateCollation }), [dark, projects, owners, selectedProject, visibleProjects, session, authReady, authError]);
  return html`<${AppContext.Provider} value=${value}>${children}</${AppContext.Provider}>`;
}

export function useAppShell() {
  const context = React.useContext(AppContext);
  if (!context) throw new Error('useAppShell must be used inside Providers');
  return context;
}