import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";

import AuthLayout from "@/components/AuthLayout";
import { useAuth } from "@/contexts/AuthContext";

const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("invite");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, actionLoading, setPendingInviteToken } = useAuth();
  const navigate = useNavigate();
  const authLinkSuffix = inviteToken ? `?invite=${inviteToken}` : "";

  useEffect(() => {
    if (inviteToken) {
      setPendingInviteToken(inviteToken);
    }
  }, [inviteToken, setPendingInviteToken]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await signIn(email, password);
    navigate("/dashboard");
  };

  return (
    <AuthLayout>
      <h1 className="page-header mb-2">{inviteToken ? "Sign in to accept invitation" : "Welcome Back!"}</h1>
      <p className="page-subheader mb-8">
        {inviteToken
          ? "Use the invited account to join the dorm workspace."
          : "Sign in with your DormFlow account"}
      </p>

      {inviteToken ? (
        <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground mb-6">
          This flow is for landlord-issued tenant or chef invitations. If you do not have an account yet, create one with the invited email address.
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
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
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter the password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="auth-input pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
          </div>
          <div className="text-right mt-2">
            <Link to="/forgot-password" className="text-sm font-medium text-foreground hover:text-primary">
              Forgot Password?
            </Link>
          </div>
        </div>

        <button type="submit" disabled={actionLoading} className="auth-button disabled:opacity-70">
          {actionLoading ? "Signing in..." : inviteToken ? "Sign in and join dorm" : "Sign in"}
        </button>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don&apos;t have an account?{" "}
          <Link to={`/register${authLinkSuffix}`} className="text-primary font-medium hover:underline">
            Create account
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
