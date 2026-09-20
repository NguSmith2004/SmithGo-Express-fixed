import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Download, MapPin, CalendarDays, XCircle, LoaderCircle } from 'lucide-react';

export default function Bookings() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState('');
  const [filter, setFilter] = useState('all');

  const load = () => api('/bookings/mine').then(setItems).catch(requestError => setError(requestError.message)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const ticket = async booking => {
    try {
      const blob = await api(`/bookings/${booking._id}/ticket`);
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `SmithGo-Ticket-${booking.reference}.pdf`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (requestError) { setError(requestError.message); }
  };

  const cancel = async booking => {
    if (!window.confirm('Cancel this reservation? Any held seats will be released.')) return;
    setWorking(booking._id);
    try { await api(`/bookings/${booking._id}/cancel`, { method: 'PATCH' }); await load(); } catch (requestError) { setError(requestError.message); } finally { setWorking(''); }
  };

  if (loading) return <main className="page"><div className="empty">Loading your trips...</div></main>;
  const today = new Date().toISOString().slice(0, 10);
  const visible = items.filter(booking => filter === 'all' || (filter === 'upcoming' && booking.trip.departureDate >= today && booking.status !== 'cancelled') || (filter === 'past' && booking.trip.departureDate < today) || (filter === 'cancelled' && booking.status === 'cancelled'));
  return <main className="page"><div className="pagehead"><span className="eyebrow">YOUR ACCOUNT</span><h1>My trips</h1><p>Review reservations, download tickets, or release a seat before departure.</p></div>{error && <div className="error">{error}</div>}<div className="tripfilters">{['all', 'upcoming', 'past', 'cancelled'].map(option => <button key={option} className={filter === option ? 'primary small' : 'secondary small'} onClick={() => setFilter(option)}>{option[0].toUpperCase() + option.slice(1)}</button>)}</div><div className="triplist">{visible.map(booking => <article className="trip" key={booking._id}><div className="tripmain"><span className="pill">{booking.status} · {booking.paymentStatus}</span><h3>{booking.trip.from} <span>→</span> {booking.trip.to}</h3><div className="tripmeta"><span><CalendarDays/> {booking.trip.departureDate} · {booking.trip.departureTime}</span><span><MapPin/> {booking.agency.name}</span><span>{booking.seats || 1} seat(s) · {booking.amount.toLocaleString()} {booking.currency}</span></div><small>Reference: {booking.reference}</small></div><div className="tripactions"><button className="secondary" onClick={() => ticket(booking)}><Download/> Ticket</button>{booking.status === 'confirmed' && <button className="ghost" disabled={working === booking._id} onClick={() => cancel(booking)}>{working === booking._id ? <LoaderCircle className="spin" size={17}/> : <XCircle size={17}/>} Cancel</button>}</div></article>)}{!visible.length && <div className="empty">No trips in this view.</div>}</div></main>;
}
