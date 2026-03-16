import type { ReactNode } from "react";

const EmptyState = ({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) => (
  <div className="stat-card text-center py-10 px-6">
    <h3 className="text-lg font-semibold text-foreground">{title}</h3>
    <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">{description}</p>
    {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
  </div>
);

export default EmptyState;
