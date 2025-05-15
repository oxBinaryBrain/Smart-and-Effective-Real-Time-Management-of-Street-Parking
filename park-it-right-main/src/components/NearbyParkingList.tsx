
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useParking } from "@/contexts/ParkingContext";
import { Car, Navigation, MapPin, IndianRupee, Clock, Calendar, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const NearbyParkingList = () => {
  const { nearbyLots, setSelectedLot } = useParking();
  const [selectedDetail, setSelectedDetail] = useState<typeof nearbyLots[0] | null>(null);

  if (nearbyLots.length === 0) {
    return (
      <Card className="w-full h-full border shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Nearby Parking</CardTitle>
          <CardDescription>
            Enable location services to see parking spots near you
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground">
          <Navigation className="h-10 w-10 mb-4 text-muted" />
          <p>Click "Find My Location" on the map to discover nearby parking spots</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate available spots per lot
  const getAvailableSpotsCount = (lot: typeof nearbyLots[0]) => {
    return lot.spots.filter(spot => spot.available).length;
  };

  const handleViewDetails = (lot: typeof nearbyLots[0], e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDetail(lot);
  };

  const handleSelectLot = () => {
    if (selectedDetail) {
      setSelectedLot(selectedDetail);
      setSelectedDetail(null);
    }
  };

  return (
    <Card className="w-full h-full border shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Nearby Parking</CardTitle>
        <CardDescription>
          {nearbyLots.length} parking areas found near you
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y max-h-[calc(100vh-300px)] overflow-y-auto">
          {nearbyLots.map((lot) => (
            <div 
              key={lot.id} 
              className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => setSelectedLot(lot)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-sm">{lot.name}</h3>
                <div className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                  ₹{lot.pricePerHour}/hr
                </div>
              </div>
              
              <div className="flex items-start text-xs text-muted-foreground mb-2">
                <MapPin className="h-3 w-3 mr-1 mt-0.5 shrink-0" />
                <span>{lot.address}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-xs">
                  <span className="text-muted-foreground">Available: </span>
                  <span className={getAvailableSpotsCount(lot) > 0 ? "text-green-600" : "text-red-600"}>
                    {getAvailableSpotsCount(lot)}/{lot.totalSpots}
                  </span>
                </div>
                
                <Button 
                  size="sm" 
                  variant="ghost"
                  className="text-xs h-7 px-2 text-primary"
                  onClick={(e) => handleViewDetails(lot, e)}
                >
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      {/* Detailed View Dialog */}
      <Dialog open={!!selectedDetail} onOpenChange={(open) => !open && setSelectedDetail(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Car className="h-5 w-5 text-primary" />
              {selectedDetail?.name}
            </DialogTitle>
            <DialogDescription className="flex items-center text-sm">
              <MapPin className="h-4 w-4 mr-1 inline shrink-0" />
              {selectedDetail?.address}
            </DialogDescription>
          </DialogHeader>
          
          {selectedDetail && (
            <div className="space-y-4 py-2">
              {/* Parking Lot Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/30 p-3 rounded-lg">
                  <div className="flex items-center text-sm font-medium mb-1">
                    <IndianRupee className="h-4 w-4 mr-1 text-primary" />
                    Pricing
                  </div>
                  <p className="text-lg font-semibold">₹{selectedDetail.pricePerHour}/hr</p>
                </div>
                
                <div className="bg-muted/30 p-3 rounded-lg">
                  <div className="flex items-center text-sm font-medium mb-1">
                    <Car className="h-4 w-4 mr-1 text-primary" />
                    Capacity
                  </div>
                  <p className="text-lg font-semibold">
                    <span className={getAvailableSpotsCount(selectedDetail) > 0 ? "text-green-600" : "text-red-600"}>
                      {getAvailableSpotsCount(selectedDetail)}
                    </span>
                    /{selectedDetail.totalSpots}
                  </p>
                </div>
              </div>
              
              {/* Parking Lot Features */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Features</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    24/7 Access
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    CCTV Surveillance
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Monthly Pass Available
                  </Badge>
                </div>
              </div>
              
              {/* Parking Lot Description */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Description</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedDetail.name} is a secure parking facility located in the heart of {selectedDetail.address.split(',')[0]}. 
                  We offer {selectedDetail.totalSpots} parking spots with convenient payment options and round-the-clock security.
                </p>
              </div>
              
              {/* Availability Status */}
              <div className="bg-muted/20 p-3 rounded-lg">
                <h3 className="text-sm font-medium mb-2">Current Availability</h3>
                <div className="flex items-center justify-between">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${
                        getAvailableSpotsCount(selectedDetail) / selectedDetail.totalSpots > 0.6 
                          ? "bg-green-600" 
                          : getAvailableSpotsCount(selectedDetail) / selectedDetail.totalSpots > 0.3 
                            ? "bg-amber-500" 
                            : "bg-red-600"
                      }`} 
                      style={{ width: `${(getAvailableSpotsCount(selectedDetail) / selectedDetail.totalSpots) * 100}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm font-medium">
                    {Math.round((getAvailableSpotsCount(selectedDetail) / selectedDetail.totalSpots) * 100)}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {getAvailableSpotsCount(selectedDetail) > 0 
                    ? `${getAvailableSpotsCount(selectedDetail)} spots available now` 
                    : "No spots available at the moment"}
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex space-x-2 sm:space-x-0">
            <Button variant="outline" onClick={() => setSelectedDetail(null)}>
              Cancel
            </Button>
            <Button onClick={handleSelectLot}>
              Select This Parking Lot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default NearbyParkingList;
