import { useState, type FormEvent } from "react";
import { GraduationCap, Loader2, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { registerStudent } from "../services/api";
import { useToast } from "../context/ToastContext";

const BLANK = { name: "", email: "", password: "", department: "", section: "", branch: "", cgpa: "", backlogCount: "0" };

const Register = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState(BLANK);
  const [submitting, setSubmitting] = useState(false);

  const f = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) { addToast("Password must be at least 6 characters", "error"); return; }
    setSubmitting(true);
    try {
      await registerStudent({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        department: form.department.trim() || undefined,
        section: form.section.trim() || undefined,
        branch: form.branch.trim() || undefined,
        cgpa: form.cgpa !== "" ? Number(form.cgpa) : undefined,
        backlogCount: Number(form.backlogCount) || 0,
      });
      addToast("Account created! Please log in.", "success");
      navigate("/login");
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Registration failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/60 px-6 py-12">
      <div className="w-full max-w-[420px]">
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#003466" }}>
            <GraduationCap size={18} className="text-white" />
          </div>
          <span className="font-manrope font-bold text-gray-900 text-lg">ScholarFlow</span>
        </div>

        <div className="mb-7">
          <h2 className="font-manrope font-bold text-2xl text-gray-900">Create student account</h2>
          <p className="text-gray-400 text-sm mt-1.5">Fill in your academic details to get started.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { field: "name" as const,         label: "Full Name",       type: "text",   placeholder: "Arjun Sharma",       colSpan: true,  required: true  },
              { field: "email" as const,        label: "Email",           type: "email",  placeholder: "you@college.edu",    colSpan: true,  required: true  },
              { field: "password" as const,     label: "Password",        type: "password",placeholder: "Min 6 characters",  colSpan: true,  required: true  },
              { field: "department" as const,   label: "Department",      type: "text",   placeholder: "e.g. CSE",           colSpan: false, required: false },
              { field: "section" as const,      label: "Section",         type: "text",   placeholder: "e.g. A",             colSpan: false, required: false },
              { field: "branch" as const,       label: "Branch",          type: "text",   placeholder: "e.g. Computer Sci.", colSpan: false, required: false },
              { field: "cgpa" as const,         label: "CGPA",            type: "number", placeholder: "e.g. 8.5",           colSpan: false, required: false },
              { field: "backlogCount" as const, label: "Active Backlogs", type: "number", placeholder: "0",                  colSpan: false, required: false },
            ].map((item) => (
              <div key={item.field} className={item.colSpan ? "col-span-2" : ""}>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                  {item.label}{item.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <input
                  type={item.type}
                  required={item.required}
                  value={form[item.field]}
                  onChange={f(item.field)}
                  placeholder={item.placeholder}
                  step={item.field === "cgpa" ? "0.01" : undefined}
                  min={item.field === "cgpa" ? "0" : item.field === "backlogCount" ? "0" : undefined}
                  max={item.field === "cgpa" ? "10" : undefined}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                />
              </div>
            ))}
          </div>

          <button type="submit" disabled={submitting}
            className="w-full btn-primary flex items-center justify-center gap-2 py-3 rounded-xl disabled:opacity-60 mt-2">
            {submitting ? <Loader2 size={18} className="animate-spin" /> : null}
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <Link to="/login" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mt-5 transition-colors">
          <ArrowLeft size={15} /> Already have an account? Sign in
        </Link>
      </div>
    </div>
  );
};

export default Register;
