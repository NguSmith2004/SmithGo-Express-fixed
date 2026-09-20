import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { CalendarPlus, Clock3, Archive, Users, Ticket, Building2 } from 'lucide-react';

const emptyAgency = { name: '', description: '', phone: '', email: '', address: '', website: '', logo: '', routes: '' };
const emptySchedule = { agency: '', from: '', to: '', departureDate: '', departureTime: '08:00', durationMinutes: 180, price: 5000, capacity: 45, currency: 'XAF' };

export default function Admin() {
  const [agencies, setAgencies] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState([]);
  const [agencyForm, setAgencyForm] = useState(emptyAgency);
  const [scheduleForm, setScheduleForm] = useState(emptySchedule);
  const [agencyEdit, setAgencyEdit] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const [agencyItems, scheduleItems, bookingItems, paymentItems, userItems] = await Promise.all([api('/agencies/manage'), api('/schedules/manage'), api('/bookings/all'), api('/payments'), api('/users')]);
      setAgencies(agencyItems);
      setSchedules(scheduleItems);
      setBookings(bookingItems);
      setPayments(paymentItems);
      setUsers(userItems);
      setScheduleForm(current => ({ ...current, agency: current.agency || agencyItems[0]?._id || '' }));
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  useEffect(() => { load(); }, []);

  const saveAgency = async event => {
    event.preventDefault();
    setError('');
    try {
      const data = { ...agencyForm, routes: agencyForm.routes.split(',').map(route => route.trim()).filter(Boolean) };
      await api(agencyEdit ? `/agencies/${agencyEdit}` : '/agencies', { method: agencyEdit ? 'PUT' : 'POST', body: JSON.stringify(data) });
      setAgencyForm(emptyAgency);
      setAgencyEdit(null);
      setMessage('Agency saved');
      await load();
    } catch (requestError) { setError(requestError.message); }
  };

  const publishSchedule = async event => {
    event.preventDefault();
    setError('');
    try {
      await api('/schedules', { method: 'POST', body: JSON.stringify({ ...scheduleForm, price: Number(scheduleForm.price), capacity: Number(scheduleForm.capacity), durationMinutes: Number(scheduleForm.durationMinutes) }) });
      setMessage('Departure published');
      setScheduleForm(current => ({ ...emptySchedule, agency: current.agency }));
      await load();
    } catch (requestError) { setError(requestError.message); }
  };

  const archiveSchedule = async id => {
    if (!window.confirm('Archive this departure? New customers will no longer see it.')) return;
    try { await api(`/schedules/${id}`, { method: 'DELETE' }); setMessage('Departure archived'); await load(); } catch (requestError) { setError(requestError.message); }
  };

  const verifyPayment = async (payment, status) => {
    try { await api(`/payments/${payment._id}/verify`, { method: 'PATCH', body: JSON.stringify({ status }) }); setMessage(`Payment ${status}`); await load(); } catch (requestError) { setError(requestError.message); }
  };

  const updateUser = async (user, updates) => {
    try { await api(`/users/${user._id}`, { method: 'PATCH', body: JSON.stringify(updates) }); setMessage('User updated'); await load(); } catch (requestError) { setError(requestError.message); }
  };

  return <main className="page">
    <div className="pagehead"><span className="eyebrow">OPERATIONS</span><h1>Booking control center</h1><p>Publish real departures, manage operators, and monitor reservations from one place.</p></div>
    {message && <div className="success">{message}</div>}{error && <div className="error">{error}</div>}
    <div className="adminstats"><div><Users/><b>{bookings.length}</b><span>Total bookings</span></div><div><Ticket/><b>{bookings.filter(item => item.status === 'confirmed').length}</b><span>Active reservations</span></div><div><Building2/><b>{agencies.length}</b><span>Agencies</span></div></div>
    <div className="adminlayout">
      <section className="panel"><div className="panelhead"><h2>Publish a departure</h2><CalendarPlus/></div><form className="fields" onSubmit={publishSchedule}>
        <label>Agency<select required value={scheduleForm.agency} onChange={event => setScheduleForm({ ...scheduleForm, agency: event.target.value })}><option value="">Select agency</option>{agencies.map(agency => <option key={agency._id} value={agency._id}>{agency.name}</option>)}</select></label>
        <label>From<input required value={scheduleForm.from} onChange={event => setScheduleForm({ ...scheduleForm, from: event.target.value })}/></label><label>To<input required value={scheduleForm.to} onChange={event => setScheduleForm({ ...scheduleForm, to: event.target.value })}/></label>
        <label>Departure date<input type="date" required value={scheduleForm.departureDate} onChange={event => setScheduleForm({ ...scheduleForm, departureDate: event.target.value })}/></label><label><Clock3/> Departure time<input type="time" required value={scheduleForm.departureTime} onChange={event => setScheduleForm({ ...scheduleForm, departureTime: event.target.value })}/></label>
        <label>Price<input type="number" min="0" required value={scheduleForm.price} onChange={event => setScheduleForm({ ...scheduleForm, price: event.target.value })}/></label><label>Capacity<input type="number" min="1" required value={scheduleForm.capacity} onChange={event => setScheduleForm({ ...scheduleForm, capacity: event.target.value })}/></label>
        <button className="primary wide">Publish departure</button>
      </form></section>
      <section className="panel"><div className="panelhead"><h2>{agencyEdit ? 'Edit agency' : 'Add agency'}</h2></div><form className="fields" onSubmit={saveAgency}>
        <label>Agency name<input required value={agencyForm.name} onChange={event => setAgencyForm({ ...agencyForm, name: event.target.value })}/></label><label>Description<textarea value={agencyForm.description} onChange={event => setAgencyForm({ ...agencyForm, description: event.target.value })}/></label><label>Phone<input value={agencyForm.phone} onChange={event => setAgencyForm({ ...agencyForm, phone: event.target.value })}/></label><label>Email<input type="email" value={agencyForm.email} onChange={event => setAgencyForm({ ...agencyForm, email: event.target.value })}/></label><label>Address<input value={agencyForm.address} onChange={event => setAgencyForm({ ...agencyForm, address: event.target.value })}/></label><label>Routes<input placeholder="Douala, Yaounde" value={agencyForm.routes} onChange={event => setAgencyForm({ ...agencyForm, routes: event.target.value })}/></label><button className="primary wide">{agencyEdit ? 'Update agency' : 'Add agency'}</button>
      </form></section>
    </div>
    <section className="panel adminlist"><div className="panelhead"><h2>Published departures</h2><span>{schedules.length} total</span></div>{schedules.map(schedule => <div className="adminrow" key={schedule._id}><div><b>{schedule.from} to {schedule.to}</b><span>{schedule.agency?.name} · {schedule.departureDate} at {schedule.departureTime} · {schedule.price.toLocaleString()} {schedule.currency}</span></div><div><span>{schedule.availableSeats}/{schedule.capacity} seats</span><button className="iconbtn" title="Archive departure" onClick={() => archiveSchedule(schedule._id)}><Archive size={17}/></button></div></div>)}{!schedules.length && <div className="empty">Publish the first departure above.</div>}</section>
    <section className="panel adminlist"><div className="panelhead"><h2>Payment verification</h2><span>{payments.filter(payment => payment.status === 'submitted').length} awaiting review</span></div>{payments.map(payment => <div className="adminrow" key={payment._id}><div><b>{payment.booking?.reference || 'Booking'} · {payment.transactionReference || payment.method}</b><span>{payment.user?.name} · {payment.amount.toLocaleString()} {payment.currency} · {payment.senderPhone || payment.verificationNote || 'Sponsored'}</span></div><div><span className="pill">{payment.status}</span>{payment.status === 'submitted' && <><button className="primary small" onClick={() => verifyPayment(payment, 'paid')}>Verify</button><button className="ghost small" onClick={() => verifyPayment(payment, 'failed')}>Reject</button></>}</div></div>)}{!payments.length && <div className="empty">Submitted payments will appear here.</div>}</section>
    <section className="panel adminlist"><div className="panelhead"><h2>User management</h2><span>{users.length} accounts</span></div>{users.map(user => <div className="adminrow" key={user._id}><div><b>{user.name}</b><span>{user.email} · {user.phone || 'No phone'} · {user.active === false ? 'Inactive' : 'Active'}</span></div><div><select value={user.role} onChange={event => updateUser(user, { role: event.target.value })}><option value="customer">Customer</option><option value="agency_manager">Agency manager</option><option value="admin">Admin</option></select><button className="ghost small" onClick={() => updateUser(user, { active: user.active === false })}>{user.active === false ? 'Activate' : 'Deactivate'}</button></div></div>)}{!users.length && <div className="empty">Registered users will appear here.</div>}</section>
    <section className="panel adminlist"><div className="panelhead"><h2>Recent bookings</h2><span>{bookings.length} total</span></div>{bookings.slice(0, 12).map(booking => <div className="adminrow" key={booking._id}><div><b>{booking.reference} · {booking.trip.from} to {booking.trip.to}</b><span>{booking.user?.name || booking.passenger?.name} · {booking.trip.departureDate} · {booking.amount.toLocaleString()} {booking.currency}</span></div><span className="pill">{booking.status}</span></div>)}{!bookings.length && <div className="empty">Bookings will appear here as customers reserve seats.</div>}</section>
  </main>;
}
