import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { toast } from "sonner";

import { acceptInvitation, createDorm, getAccountContext, updateProfile as saveProfile } from "@/lib/api";
import { isSupabaseConfigured, requireSupabase, supabase } from "@/lib/supabase";
import type { DormFormValues, Membership, Profile } from "@/types/domain";

const ACTIVE_MEMBERSHIP_KEY = "dormflow-active-membership-id";
const PENDING_INVITE_KEY = "dormflow-pending-invite-token";

interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface AuthContextType {
  session: Session | null;
  user: Profile | null;
  memberships: Membership[];
  activeMembership: Membership | null;
  isConfigured: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  actionLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: RegisterInput) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshAccount: () => Promise<void>;
  switchMembership: (membershipId: string) => void;
  updateProfile: (values: Pick<Profile, "firstName" | "lastName" | "phone">) => Promise<void>;
  createDorm: (values: DormFormValues) => Promise<void>;
  pendingInviteToken: string | null;
  setPendingInviteToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function readStoredMembershipId() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACTIVE_MEMBERSHIP_KEY);
}

function writeStoredMembershipId(value: string | null) {
  if (typeof window === "undefined") return;

  if (value) {
    window.localStorage.setItem(ACTIVE_MEMBERSHIP_KEY, value);
  } else {
    window.localStorage.removeItem(ACTIVE_MEMBERSHIP_KEY);
  }
}

function readStoredInviteToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(PENDING_INVITE_KEY);
}

function writeStoredInviteToken(value: string | null) {
  if (typeof window === "undefined") return;

  if (value) {
    window.localStorage.setItem(PENDING_INVITE_KEY, value);
  } else {
    window.localStorage.removeItem(PENDING_INVITE_KEY);
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<Profile | null>(null);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [activeMembershipId, setActiveMembershipId] = useState<string | null>(() => readStoredMembershipId());
  const [pendingInviteToken, setPendingInviteTokenState] = useState<string | null>(() => readStoredInviteToken());
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const setPendingInviteToken = useCallback((token: string | null) => {
    setPendingInviteTokenState(token);
    writeStoredInviteToken(token);
  }, []);

  const loadAccount = useCallback(
    async (nextSession: Session | null) => {
      if (!nextSession?.user) {
        setUser(null);
        setMemberships([]);
        setActiveMembershipId(null);
        writeStoredMembershipId(null);
        setIsLoading(false);
        return;
      }

      try {
        const account = await getAccountContext(nextSession.user.id);
        setUser(account.profile);
        setMemberships(account.memberships);

        setActiveMembershipId((current) => {
          const selected =
            account.memberships.find((membership) => membership.id === current) ??
            account.memberships[0] ??
            null;

          writeStoredMembershipId(selected?.id ?? null);
          return selected?.id ?? null;
        });
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const refreshAccount = useCallback(async () => {
    if (!session?.user) return;
    await loadAccount(session);
  }, [loadAccount, session]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    let mounted = true;

    requireSupabase()
      .auth.getSession()
      .then(({ data }) => {
        if (!mounted) return;
        setSession(data.session);
        return loadAccount(data.session);
      })
      .catch(() => {
        if (mounted) setIsLoading(false);
      });

    const {
      data: { subscription },
    } = requireSupabase().auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      loadAccount(nextSession).catch((error) => {
        toast.error(error.message);
      });
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadAccount]);

  useEffect(() => {
    if (!session?.user || !pendingInviteToken) return;

    let cancelled = false;

    acceptInvitation(pendingInviteToken)
      .then(async () => {
        if (cancelled) return;
        setPendingInviteToken(null);
        await refreshAccount();
        toast.success("Invitation accepted");
      })
      .catch((error) => {
        if (cancelled) return;
        toast.error(error.message);
      });

    return () => {
      cancelled = true;
    };
  }, [pendingInviteToken, refreshAccount, session?.user, setPendingInviteToken]);

  const signIn = useCallback(async (email: string, password: string) => {
    const client = requireSupabase();
    setActionLoading(true);

    try {
      const { error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Signed in");
    } finally {
      setActionLoading(false);
    }
  }, []);

  const signUp = useCallback(async (input: RegisterInput) => {
    const client = requireSupabase();
    setActionLoading(true);

    try {
      const { error } = await client.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          emailRedirectTo: import.meta.env.VITE_APP_URL,
          data: {
            first_name: input.firstName,
            last_name: input.lastName,
          },
        },
      });

      if (error) throw error;
      toast.success("Account created. Check your email if confirmation is enabled.");
    } finally {
      setActionLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    const client = requireSupabase();
    setActionLoading(true);

    try {
      const { error } = await client.auth.signOut();
      if (error) throw error;
      writeStoredMembershipId(null);
      toast.success("Signed out");
    } finally {
      setActionLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const client = requireSupabase();
    setActionLoading(true);

    try {
      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: import.meta.env.VITE_APP_URL,
      });

      if (error) throw error;
      toast.success("Password reset email sent");
    } finally {
      setActionLoading(false);
    }
  }, []);

  const updateProfile = useCallback(
    async (values: Pick<Profile, "firstName" | "lastName" | "phone">) => {
      if (!user) return;
      setActionLoading(true);

      try {
        const nextProfile = await saveProfile(user.id, values);
        setUser(nextProfile);
        toast.success("Profile updated");
      } finally {
        setActionLoading(false);
      }
    },
    [user],
  );

  const handleCreateDorm = useCallback(
    async (values: DormFormValues) => {
      setActionLoading(true);

      try {
        await createDorm(values);
        await refreshAccount();
        toast.success("Dorm created");
      } finally {
        setActionLoading(false);
      }
    },
    [refreshAccount],
  );

  const switchMembership = useCallback((membershipId: string) => {
    setActiveMembershipId(membershipId);
    writeStoredMembershipId(membershipId);
  }, []);

  const activeMembership = useMemo(
    () => memberships.find((membership) => membership.id === activeMembershipId) ?? memberships[0] ?? null,
    [activeMembershipId, memberships],
  );

  const value = useMemo<AuthContextType>(
    () => ({
      session,
      user,
      memberships,
      activeMembership,
      isConfigured: isSupabaseConfigured,
      isAuthenticated: Boolean(session?.user),
      isLoading,
      actionLoading,
      signIn,
      signUp,
      signOut,
      resetPassword,
      refreshAccount,
      switchMembership,
      updateProfile,
      createDorm: handleCreateDorm,
      pendingInviteToken,
      setPendingInviteToken,
    }),
    [
      session,
      user,
      memberships,
      activeMembership,
      isLoading,
      actionLoading,
      signIn,
      signUp,
      signOut,
      resetPassword,
      refreshAccount,
      switchMembership,
      updateProfile,
      handleCreateDorm,
      pendingInviteToken,
      setPendingInviteToken,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
