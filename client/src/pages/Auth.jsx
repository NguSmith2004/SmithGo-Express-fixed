import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

export default function Auth({ mode = "login" }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    termsAccepted: false,
  });

  const [err, setErr] = useState("");

  const { login, register } = useAuth();
  const nav = useNavigate();
  const location = useLocation();

  const set = (key) => (event) => {
    const value =
      event.target.type === "checkbox"
        ? event.target.checked
        : event.target.value;

    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setErr("");

    try {
      if (mode === "login") {
        await login({
          email: form.email,
          password: form.password,
        });
      } else {
        if (!form.termsAccepted) {
          setErr(
            "Please accept the Terms and Privacy Notice before creating your account."
          );
          return;
        }

        await register({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          termsAccepted: form.termsAccepted,
        });
      }

      nav(location.state?.from || "/agencies");
    } catch (error) {
      setErr(error.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <main className="authpage">
      <motion.div
        className="authcard"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="eyebrow">SMITHGO EXPRESS</span>

        <h1>
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>

        <p>
          {mode === "login"
            ? "Sign in to manage your trips."
            : "Book faster and keep every ticket in one place."}
        </p>

        <form onSubmit={submit}>
          {mode !== "login" && (
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Full name"
              required
              value={form.name}
              onChange={set("name")}
              autoComplete="name"
            />
          )}

          <input
            id="email"
            name="email"
            type="email"
            placeholder="Email address"
            required
            value={form.email}
            onChange={set("email")}
            autoComplete="email"
          />

          {mode !== "login" && (
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="Phone number"
              value={form.phone}
              onChange={set("phone")}
              autoComplete="tel"
            />
          )}

          <input
            id="password"
            name="password"
            type="password"
            placeholder="Password"
            required
            minLength="6"
            value={form.password}
            onChange={set("password")}
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
          />

          {mode !== "login" && (
            <label className="checkline" htmlFor="termsAccepted">
              <input
                id="termsAccepted"
                name="termsAccepted"
                type="checkbox"
                checked={form.termsAccepted}
                onChange={set("termsAccepted")}
                required
              />

              <span>
                I accept the{" "}
                <Link to="/terms">Terms</Link> and have read the{" "}
                <Link to="/privacy">Privacy Notice</Link>.
              </span>
            </label>
          )}

          {err && <div className="error">{err}</div>}

          <button type="submit" className="primary full">
            {mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="switch">
          {mode === "login" ? (
            <>
              New here? <Link to="/register">Create an account</Link>
            </>
          ) : (
            <>
              Already registered? <Link to="/login">Sign in</Link>
            </>
          )}
        </div>
      </motion.div>
    </main>
  );
}