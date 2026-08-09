import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import { api } from "../../lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    try {
      const response = await api.post("/auth/forgot-password", { email });
      setMessage(response.data?.message ?? "If this email exists, a reset link will be sent.");
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Unable to send the reset link.");
    }
  };

  return <AuthCard title="Reset your password" subtitle="Enter your email and we’ll send you a password reset link.">
    <form onSubmit={submit} className="space-y-4">
      <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="w-full rounded-2xl border border-[#e2ded6] px-4 py-3 text-sm outline-none focus:border-orange-500" />
      <button className="w-full rounded-2xl bg-[#1a1918] py-3.5 text-sm font-bold text-white hover:bg-orange-600"><Mail className="mr-2 inline size-4" />Send reset link</button>
    </form>
    {(message || error) && <p className={`mt-4 text-xs ${error ? "text-red-600" : "text-emerald-700"}`}>{message || error}</p>}
    <Link to="/signin" className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-orange-600"><ArrowLeft className="size-3.5" />Back to sign in</Link>
  </AuthCard>;
}

export function AuthCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <main className="grid min-h-screen place-items-center bg-[#f5f2eb] px-4"><div className="w-full max-w-md rounded-[28px] border border-[#e9e5df] bg-white p-7 shadow-sm sm:p-9"><h1 className="text-2xl font-bold text-[#242322]">{title}</h1><p className="mt-2 text-sm text-[#77736e]">{subtitle}</p>{children}</div></main>;
}
