import {useEffect,useState} from 'react';
import {useSearchParams,useNavigate} from 'react-router-dom';
import {api} from '../lib/api';
import {CheckCircle,AlertCircle,Clock3,Download,ArrowLeft,RefreshCw} from 'lucide-react';

export default function PaymentResult(){
  const [p]=useSearchParams();const nav=useNavigate();const bookingId=p.get('bookingId');const [data,setData]=useState(null);const [error,setError]=useState('');
  const load=async()=>{try{const x=await api(`/payments/status/${bookingId}`);setData(x);setError('')}catch(e){setError(e.message)}};
  useEffect(()=>{if(!bookingId)return;load();const id=setInterval(load,4000);return()=>clearInterval(id)},[bookingId]);
  const download=async()=>{const blob=await api(`/bookings/${bookingId}/ticket`);const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`${data.booking.reference}.pdf`;a.click();URL.revokeObjectURL(url)};
  if(!bookingId)return <main className="page"><div className="empty"><AlertCircle/> Missing booking reference.</div></main>;
  const status=data?.payment?.status;
  const success=status==='SUCCESS';const failed=['FAILED','CANCELLED'].includes(status);const pending=!success&&!failed;
  return <main className="success"><div className="successcard">{success?<CheckCircle size={62}/>:failed?<AlertCircle size={62}/>:<Clock3 size={62}/>}<span className="eyebrow">{success?'PAYMENT CONFIRMED':failed?'PAYMENT NOT COMPLETED':'PAYMENT PROCESSING'}</span><h1>{success?'Your ticket is ready.':failed?'Payment was not completed.':'We are confirming your payment.'}</h1><p>{success?'Your Flutterwave payment has been verified. Your booking is now confirmed.':failed?(data?.payment?.failureReason||'You can return to your trips and try again with a new payment.'): 'Mobile Money payments can take a little time to complete. SmithGo will confirm the booking only after Flutterwave verification.'}</p>{data?.booking&&<div className="ticketmini"><div><small>REFERENCE</small><b>{data.booking.reference}</b></div><div><small>PAYMENT</small><b>{data.payment.status}</b></div><div><small>AMOUNT</small><b>{Number(data.payment.amount).toLocaleString()} XAF</b></div><div><small>ROUTE</small><b>{data.booking.trip.from} → {data.booking.trip.to}</b></div></div>}{error&&<div className="errorbox">{error}</div>}<div className="heroactions">{success&&<button className="primary" onClick={download}><Download/> Download ticket</button>}{pending&&<button className="secondary" onClick={load}><RefreshCw/> Check again</button>}<button className="secondary" onClick={()=>nav('/bookings')}><ArrowLeft/> My trips</button></div></div></main>
}
