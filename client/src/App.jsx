import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Agencies from "./pages/Agencies";
import Auth from "./pages/Auth";
import Book from "./pages/Book";
import Bookings from "./pages/Bookings";
import Admin from "./pages/Admin";
import Confirmation from "./pages/Confirmation";
import Footer from "./components/Footer";
import LegalPage from "./pages/LegalPage";
import { useAuth } from "./context/AuthContext";

function RequireAuth({ children, adminOnly = false }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  }
  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return children;
}

function NotFound() {
  return (
    <main className="page">
      <div className="empty">
        <h1>404 — Page Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
      </div>
    </main>
  );
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/agencies" element={<Agencies />} />
        <Route path="/login" element={<Auth mode="login" />} />
        <Route path="/register" element={<Auth mode="register" />} />
        {/* Book.jsx already redirects to /login on submit if not signed in,
            so browsing/filling the form anonymously is intentionally allowed. */}
        <Route path="/book" element={<Book />} />
        <Route
          path="/bookings"
          element={
            <RequireAuth>
              <Bookings />
            </RequireAuth>
          }
        />
        <Route
          path="/confirmation"
          element={
            <RequireAuth>
              <Confirmation />
            </RequireAuth>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAuth adminOnly>
              <Admin />
            </RequireAuth>
          }
        />
        <Route path="/privacy" element={<LegalPage type="privacy" />} />
        <Route path="/terms" element={<LegalPage type="terms" />} />
        <Route path="/payment-policy" element={<LegalPage type="payment" />} />
        <Route path="/cancellation-policy" element={<LegalPage type="cancellation" />} />
        <Route path="/faq" element={<LegalPage type="faq" />} />
        <Route path="/legal-compliance" element={<LegalPage type="compliance" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  );
}
