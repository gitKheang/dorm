import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Check, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { toast } from "sonner";

import AuthLayout from "@/components/AuthLayout";
import { useAuth } from "@/contexts/AuthContext";

const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("invite");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const { signUp, actionLoading, setPendingInviteToken } = useAuth();
  const navigate = useNavigate();
  const authLinkSuffix = inviteToken ? `?invite=${inviteToken}` : "";

  useEffect(() => {
    if (inviteToken) {
      setPendingInviteToken(inviteToken);
    }
  }, [inviteToken, setPendingInviteToken]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!acceptTerms) {
      toast.error("You must accept the terms before continuing");
      return;
    }

    await signUp({ email, password, firstName, lastName });
    navigate(`/login${authLinkSuffix}`);
  };

  return (
    <AuthLayout>
      <h1 className="page-header text-center mb-1">{inviteToken ? "Accept invitation" : "Create landlord account"}</h1>
      <p className="page-subheader text-center mb-8">
        {inviteToken
          ? "Create your account with the same email that received the landlord invitation."
          : "Create your account, then create your first dorm workspace as landlord."}
      </p>

      <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground mb-6">
        {inviteToken
          ? "Tenant and chef access is created by landlord invitation. After sign-in, the invite will attach this account to the correct dorm."
          : "Self-registration is for landlords starting a dorm workspace. Tenants and chefs should join through an invite link from their landlord."}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            className="h-12 px-4 border border-input rounded-xl bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            required
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            className="h-12 px-4 border border-input rounded-xl bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            required
          />
        </div>

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

        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="auth-input pr-12"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
        </div>

        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="auth-input pr-12"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirm((current) => !current)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            {showConfirm ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <div
            onClick={() => setAcceptTerms((current) => !current)}
            className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
              acceptTerms ? "bg-primary border-primary" : "border-input bg-card"
            }`}
          >
            {acceptTerms ? <Check className="h-3 w-3 text-primary-foreground" /> : null}
          </div>
          <span className="text-sm text-foreground">I accept the terms and privacy policy</span>
        </label>

        <button type="submit" disabled={actionLoading} className="auth-button disabled:opacity-70">
          {actionLoading ? "Creating account..." : "Create account"}
        </button>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Already have an account?{" "}
          <Link to={`/login${authLinkSuffix}`} className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;
