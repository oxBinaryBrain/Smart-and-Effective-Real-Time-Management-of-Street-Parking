import React from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { IndianRupee, MapPin, Clock, ShieldCheck, Lightbulb, CircleDollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto w-full p-4 py-8">
        <h1 className="text-3xl font-bold mb-2">About ParkXpert </h1>
        <p className="text-muted-foreground mb-8">
          Smart and Effective Realtime Management of Street Parking
        </p>
        
        <div className="space-y-8">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Our Mission</h2>
              <p className="text-muted-foreground mb-4">
                In India, the rising number of vehicles has outpaced the availability of parking spaces, 
                leading to traffic congestion, illegal parking, and inefficient resource utilization. 
                Instead of merely increasing parking spaces, ParkXpert provides smart parking solutions 
                using sensors and software to provide real-time availability updates and optimize pricing 
                based on demand.
              </p>
              <p className="text-muted-foreground">
                Our mission is to make parking effortless, reducing congestion and improving urban mobility 
                through technology and smart pricing.
              </p>
            </CardContent>
          </Card>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-primary/5 rounded-lg p-6 flex flex-col items-center text-center">
              <ShieldCheck className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Safe & Secure</h3>
              <p className="text-muted-foreground">
                Our platform provides secure parking spot reservations and payment processing, giving you peace of mind.
              </p>
            </div>
            
            <div className="bg-primary/5 rounded-lg p-6 flex flex-col items-center text-center">
              <Clock className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Save Time</h3>
              <p className="text-muted-foreground">
                No more driving around in circles looking for parking. Reserve your spot in advance and head straight there.
              </p>
            </div>
            
            <div className="bg-primary/5 rounded-lg p-6 flex flex-col items-center text-center">
              <CircleDollarSign className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Demand-Based Pricing</h3>
              <p className="text-muted-foreground">
                Our dynamic pricing ensures optimal resource allocation and prevents overcrowding at popular locations.
              </p>
            </div>
            
            <div className="bg-primary/5 rounded-lg p-6 flex flex-col items-center text-center">
              <Lightbulb className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Smart Urban Solutions</h3>
              <p className="text-muted-foreground">
                We're contributing to smarter cities by reducing traffic congestion and optimizing urban infrastructure.
              </p>
            </div>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">How It Works</h2>
              <ol className="space-y-4 list-decimal pl-5">
                <li>
                  <p className="font-medium">Find Parking</p>
                  <p className="text-muted-foreground">
                    Use our interactive map to find available parking spots near your destination.
                  </p>
                </li>
                <li>
                  <p className="font-medium">Reserve Your Spot</p>
                  <p className="text-muted-foreground">
                    Select the parking lot and specific spot you want, then make a reservation.
                  </p>
                </li>
                <li>
                  <p className="font-medium">Pay Securely</p>
                  <p className="text-muted-foreground">
                    Complete payment through our secure platform using UPI, credit/debit cards, or digital wallets.
                  </p>
                </li>
                <li>
                  <p className="font-medium">Navigate to Your Spot</p>
                  <p className="text-muted-foreground">
                    Use the built-in navigation feature to get directions to your reserved parking spot.
                  </p>
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default About;
