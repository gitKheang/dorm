import React from 'react';
import { Building2 } from 'lucide-react';
import dormHero from '@/assets/dorm-hero.jpg';

interface AuthLayoutProps {
  children: React.ReactNode;
  tagline?: string;
}

const AuthLayout = ({
  children,
  tagline = "Landlord-controlled dorm operations for rooms, meals, payments, and maintenance.",
}: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex">
      {/* Left: Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-24 bg-background">
        <div className="w-full max-w-md mx-auto">
          <div className="flex items-center gap-2 mb-10">
            <Building2 className="h-8 w-8 text-primary" />
            <span className="font-display text-2xl font-semibold tracking-tight text-foreground">DormFlow</span>
          </div>
          {children}
        </div>
      </div>

      {/* Right: Hero Image */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[50%] relative overflow-hidden rounded-l-3xl">
        <img
          src={dormHero}
          alt="Modern dormitory building"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/30" />
        <div className="relative z-10 flex items-center justify-center p-12">
          <p className="text-primary-foreground text-xl lg:text-2xl xl:text-3xl font-semibold text-center leading-relaxed max-w-lg">
            {tagline}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
