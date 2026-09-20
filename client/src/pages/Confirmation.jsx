import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { CheckCircle, Download, ArrowLeft, Smartphone, LoaderCircle, Printer, PhoneCall, Copy } from 'lucide-react';

const MERCHANT_NUMBER = '+237 678949296';
const PAYMENT_CODES = {
  orange: import.meta.env.VITE_ORANGE_MONEY_USSD_CODE || '#150#',
  mtn: import.meta.env.VITE_MTN_MOMO_USSD_CODE || '*126#'
};

export default function Confirmation() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const [booking, setBooking] = useState(null);
  const [payment, setPayment] = useState({ senderName: '', senderPhone: '', transactionReference: '', amountSent: '' });
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [operator, setOperator] = useState('orange');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api('/bookings/mine').then(items => setBooking(items.find(item => item._id === params.get('id')))).catch(requestError => setError(requestError.message));
  }, [params]);

  if (!booking) return <main className="page"><div className="empty">Loading booking...</div></main>;
  const paid = ['agency_paid', 'admin_pays'].includes(booking.paymentMethod) || booking.paymentStatus === 'paid';
  const set = key => event => setPayment(current => ({ ...current, [key]: event.target.value }));

  const openUssd = () => {
    const code = PAYMENT_CODES[operator].replace('#', '%23');
    window.location.href = `tel:${code}`;
  };

  const copyMerchant = async () => {
    await navigator.clipboard?.writeText(MERCHANT_NUMBER);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const submitPayment = async event => {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api(`/payments/booking/${booking._id}/submit`, { method: 'POST', body: JSON.stringify({ ...payment, amountSent: Number(payment.amountSent) }) });
      setBooking(current => ({ ...current, paymentStatus: 'submitted', status: 'payment_pending' }));
      setSubmitted(true);
    } catch (requestError) { setError(requestError.message); } finally { setSaving(false); }
  };

  const download = async () => {
    try {
      const blob = await api(`/bookings/${booking._id}/ticket`);
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `SmithGo-Ticket-${booking.reference}.pdf`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (requestError) { setError(requestError.message); }
  };

  return <main className="success"><div className="successcard"><CheckCircle size={62}/><span className="eyebrow">{paid ? 'BOOKING CONFIRMED' : 'PAYMENT VERIFICATION REQUIRED'}</span><h1>{paid ? 'Your trip is reserved.' : 'Your reservation is held.'}</h1><p>Booking reference <strong>{booking.reference}</strong>. {paid ? 'Your ticket is ready.' : 'Complete Mobile Money payment and wait for admin verification before your ticket is issued.'}</p>
    <div className="ticketmini"><div><small>AGENCY</small><b>{booking.agency.name}</b></div><div><small>ROUTE</small><b>{booking.trip.from} → {booking.trip.to}</b></div><div><small>DATE & TIME</small><b>{booking.trip.departureDate} · {booking.trip.departureTime}</b></div><div><small>TOTAL</small><b>{booking.amount.toLocaleString()} {booking.currency}</b></div><div><small>PAYMENT</small><b>{booking.paymentStatus}</b></div></div>
    {!paid && !submitted && <form className="paymentbox" onSubmit={submitPayment}><h3><Smartphone/> Send Mobile Money</h3><p>Send exactly <strong>{booking.amount.toLocaleString()} {booking.currency}</strong> to <strong>{MERCHANT_NUMBER}</strong>.</p><div className="paymentsteps"><label>1. Choose your operator<select value={operator} onChange={event => setOperator(event.target.value)}><option value="orange">Orange Money</option><option value="mtn">MTN MoMo</option></select></label><button type="button" className="secondary" onClick={openUssd}><PhoneCall size={17}/> Open {operator === 'orange' ? 'Orange' : 'MTN'} USSD ({PAYMENT_CODES[operator]})</button><button type="button" className="ghost" onClick={copyMerchant}><Copy size={17}/> {copied ? 'Number copied' : 'Copy merchant number'}</button><small>On a phone, this opens the dialer. Your operator may ask you to select transfer, enter the merchant number and amount, then confirm with your PIN. A website cannot enter your PIN or silently complete the transfer.</small></div><div className="fields"><label>Sender name<input required value={payment.senderName} onChange={set('senderName')}/></label><label>Sender phone<input required value={payment.senderPhone} onChange={set('senderPhone')}/></label><label>Transaction ID/reference<input required value={payment.transactionReference} onChange={set('transactionReference')}/></label><label>Amount sent<input type="number" min="0" required value={payment.amountSent} onChange={set('amountSent')}/></label></div>{error && <div className="error">{error}</div>}<button className="primary" disabled={saving}>{saving ? <><LoaderCircle className="spin" size={17}/> Submitting...</> : 'Submit payment for verification'}</button></form>}
    {!paid && submitted && <div className="paymentbox"><h3>Awaiting verification</h3><p>Your payment details were submitted. An administrator must verify the transaction before your ticket becomes available.</p></div>}
    <div className="heroactions"><button className="primary" onClick={download}><Download/> {paid ? 'Download ticket' : 'Download reservation ticket'}</button><button className="secondary" onClick={() => window.print()}><Printer/> Print</button><button className="secondary" onClick={() => nav('/bookings')}><ArrowLeft/> My trips</button></div>
  </div></main>;
}
