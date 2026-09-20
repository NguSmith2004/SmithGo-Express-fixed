import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { CalendarDays, Clock3, Bus, LoaderCircle } from 'lucide-react';

export default function Book() {
  const [params] = useSearchParams();
  const location = useLocation();
  const nav = useNavigate();
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [form, setForm] = useState({ schedule: '', seats: 1, seatType: 'Standard', name: '', phone: '', email: '', idNumber: '', paymentMode: 'customer_pays' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const agencyId = params.get('agency');
    const query = agencyId ? `?agency=${agencyId}` : '';
    api('/schedules' + query)
      .then(items => {
        setSchedules(items);
        setForm(current => ({ ...current, schedule: items[0]?._id || '' }));
      })
      .catch(requestError => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [params]);

  useEffect(() => {
    if (user) setForm(current => ({ ...current, name: user.name, phone: user.phone || '', email: user.email }));
  }, [user]);

  const selectedSchedule = schedules.find(schedule => schedule._id === form.schedule);
  const total = selectedSchedule ? selectedSchedule.price * Number(form.seats || 1) : 0;
  const set = key => event => setForm(current => ({ ...current, [key]: event.target.value }));

  const submit = async event => {
    event.preventDefault();
    setError('');
    if (!user) return nav('/login', { state: { from: location.pathname + location.search } });
    setSaving(true);
    try {
      const booking = await api('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          schedule: form.schedule,
          seats: Number(form.seats),
          seatType: form.seatType,
          paymentMode: form.paymentMode,
          passenger: { name: form.name, phone: form.phone, email: form.email, idNumber: form.idNumber }
        })
      });
      nav('/confirmation?id=' + booking._id);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <main className="page"><div className="empty">Loading available departures...</div></main>;
  if (error && !schedules.length) return <main className="page"><div className="empty error">{error}</div></main>;

  return <main className="page">
    <div className="pagehead"><span className="eyebrow">LIVE AVAILABILITY</span><h1>Reserve your journey</h1><p>Choose an available departure. Fares and remaining seats are verified by the booking server.</p></div>
    <form className="booking" onSubmit={submit}>
      <section><h3>Choose a departure</h3><div className="fields">
        <label className="wide">Departure<select value={form.schedule} onChange={set('schedule')} required><option value="">Select a departure</option>{schedules.map(schedule => <option key={schedule._id} value={schedule._id}>{schedule.from} to {schedule.to} · {schedule.departureDate} at {schedule.departureTime} · {schedule.price.toLocaleString()} {schedule.currency} · {schedule.availableSeats} left</option>)}</select></label>
        <label>Seats<select value={form.seats} onChange={set('seats')}>{Array.from({ length: Math.min(selectedSchedule?.availableSeats || 1, 8) }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}</select></label>
        <label>Seat type<select value={form.seatType} onChange={set('seatType')}><option>Standard</option><option>VIP</option></select></label>
        {user?.role === 'admin' && <label>Admin payment responsibility<select value={form.paymentMode} onChange={set('paymentMode')}><option value="customer_pays">Customer pays Mobile Money</option><option value="agency_paid">Agency paid</option><option value="admin_pays">I will pay</option></select></label>}
        {form.paymentMode === 'customer_pays' && <label>Payment method<input value="Mobile Money" readOnly /></label>}
      </div>{selectedSchedule && <div className="bookingnote"><CalendarDays size={17}/> {selectedSchedule.departureDate} <Clock3 size={17}/> {selectedSchedule.departureTime}<strong>{selectedSchedule.availableSeats} seats remaining</strong></div>}</section>
      <section><h3>Passenger details</h3><div className="fields">
        <label>Full name<input value={form.name} onChange={set('name')} required /></label><label>Phone number<input value={form.phone} onChange={set('phone')} required /></label><label>Email<input type="email" value={form.email} onChange={set('email')} required /></label><label>ID / passport number<input value={form.idNumber} onChange={set('idNumber')} required /></label>
      </div></section>
      {error && <div className="error">{error}</div>}
      <div className="bookingfoot"><div><strong>{total.toLocaleString()} XAF</strong><span>Payment required before ticket issue</span></div><button className="primary" disabled={saving || !selectedSchedule}>{saving ? <><LoaderCircle className="spin" size={18}/> Reserving...</> : <>Continue to payment <Bus size={18}/></>}</button></div>
    </form>
  </main>;
}
