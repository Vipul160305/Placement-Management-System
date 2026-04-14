import { useState, type FormEvent } from "react";
import { GraduationCap, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../services/api";
import { useToast } from "../context/ToastContext";

const ForgotPassword = () => {
  const { addToast } = useToast();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Request failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/60 px-6">
      <div className="w-full max-w-[380px]">
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#003466" }}>
            <GraduationCap size={18} className="text-white" />
          </div>
          <span className="font-manrope font-bold text-gray-900 text-lg">ScholarFlow</span>
        </div>

        {sent ? (
          <div className="card text-center py-8 space-y-3">
            <CheckCircle2 size={40} className="text-green-500 mx-auto" />
            <h2 className="font-manrope font-bold text-xl text-gray-900">Check your email</h2>
            <p className="text-sm text-gray-500">
              If <strong>{email}</strong> is registered, you'll receive a password reset link shortly.
            </p>
            <Link to="/login" className="text-sm text-primary font-medium hover:underline block mt-2">
              Back to login
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-7">
              <h2 className="font-manrope font-bold text-2xl text-gray-900">Forgot password?</h2>
              <p className="text-gray-400 text-sm mt-1.5">Enter your email and we'll send a reset link.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@institute.edu"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                />
              </div>
              <button type="submit" disabled={submitting}
                className="w-full btn-primary flex items-center justify-center gap-2 py-3 rounded-xl disabled:opacity-60">
                {submitting ? <Loader2 size={18} className="animate-spin" /> : null}
                {submitting ? "Sending…" : "Send reset link"}
              </button>
            </form>
            <Link to="/login" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mt-5 transition-colors">
              <ArrowLeft size={15} /> Back to login
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
