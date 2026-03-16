const SetupRequired = () => (
  <div className="min-h-screen bg-background flex items-center justify-center px-6">
    <div className="max-w-xl w-full stat-card space-y-4">
      <div>
        <h1 className="page-header">Supabase setup required</h1>
        <p className="page-subheader">
          This app now runs against a real backend. Add your Supabase credentials before using it.
        </p>
      </div>

      <div className="rounded-lg bg-muted p-4 text-sm font-mono text-foreground space-y-2">
        <p>VITE_SUPABASE_URL=...</p>
        <p>VITE_SUPABASE_ANON_KEY=...</p>
        <p>VITE_APP_URL=http://localhost:8080</p>
      </div>

      <p className="text-sm text-muted-foreground">
        The required variables are listed in <code>.env.example</code>. Run the SQL migration in
        <code> supabase/migrations/20260314133000_dormflow_mvp.sql</code> before signing in.
      </p>
    </div>
  </div>
);

export default SetupRequired;
