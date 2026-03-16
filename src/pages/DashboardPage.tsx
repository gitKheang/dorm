import { useAuth } from "@/contexts/AuthContext";
import OnboardingPage from "@/pages/OnboardingPage";
import ChefDashboard from "@/pages/chef/ChefDashboard";
import LandlordDashboard from "@/pages/landlord/LandlordDashboard";
import TenantDashboard from "@/pages/tenant/TenantDashboard";

const DashboardPage = () => {
  const { activeMembership } = useAuth();

  if (!activeMembership) {
    return <OnboardingPage />;
  }

  if (activeMembership.role === "tenant") return <TenantDashboard />;
  if (activeMembership.role === "chef") return <ChefDashboard />;
  return <LandlordDashboard />;
};

export default DashboardPage;
