import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function Auth({ mode = 'login' }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', termsAccepted: false });
  const [err, setErr] = useState('');
  const { login, register } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const set = key => event => setForm(current => ({ ...current, [key]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }));

  const submit = async event => {
    event.preventDefault();
    setErr('');
    try {
      if (mode === 'login') await login({ email: form.email, password: form.password });
      else await register(form);
      nav(location.state?.from || '/agencies');
    } catch (error) { setErr(error.message); }
  };

  return <main className="authpage"><motion.div className="authcard" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}><span className="eyebrow">SMITHGO EXPRESS</span><h1>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1><p>{mode === 'login' ? 'Sign in to manage your trips.' : 'Book faster and keep every ticket in one place.'}</p><form onSubmit={submit}>{mode !== 'login' && <input placeholder="Full name" required value={form.name} onChange={set('name')} />}<input type="email" placeholder="Email address" required value={form.email} onChange={set('email')} />{mode !== 'login' && <input placeholder="Phone number" value={form.phone} onChange={set('phone')} />}<input type="password" placeholder="Password" required minLength="6" value={form.password} onChange={set('password')} />{mode !== 'login' && <label className="checkline"><input type="checkbox" checked={form.termsAccepted} onChange={set('termsAccepted')} required /> <span>I accept the <Link to="/terms">Terms</Link> and have read the <Link to="/privacy">Privacy Notice</Link>.</span></label>}{err && <div className="error">{err}</div>}<button className="primary full">{mode === 'login' ? 'Sign in' : 'Create account'}</button></form><div className="switch">{mode === 'login' ? <>New here? <Link to="/register">Create an account</Link></> : <>Already registered? <Link to="/login">Sign in</Link></>}</div></motion.div></main>;
}
