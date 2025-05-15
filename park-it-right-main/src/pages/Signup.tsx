
import React from "react";
import SignupForm from "@/components/SignupForm";
import Navbar from "@/components/Navbar";

const Signup = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <SignupForm />
      </div>
    </div>
  );
};

export default Signup;
