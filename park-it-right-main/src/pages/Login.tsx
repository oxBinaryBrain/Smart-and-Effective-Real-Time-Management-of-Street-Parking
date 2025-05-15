
import React from "react";
import LoginForm from "@/components/LoginForm";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";

const Login = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <LoginForm />
      </div>
      <Toaster />
    </div>
  );
};

export default Login;
