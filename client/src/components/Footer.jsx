import { Link } from 'react-router-dom';

export default function Footer() {
  return <footer className="footer"><div><strong>SmithGo Express</strong><span>Transportation booking infrastructure for Cameroon.</span></div><nav><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link><Link to="/payment-policy">Payment policy</Link><Link to="/cancellation-policy">Cancellations</Link><Link to="/faq">FAQ</Link><Link to="/legal-compliance">Legal & compliance</Link></nav><small>Support: [ngusmith4@gmail.com]</small></footer>;
}
