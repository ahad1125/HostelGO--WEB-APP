import { Link, useNavigate } from "react-router-dom";
import { Building2, Menu, X, LogOut, User, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isLoggedIn = !!user;
  const userRole = user?.role || null;
  const userName = user?.name || "User";

  const getDashboardLink = () => {
    switch (userRole) {
      case "student": return "/student/dashboard";
      case "owner": return "/owner/dashboard";
      case "admin": return "/admin/dashboard";
      default: return "/login";
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo Section */}
          <Link 
            to="/" 
            className="flex items-center gap-3 group transition-all duration-300 hover:scale-105"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg group-hover:bg-primary/30 transition-colors"></div>
              <div className="relative bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
                <Building2 className="h-7 w-7 text-primary" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                HostelGo
              </span>
              <span className="text-xs text-muted-foreground -mt-1">Smart Hostel Search</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              to="/" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200 relative group"
            >
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-200"></span>
            </Link>
            
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {!isLoggedIn ? (
              <>
                <Link to="/login">
                  <Button 
                    variant="ghost" 
                    className="font-medium hover:bg-primary/10 hover:text-primary transition-all duration-200"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button 
                    className="font-medium shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                  >
                    Get Started
                    <Sparkles className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to={getDashboardLink()} 
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200 relative group"
                >
                  Dashboard
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-200"></span>
                </Link>
                
                {/* User Profile Section */}
                <div className="flex items-center gap-4 pl-6 border-l border-border/50">
                  <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-all duration-200 group">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20 group-hover:border-primary/40 transition-colors">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-foreground leading-tight">{userName}</span>
                      <span className="text-xs text-muted-foreground capitalize">{userRole}</span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleLogout}
                    className="h-10 w-10 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2.5 rounded-lg hover:bg-muted transition-colors duration-200"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-foreground" />
            ) : (
              <Menu className="h-6 w-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-6 border-t border-border/50 animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-2">
              <Link 
                to="/" 
                className="px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              
              {/* Theme Toggle in Mobile */}
              <div className="px-4 py-3 flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Theme</span>
                <ThemeToggle />
              </div>
              
              {!isLoggedIn ? (
                <>
                  <Link to="/login" className="px-4 py-3" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start font-medium">
                      Login
                    </Button>
                  </Link>
                  <Link to="/signup" className="px-4 py-3" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full justify-center font-medium bg-gradient-to-r from-primary to-primary/90">
                      Get Started
                      <Sparkles className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    to={getDashboardLink()} 
                    className="px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <div className="px-4 py-3 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-foreground">{userName}</span>
                        <span className="text-xs text-muted-foreground capitalize">{userRole}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }} 
                    className="px-4 py-3 rounded-lg text-left text-destructive hover:bg-destructive/10 transition-all duration-200 font-medium"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
