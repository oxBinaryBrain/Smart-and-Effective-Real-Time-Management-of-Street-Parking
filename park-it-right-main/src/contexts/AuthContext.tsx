import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  adminSession: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  adminLogin: (username: string, password: string) => Promise<boolean>;
  adminLogout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [adminSession, setAdminSession] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem("parkItRightUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    // Check if admin is already logged in
    const storedAdmin = localStorage.getItem("parkItRightAdmin");
    if (storedAdmin) {
      setAdminSession(JSON.parse(storedAdmin));
    }
    
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      if (email && password) {
        const mockUser = {
          id: `user_${Math.random().toString(36).substring(2, 9)}`,
          name: email.split('@')[0],
          email,
          isAdmin: false
        };
        
        setUser(mockUser);
        localStorage.setItem("parkItRightUser", JSON.stringify(mockUser));
        toast.success("Login successful!");
        window.location.href = "/dashboard"; // Add this line to redirect to dashboard
        return true;
      } else {
        toast.error("Invalid credentials!");
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const adminLogin = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Check for admin credentials
      if (username === "Darshanadmin" && password === "Password") {
        const adminUser = {
          id: "admin_123",
          name: "Administrator",
          email: "admin@parkitright.com",
          isAdmin: true
        };
        
        setAdminSession(adminUser);
        localStorage.setItem("parkItRightAdmin", JSON.stringify(adminUser));
        toast.success("Admin login successful!");
        return true;
      } else {
        toast.error("Invalid admin credentials!");
        return false;
      }
    } catch (error) {
      console.error("Admin login error:", error);
      toast.error("Admin login failed. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Simple validation for demo
      if (name && email && password) {
        // For demo purposes, create a mock user
        const mockUser = {
          id: `user_${Math.random().toString(36).substring(2, 9)}`,
          name,
          email
        };
        
        setUser(mockUser);
        localStorage.setItem("parkItRightUser", JSON.stringify(mockUser));
        toast.success("Account created successfully!");
        return true;
      } else {
        toast.error("Please fill all fields!");
        return false;
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Signup failed. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("parkItRightUser");
    toast.success("Logged out successfully");
  };
  
  const adminLogout = () => {
    setAdminSession(null);
    localStorage.removeItem("parkItRightAdmin");
    toast.success("Admin logged out successfully");
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      adminSession,
      login, 
      signup, 
      logout, 
      adminLogin,
      adminLogout,
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
