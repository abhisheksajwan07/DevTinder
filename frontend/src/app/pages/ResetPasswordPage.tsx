import { FormEvent, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../../lib/api";
import { AuthCard } from "./ForgotPasswordPage";

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    try {
      const response = await api.post("/auth/reset-password", { token: params.get("token") ?? "", newPassword });
      setMessage(response.data?.message ?? "Password reset successfully.");
    } catch (err: any) {
      setError(err.response?.data?.message ?? "This reset link is invalid or expired.");
    }
  };

  return <AuthCard title="Choose a new password" subtitle="Use at least 8 characters for your new password.">
    <form onSubmit={submit} className="mt-5 space-y-4"><input required minLength={8} type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="New password" className="w-full rounded-2xl border border-[#e2ded6] px-4 py-3 text-sm outline-none focus:border-orange-500" /><button className="w-full rounded-2xl bg-[#1a1918] py-3.5 text-sm font-bold text-white hover:bg-orange-600">Update password</button></form>
    {(message || error) && <p className={`mt-4 text-xs ${error ? "text-red-600" : "text-emerald-700"}`}>{message || error}</p>}
    {message && <Link to="/signin" className="mt-4 inline-block text-xs font-semibold text-orange-600">Continue to sign in</Link>}
  </AuthCard>;
}
