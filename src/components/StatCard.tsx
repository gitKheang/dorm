import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: string;
  icon?: React.ReactNode;
}

const StatCard = ({ label, value, subtext, trend, icon }: StatCardProps) => (
  <div className="stat-card animate-fade-in">
    <div className="flex items-start justify-between">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      {icon && <div className="text-primary">{icon}</div>}
    </div>
    <div className="flex items-baseline gap-2 mt-2">
      <h3 className="text-2xl font-bold tracking-tight text-foreground tabular-nums">{value}</h3>
      {trend && <span className="text-xs font-semibold text-success">{trend}</span>}
    </div>
    {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
  </div>
);

export default StatCard;
