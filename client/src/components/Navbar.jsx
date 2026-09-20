import { Link, useNavigate } from 'react-router-dom';
import { Bell, Bus, Menu, X, UserCircle, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const { user, logout } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (!user) return setUnread(0);
    api('/notifications/unread').then(data => setUnread(data.count)).catch(() => setUnread(0));
  }, [user]);

  return <header className="nav"><Link className="brand" to="/"><span className="brandmark"><Bus size={20}/></span><span>SmithGo<span> Express</span></span></Link><button className="menu" onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button><nav className={open ? 'navlinks show' : 'navlinks'}><Link to="/" onClick={() => setOpen(false)}>Home</Link><Link to="/agencies" onClick={() => setOpen(false)}>Agencies</Link>{user && <Link to="/bookings" onClick={() => setOpen(false)}>My Trips</Link>}{user && <button className="ghost notification" title="Unread notifications" onClick={() => nav('/bookings')}><Bell size={17}/>{unread > 0 && <b>{unread}</b>}</button>}{user?.role === 'admin' && <Link to="/admin" onClick={() => setOpen(false)}>Admin</Link>}{user ? <button className="ghost" onClick={() => { logout(); nav('/'); }}><LogOut size={16}/> Logout</button> : <button className="primary small" onClick={() => nav('/login')}><UserCircle size={17}/> Sign in</button>}</nav></header>;
}
