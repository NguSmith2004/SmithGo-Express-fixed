import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { CalendarDays, Clock3, Bus, ShieldCheck } from 'lucide-react';

export default function Book() {
  const [params] = useSearchParams();
  const [agency, setAgency] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    from: 'Douala',
    to: 'Yaoundé',
    departureDate: '',
    departureTime: '08:00',
    seatType: 'Standard',
    name: '',
    phone: '',
    email: '',
    idNumber: '',
    amount: 5000,
  });

  const { user } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    api('/agencies')
      .then((agencies) =>
        setAgency(agencies.find((x) => x._id === params.get('agency')))
      )
      .catch((e) => setError(e.message));
  }, [params]);

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        name: user.name,
        phone: user.phone || '',
        email: user.email,
      }));
    }
  }, [user]);

  if (!agency) {
    return (
      <main className="page">
        <div className="empty">Loading agency...</div>
      </main>
    );
  }

  const set = (key) => (e) => {
    setForm({
      ...form,
      [key]: e.target.value,
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!user) {
      return nav('/login', {
        state: {
          from: location.pathname + location.search,
        },
      });
    }

    setLoading(true);

    try {
      // Create the booking
      const booking = await api('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          agency: agency._id,

          trip: {
            from: form.from,
            to: form.to,
            departureDate: form.departureDate,
            departureTime: form.departureTime,
            seatType: form.seatType,
          },

          passenger: {
            name: form.name,
            phone: form.phone,
            email: form.email,
            idNumber: form.idNumber,
          },

          amount: Number(form.amount),
        }),
      });

      // ADMIN BOOKINGS:
      // Administrators can issue a ticket without payment.
      if (booking.adminBooking) {
        window.location.assign(
          `/confirmation?bookingId=${booking._id}`
        );
        return;
      }

      // CUSTOMER BOOKINGS:
      // Customers continue to Flutterwave checkout.
      const checkout = await api('/payments/create-checkout', {
        method: 'POST',
        body: JSON.stringify({
          bookingId: booking._id,
        }),
      });

      if (!checkout.checkoutUrl) {
        throw new Error(
          'Flutterwave did not return a checkout link.'
        );
      }

      window.location.assign(checkout.checkoutUrl);
    } catch (err) {
      setError(
        err.message ||
          'Unable to start payment. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <div className="pagehead">
        <span className="eyebrow">RESERVE YOUR SEAT</span>

        <h1>Book with {agency.name}</h1>

        <p>
          Complete your journey details. Customers continue to
          secure payment through Flutterwave; administrators can
          issue a ticket directly.
        </p>
      </div>

      <form className="booking" onSubmit={submit}>
        <section>
          <h3>Journey</h3>

          <div className="fields">
            <label>
              From
              <input
                value={form.from}
                onChange={set('from')}
                required
              />
            </label>

            <label>
              To
              <input
                value={form.to}
                onChange={set('to')}
                required
              />
            </label>

            <label>
              <CalendarDays />
              Departure date
              <input
                type="date"
                value={form.departureDate}
                onChange={set('departureDate')}
                required
              />
            </label>

            <label>
              <Clock3 />
              Departure time
              <input
                type="time"
                value={form.departureTime}
                onChange={set('departureTime')}
                required
              />
            </label>

            <label>
              Seat type
              <select
                value={form.seatType}
                onChange={set('seatType')}
              >
                <option>Standard</option>
                <option>VIP</option>
                <option>Premium</option>
              </select>
            </label>

            <label>
              Price (XAF)
              <input
                type="number"
                value={form.amount}
                onChange={set('amount')}
                min="100"
                required
              />
            </label>
          </div>
        </section>

        <section>
          <h3>Passenger</h3>

          <div className="fields">
            <label>
              Full name
              <input
                value={form.name}
                onChange={set('name')}
                required
              />
            </label>

            <label>
              Phone
              <input
                value={form.phone}
                onChange={set('phone')}
                required
              />
            </label>

            <label>
              Email
              <input
                type="email"
                value={form.email}
                onChange={set('email')}
                required
              />
            </label>

            <label>
              ID / Passport number
              <input
                value={form.idNumber}
                onChange={set('idNumber')}
              />
            </label>
          </div>
        </section>

        {error && <div className="errorbox">{error}</div>}

        <div className="bookingbar">
          <div>
            <small>Total</small>

            <strong>
              {Number(form.amount).toLocaleString()} XAF
            </strong>

            <span className="paynote">
              <ShieldCheck size={15} />

              {user?.role === 'admin'
                ? 'Admin ticket — no payment required'
                : 'Secure checkout via Flutterwave'}
            </span>
          </div>

          <button
            className="primary"
            disabled={loading}
          >
            {loading
              ? user?.role === 'admin'
                ? 'Creating ticket…'
                : 'Opening secure checkout…'
              : user?.role === 'admin'
                ? 'Issue ticket without payment'
                : 'Continue to payment'}

            <Bus />
          </button>
        </div>
      </form>
    </main>
  );
}