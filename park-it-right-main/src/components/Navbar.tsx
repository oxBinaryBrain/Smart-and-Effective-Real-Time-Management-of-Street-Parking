
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User, Car, LayoutDashboard, ShieldCheck } from "lucide-react";

const Navbar = () => {
  const { user, adminSession, logout, adminLogout } = useAuth();
  const navigate = useNavigate();

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="container flex items-center justify-between h-16 px-4 mx-auto sm:px-6">
        <Link to="/" onClick={handleHomeClick} className="flex items-center space-x-2">
          <Car className="w-6 h-6 text-primary" />
          <span className="text-xl font-bold text-primary">ParkXpert</span>
        </Link>

        <nav className="hidden space-x-4 md:flex">
          <Link to="/" onClick={handleHomeClick} className="text-foreground hover:text-primary transition-colors">
            Home
          </Link>
          {user && (
            <>
              <Link 
                to="/reservations" 
                className="text-foreground hover:text-primary transition-colors"
              >
                My Reservations
              </Link>
            </>
          )}
          {adminSession && (
            <Link 
              to="/admin" 
              className="text-foreground hover:text-primary transition-colors"
            >
              Admin Dashboard
            </Link>
          )}
          <Link to="/about" className="text-foreground hover:text-primary transition-colors">
            About
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          {adminSession ? (
            <div className="flex items-center space-x-3">
              <div className="hidden md:flex items-center space-x-2">
                <div className="flex items-center">
                  <LayoutDashboard className="w-4 h-4 text-primary mr-1" />
                  <span className="text-sm font-semibold text-primary">{adminSession.name}</span>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={adminLogout}
                className="flex items-center space-x-1"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Admin Logout</span>
              </Button>
            </div>
          ) : (
            <>
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="hidden md:flex items-center space-x-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">{user.name}</span>
                  </div>
                  <Link to="/admin-login">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center space-x-1"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span className="hidden md:inline">Admin</span>
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={logout}
                    className="flex items-center space-x-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden md:inline">Logout</span>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link to="/login">
                    <Button variant="outline" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button variant="default" size="sm">
                      Sign Up
                    </Button>
                  </Link>
                  <Link to="/admin-login">
                    <Button variant="outline" size="sm" className="flex items-center space-x-1">
                      <ShieldCheck className="w-4 h-4" />
                      <span className="hidden md:inline">Admin</span>
                    </Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
