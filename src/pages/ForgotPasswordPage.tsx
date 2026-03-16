import { useState } from "react";
import { Link } from "react-router-dom";
import { KeyRound, Mail } from "lucide-react";

import AuthLayout from "@/components/AuthLayout";
import { useAuth } from "@/contexts/AuthContext";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const { resetPassword, actionLoading } = useAuth();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await resetPassword(email);
    setSent(true);
  };

  return (
    <AuthLayout>
      <div className="flex items-center gap-2 mb-4">
        <KeyRound className="h-8 w-8 text-primary" />
        <h1 className="page-header">Forgot password?</h1>
      </div>

      {sent ? (
        <div className="space-y-6">
          <p className="text-muted-foreground">
            Reset instructions were sent to <strong className="text-foreground">{email}</strong>.
          </p>
          <Link to="/login" className="auth-button block text-center leading-[3rem]">
            Back to login
          </Link>
        </div>
      ) : (
        <>
          <p className="text-muted-foreground mb-8">
            Enter the email you used for DormFlow and we&apos;ll send a password reset link.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                placeholder="Enter the email address"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="auth-input"
                required
              />
            </div>

            <button type="submit" disabled={actionLoading} className="auth-button disabled:opacity-70">
              {actionLoading ? "Sending..." : "Send reset link"}
            </button>
            <Link to="/login" className="auth-button-outline block text-center leading-[3rem]">
              Cancel
            </Link>
          </form>
        </>
      )}
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
