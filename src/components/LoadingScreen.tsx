const LoadingScreen = ({ message = "Loading..." }: { message?: string }) => (
  <div className="min-h-[40vh] flex items-center justify-center text-center px-6">
    <div>
      <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto mb-4" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  </div>
);

export default LoadingScreen;
