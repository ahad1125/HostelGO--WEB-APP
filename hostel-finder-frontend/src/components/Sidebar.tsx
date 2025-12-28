import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Search, 
  Building2, 
  Plus, 
  List, 
  CheckCircle, 
  LogOut,
  User,
  Users,
  X,
  Mail
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarProps {
  role: "student" | "owner" | "admin";
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ role, isOpen, onClose }: SidebarProps) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const studentLinks = [
    { to: "/student/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/student/my-hostel", icon: Building2, label: "My Hostel" },
    { to: "/student/hostels", icon: Search, label: "Browse Hostels" },
    { to: "/student/enquiries", icon: Mail, label: "Enquiries" },
  ];

  const ownerLinks = [
    { to: "/owner/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/owner/add-hostel", icon: Plus, label: "Add Hostel" },
    { to: "/owner/my-hostels", icon: Building2, label: "My Hostels" },
    { to: "/owner/enquiries", icon: Mail, label: "Enquiries" },
  ];

  const adminLinks = [
    { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/admin/hostels", icon: List, label: "All Hostels" },
    { to: "/admin/verification", icon: CheckCircle, label: "Verification" },
    { to: "/admin/bookings", icon: Users, label: "Bookings" },
  ];

  const links = role === "student" ? studentLinks : role === "owner" ? ownerLinks : adminLinks;

  const roleLabels = {
    student: "Student Portal",
    owner: "Owner Portal",
    admin: "Admin Portal"
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-foreground/20 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "fixed lg:sticky top-0 left-0 h-screen w-64 bg-sidebar text-sidebar-foreground z-50 transition-transform duration-300 flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Header */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-primary" />
              <div>
                <h2 className="font-heading font-bold text-lg">HostelGo</h2>
                <p className="text-xs text-sidebar-foreground/70">{roleLabels[role]}</p>
              </div>
            </div>
            <button onClick={onClose} className="lg:hidden">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {links.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                      isActive 
                        ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                        : "hover:bg-sidebar-accent text-sidebar-foreground"
                    )}
                  >
                    <link.icon className="h-5 w-5" />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="h-10 w-10 rounded-full bg-sidebar-accent flex items-center justify-center">
              <User className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{user?.name || "User"}</p>
              <p className="text-xs text-sidebar-foreground/70 capitalize">
                {user?.role || role}
              </p>
            </div>
          </div>
          <Link 
            to="/login"
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 mt-2 rounded-lg hover:bg-sidebar-accent transition-colors text-destructive"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </Link>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
