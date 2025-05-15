
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ParkingLot, ParkingSpot, useParking, VehicleDetails } from "@/contexts/ParkingContext";
import { Car, Navigation, MapPin, Clock, IndianRupee, Calendar as CalendarIcon, Bike } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import ParkingSpotGrid from "./ParkingSpotGrid";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, addHours, addDays, isToday, isBefore } from "date-fns";
import { cn } from "@/lib/utils";

// Helper function to calculate distance between two coordinates
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  return distance;
};

// Helper function to estimate travel time based on distance
const estimateTravelTime = (distance: number): number => {
  const averageSpeedKmPerMin = 0.5; // 30 km/h in km/min
  return Math.round(distance / averageSpeedKmPerMin);
};

// Generate directions based on starting point and destination
const generateDirections = (lotName: string, spotNumber: number): string[] => {
  return [
    `Head north on your current road for 300m`,
    `Turn right onto Main Street and continue for 1.2km`,
    `At the traffic signal, turn left onto ${lotName.split(' ')[0]} Road`,
    `Continue straight for 800m`,
    `The parking lot will be on your right side`,
    `Proceed to spot #${spotNumber} as indicated on-site`
  ];
};

const ParkingLotDetails: React.FC<{ lot: ParkingLot }> = ({ lot }) => {
  const { user } = useAuth();
  const { setSelectedSpot, selectedSpot, makeParkingReservation, getCurrentLocation } = useParking();
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [hours, setHours] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);
  const [isNavigationDialogOpen, setIsNavigationDialogOpen] = useState(false);
  const [userCoordinates, setUserCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [estimatedDistance, setEstimatedDistance] = useState<number | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const [directionsSteps, setDirectionsSteps] = useState<string[]>([]);
  const [isLoadingDirections, setIsLoadingDirections] = useState(false);
  
  // New state for reservation date and time
  const [reservationDate, setReservationDate] = useState<Date>(new Date());
  const [reservationTime, setReservationTime] = useState<string>(
    format(new Date(), "HH:00")
  );
  const [isDateSelectionOpen, setIsDateSelectionOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  // New state for vehicle details
  const [isVehicleDetailsOpen, setIsVehicleDetailsOpen] = useState(false);
  const [vehicleType, setVehicleType] = useState<"2-wheeler" | "4-wheeler" | "other">("4-wheeler");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleNumberError, setVehicleNumberError] = useState("");
  
  const navigate = useNavigate();

  const availableSpots = lot.spots.filter(spot => spot.available).length;
  const spotSelectionText = selectedSpot 
    ? `Spot #${selectedSpot.spotNumber} selected` 
    : "Select a spot";

  const handleBookNow = () => {
    if (!user) {
      toast.error("Please login to reserve a parking spot");
      navigate("/login", { state: { from: "/" } });
      return;
    }

    if (!selectedSpot) {
      toast.error("Please select a parking spot first");
      return;
    }

    setIsDateSelectionOpen(true);
  };

  const handleDateTimeConfirm = () => {
    setIsDateSelectionOpen(false);
    setIsVehicleDetailsOpen(true);
  };

  const handleVehicleDetailsConfirm = () => {
    // Validate vehicle number
    if (!vehicleNumber.trim()) {
      setVehicleNumberError("Vehicle number is required");
      return;
    }
    
    // Simple validation for Indian vehicle numbers (can be customized)
    const vehicleNumberRegex = /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/;
    if (!vehicleNumberRegex.test(vehicleNumber.toUpperCase())) {
      setVehicleNumberError("Please enter a valid vehicle number (e.g., KA01AB1234)");
      return;
    }
    
    setVehicleNumberError("");
    setIsVehicleDetailsOpen(false);
    setIsPaymentDialogOpen(true);
  };

  const handlePayment = async () => {
    if (!user || !selectedSpot) return;
    
    setIsLoadingPayment(true);
    
    // Create reservation start time from selected date and time
    const [selectedHour, selectedMinute] = reservationTime.split(':').map(Number);
    const startTime = new Date(reservationDate);
    startTime.setHours(selectedHour, selectedMinute, 0, 0);
    
    const vehicleDetails: VehicleDetails = {
      type: vehicleType,
      number: vehicleNumber.toUpperCase()
    };
    
    const success = await makeParkingReservation(
      user.id,
      paymentMethod,
      hours,
      startTime,
      vehicleDetails
    );
    
    setIsLoadingPayment(false);
    
    if (success) {
      setIsPaymentDialogOpen(false);
      navigate("/reservations");
    }
  };

  const handleGetDirections = async () => {
    setIsNavigationDialogOpen(true);
  };

  const showDirectionsOnMap = () => {
    // Use the globally exposed method to show the route on the map
    if (typeof window.showRouteToLot === 'function') {
      window.showRouteToLot(true);
    }
    
    toast.success(`Showing directions to ${lot.name}`);
    setIsNavigationDialogOpen(false);
  };

  const showDetailedDirections = async () => {
    setIsLoadingDirections(true);
    
    const location = await getCurrentLocation();
    if (location) {
      // Update user coordinates
      setUserCoordinates(location);
      
      // Calculate real distance based on coordinates
      const distance = calculateDistance(
        location.lat, 
        location.lng, 
        lot.latitude, 
        lot.longitude
      );
      
      // Calculate estimated time based on the distance
      const time = estimateTravelTime(distance);
      
      setEstimatedDistance(distance);
      setEstimatedTime(time);
      
      // Generate directions
      const spotNum = selectedSpot ? selectedSpot.spotNumber : 1;
      const directions = generateDirections(lot.name, spotNum);
      setDirectionsSteps(directions);
    }
    
    setIsLoadingDirections(false);
  };

  const useCurrentLocationForDirections = async () => {
    const location = await getCurrentLocation();
    if (location) {
      // Update user coordinates
      setUserCoordinates(location);
      
      // Calculate real distance based on coordinates
      const distance = calculateDistance(
        location.lat, 
        location.lng, 
        lot.latitude, 
        lot.longitude
      );
      
      // Calculate estimated time based on the distance
      const time = estimateTravelTime(distance);
      
      setEstimatedDistance(distance);
      setEstimatedTime(time);
    }
  };

  const closeDirectionsDialog = () => {
    setIsNavigationDialogOpen(false);
    setDirectionsSteps([]);
  };

  const increaseHours = () => {
    if (hours < 24) {
      setHours(prev => prev + 1);
    }
  };

  const decreaseHours = () => {
    if (hours > 1) {
      setHours(prev => prev - 1);
    }
  };

  // Time options for the dropdown (hourly slots)
  const generateTimeOptions = () => {
    const options = [];
    for (let i = 0; i < 24; i++) {
      const hour = i < 10 ? `0${i}` : `${i}`;
      options.push(`${hour}:00`);
    }
    return options;
  };

  // Check if the selected date and time is in the past
  const isSelectedTimeValid = () => {
    const [selectedHour, selectedMinute] = reservationTime.split(':').map(Number);
    const selectedDateTime = new Date(reservationDate);
    selectedDateTime.setHours(selectedHour, selectedMinute, 0, 0);
    
    const now = new Date();
    return !isBefore(selectedDateTime, now);
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center space-x-2">
          <Car className="h-5 w-5 text-primary" />
          <span>{lot.name}</span>
        </CardTitle>
        <CardDescription className="flex items-center text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mr-1 inline" />
          {lot.address}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-0">
        <div className="flex justify-between items-center mb-4 text-sm">
          <div className="flex items-center space-x-1">
            <IndianRupee className="h-4 w-4" />
            <span>₹{lot.pricePerHour}/hour</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>Available 24/7</span>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Parking Spot</h3>
            <div className="text-sm font-medium">
              <span className={availableSpots > 0 ? "text-green-600" : "text-red-600"}>
                {availableSpots}
              </span>
              /{lot.totalSpots} spots available
            </div>
          </div>
          
          <ParkingSpotGrid lot={lot} />
          
          <div className="text-sm text-center font-medium mt-2">
            {spotSelectionText}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-4">
        <Button 
          variant="outline" 
          onClick={handleGetDirections}
          className="flex items-center space-x-2"
        >
          <Navigation className="h-4 w-4" />
          <span>Get Directions</span>
        </Button>
        
        <Button 
          onClick={handleBookNow}
          disabled={!selectedSpot || !selectedSpot.available}
          className="flex items-center space-x-2"
        >
          <Car className="h-4 w-4" />
          <span>Book Now</span>
        </Button>
      </CardFooter>

      {/* Date and Time Selection Dialog */}
      <Dialog open={isDateSelectionOpen} onOpenChange={setIsDateSelectionOpen}>
        <DialogContent className="sm:max-w-md z-[100]">
          <DialogHeader>
            <DialogTitle>Select Reservation Date & Time</DialogTitle>
            <DialogDescription>
              Choose when you want to reserve your parking spot
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      id="date"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !reservationDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {reservationDate ? (
                        format(reservationDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[101]" align="start">
                    <Calendar
                      mode="single"
                      selected={reservationDate}
                      onSelect={(date) => {
                        if (date) {
                          setReservationDate(date);
                          setIsDatePickerOpen(false);
                        }
                      }}
                      disabled={(date) => 
                        (isBefore(date, new Date()) && !isToday(date)) || 
                        isBefore(date, new Date(new Date().setDate(new Date().getDate() - 1))) ||
                        isBefore(addDays(new Date(), 30), date)
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <select
                  id="time"
                  value={reservationTime}
                  onChange={(e) => setReservationTime(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {generateTimeOptions().map(time => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
                {!isSelectedTimeValid() && (
                  <p className="text-sm text-destructive">
                    Please select a future date and time
                  </p>
                )}
              </div>
              
              <div className="mt-2">
                <Label htmlFor="duration">Parking Duration (hours)</Label>
                <div className="flex items-center mt-1">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    className="h-8 w-8 rounded-full p-0"
                    onClick={decreaseHours}
                  >
                    -
                  </Button>
                  <div className="w-12 text-center font-medium">{hours}</div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    className="h-8 w-8 rounded-full p-0"
                    onClick={increaseHours}
                  >
                    +
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-between text-sm py-2 border-t mt-2">
                <span>Reservation summary:</span>
                <span className="font-medium">
                  {format(reservationDate, "PPP")} at {reservationTime} for {hours} hour{hours !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDateSelectionOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDateTimeConfirm}
              disabled={!isSelectedTimeValid()}
            >
              Continue to Vehicle Details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Vehicle Details Dialog */}
      <Dialog open={isVehicleDetailsOpen} onOpenChange={setIsVehicleDetailsOpen}>
        <DialogContent className="sm:max-w-md z-[100]">
          <DialogHeader>
            <DialogTitle>Enter Vehicle Details</DialogTitle>
            <DialogDescription>
              Please provide information about your vehicle
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="vehicle-type">Vehicle Type</Label>
              <RadioGroup 
                defaultValue="4-wheeler"
                value={vehicleType}
                onValueChange={(value) => setVehicleType(value as "2-wheeler" | "4-wheeler" | "other")}
                className="grid grid-cols-3 gap-4"
              >
                <div>
                  <RadioGroupItem
                    value="2-wheeler"
                    id="two-wheeler"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="two-wheeler"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <Bike className="h-6 w-6 mb-3" />
                    2-Wheeler
                  </Label>
                </div>
                
                <div>
                  <RadioGroupItem
                    value="4-wheeler"
                    id="four-wheeler"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="four-wheeler"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <Car className="h-6 w-6 mb-3" />
                    4-Wheeler
                  </Label>
                </div>
                
                <div>
                  <RadioGroupItem
                    value="other"
                    id="other-vehicle"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="other-vehicle"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 mb-3"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M7 12h.01" /><path d="M12 12h.01" /><path d="M17 12h.01" /></svg>
                    Other
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vehicle-number">Vehicle Number</Label>
              <Input
                id="vehicle-number"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                placeholder="e.g. KA01AB1234"
                className={vehicleNumberError ? "border-destructive" : ""}
              />
              {vehicleNumberError && (
                <p className="text-sm text-destructive mt-1">{vehicleNumberError}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Please enter your vehicle registration number in the correct format
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsVehicleDetailsOpen(false)}
            >
              Back
            </Button>
            <Button 
              onClick={handleVehicleDetailsConfirm}
            >
              Continue to Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md z-[1000]">
          <DialogHeader>
            <DialogTitle>Complete Your Booking</DialogTitle>
            <DialogDescription>
              Enter payment details to reserve your spot
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm pb-2 border-b">
                <span>Parking Lot:</span>
                <span className="font-medium">{lot.name}</span>
              </div>
              <div className="flex justify-between text-sm pb-2 border-b">
                <span>Spot Number:</span>
                <span className="font-medium">#{selectedSpot?.spotNumber}</span>
              </div>
              <div className="flex justify-between text-sm pb-2 border-b">
                <span>Reservation Time:</span>
                <span className="font-medium">
                  {format(reservationDate, "PPP")} at {reservationTime}
                </span>
              </div>
              <div className="flex justify-between text-sm pb-2 border-b">
                <span>Duration:</span>
                <span className="font-medium">{hours} hour{hours !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between text-sm pb-2 border-b">
                <span>Vehicle Type:</span>
                <span className="font-medium">{vehicleType}</span>
              </div>
              <div className="flex justify-between text-sm pb-2 border-b">
                <span>Vehicle Number:</span>
                <span className="font-medium">{vehicleNumber.toUpperCase()}</span>
              </div>
              
              <div className="flex justify-between text-sm py-2 border-b">
                <span>Price per hour:</span>
                <span>₹{lot.pricePerHour}</span>
              </div>
              <div className="flex justify-between text-base font-semibold py-2">
                <span>Total Amount:</span>
                <span>₹{lot.pricePerHour * hours}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="payment-method">Payment Method</Label>
              <RadioGroup 
                defaultValue="upi"
                onValueChange={setPaymentMethod}
                className="grid grid-cols-3 gap-4"
              >
                <div>
                  <RadioGroupItem
                    value="upi"
                    id="upi"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="upi"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 mb-3"><path d="M12 20v-6M6 20V10M18 20V4"/></svg>
                    UPI
                  </Label>
                </div>
                
                <div>
                  <RadioGroupItem
                    value="card"
                    id="card"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="card"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 mb-3"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                    Card
                  </Label>
                </div>
                
                <div>
                  <RadioGroupItem
                    value="wallet"
                    id="wallet"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="wallet"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 mb-3"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
                    Wallet
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPaymentDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handlePayment}
              disabled={isLoadingPayment}
            >
              {isLoadingPayment ? "Processing..." : "Pay & Reserve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enhanced Navigation Dialog */}
      <Dialog open={isNavigationDialogOpen} onOpenChange={closeDirectionsDialog}>
        <DialogContent className="sm:max-w-lg z-[1000]">
          <DialogHeader>
            <DialogTitle>Navigate to {lot.name}</DialogTitle>
            <DialogDescription>
              {directionsSteps.length === 0 
                ? "How would you like to navigate to this parking lot?" 
                : `Directions to ${lot.name}`}
            </DialogDescription>
          </DialogHeader>
          
          {directionsSteps.length === 0 ? (
            <div className="py-4">
              <div className="space-y-6">
                <div className="flex flex-col">
                  <div className="text-sm font-medium mb-2">Navigate with:</div>
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      className="h-auto py-3 flex flex-col items-center justify-center space-y-2"
                      onClick={showDirectionsOnMap}
                    >
                      <MapPin className="h-5 w-5" />
                      <span className="text-xs font-normal">Show on Map</span>
                    </Button>
                    
                    <Button 
                      variant="outline"
                      className="h-auto py-3 flex flex-col items-center justify-center space-y-2"
                      onClick={showDetailedDirections}
                      disabled={isLoadingDirections}
                    >
                      <Navigation className="h-5 w-5" />
                      <span className="text-xs font-normal">
                        {isLoadingDirections ? "Loading..." : "Step-by-Step Directions"}
                      </span>
                    </Button>
                  </div>
                </div>
                
                <div className="mt-2 flex flex-col space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary/10 rounded-full p-2">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">From</p>
                      <p className="text-sm text-muted-foreground">
                        {userCoordinates 
                          ? "Your current location" 
                          : "Location will be determined when you select a navigation option"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="ml-5 border-l-2 border-dashed border-primary/20 h-6"></div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary/10 rounded-full p-2">
                      <Car className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">To</p>
                      <p className="text-sm text-muted-foreground">{lot.address}</p>
                    </div>
                  </div>
                </div>
                
                {estimatedDistance && estimatedTime && (
                  <div className="mt-4 p-3 bg-muted/50 rounded-md space-y-2">
                    <div className="text-sm flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" /> 
                      <span>Estimated travel time: {estimatedTime} minutes</span>
                    </div>
                    <div className="text-sm flex items-center">
                      <Car className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Distance: {estimatedDistance.toFixed(1)} km</span>
                    </div>
                  </div>
                )}
                
                <Button 
                  variant="secondary" 
                  className="w-full"
                  onClick={useCurrentLocationForDirections}
                >
                  Use My Current Location
                </Button>
              </div>
            </div>
          ) : (
            // Step by step directions view
            <div className="py-2 space-y-4">
              {/* Direction summary */}
              <div className="flex items-center justify-between bg-muted p-3 rounded-md">
                <div className="flex items-center">
                  <Car className="h-5 w-5 mr-2 text-primary" />
                  <span className="font-medium">Best route</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {estimatedDistance?.toFixed(1) || "0"} km · {estimatedTime || "0"} min
                </div>
              </div>
              
              {/* Step by step directions */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {directionsSteps.map((step, index) => (
                  <div key={index} className="flex items-start">
                    <div className="bg-primary/10 text-primary font-medium rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 mt-0.5">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{step}</p>
                      {index < directionsSteps.length - 1 && (
                        <div className="ml-3 my-1 border-l-2 border-primary/20 h-6"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Destination indicator */}
              <div className="flex items-center bg-muted/50 p-3 rounded-md">
                <div className="bg-primary rounded-full w-3 h-3 mr-3"></div>
                <div>
                  <p className="font-medium text-sm">{lot.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedSpot ? `Spot #${selectedSpot.spotNumber}` : "Select a spot"}
                  </p>
                </div>
              </div>
              
              <Button 
                onClick={showDirectionsOnMap}
                className="w-full"
              >
                Show Route on Map
              </Button>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={closeDirectionsDialog} variant="outline">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ParkingLotDetails;
