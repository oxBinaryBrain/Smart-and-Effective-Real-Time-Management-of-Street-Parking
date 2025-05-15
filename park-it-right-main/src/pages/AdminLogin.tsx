
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Loader2, ShieldCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

const AdminLogin = () => {
  const [username, setUsername] = useState("Darshanadmin");
  const [password, setPassword] = useState("");
  const { adminLogin, loading, adminSession } = useAuth();
  const navigate = useNavigate();

  // If admin is already logged in, redirect to admin dashboard
  if (adminSession) {
    navigate("/admin");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if using admin credentials
    if (username !== "Darshanadmin") {
      toast.error("Invalid admin username", {
        description: "Please use the correct admin credentials"
      });
      return;
    }
    
    const success = await adminLogin(username, password);
    
    if (success) {
      navigate("/admin");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-2">
              <ShieldCheck className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl text-center">
              Admin Login
            </CardTitle>
            <CardDescription className="text-center">
              Enter administrator credentials to access dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="admin username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    Signing in as Admin...
                  </>
                ) : (
                  "Sign In as Admin"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <div className="text-xs text-center w-full text-muted-foreground">
              Administrator access is restricted to authorized personnel only.
            </div>
          </CardFooter>
        </Card>
      </div>
      <Toaster />
    </div>
  );
};

export default AdminLogin;
