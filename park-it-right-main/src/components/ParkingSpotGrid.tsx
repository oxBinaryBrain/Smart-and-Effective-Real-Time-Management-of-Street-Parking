
import React from "react";
import { useParking, ParkingLot } from "@/contexts/ParkingContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ParkingSpotGridProps {
  lot: ParkingLot;
}

const ParkingSpotGrid: React.FC<ParkingSpotGridProps> = ({ lot }) => {
  const { selectedSpot, setSelectedSpot } = useParking();
  
  const spotsPerRow = Math.ceil(Math.sqrt(lot.totalSpots));
  
  // Group spots into rows
  const rows = [];
  for (let i = 0; i < lot.spots.length; i += spotsPerRow) {
    rows.push(lot.spots.slice(i, i + spotsPerRow));
  }
  
  const handleSpotClick = (spot: typeof lot.spots[0]) => {
    if (spot.available) {
      setSelectedSpot(selectedSpot?.id === spot.id ? null : spot);
    } else {
      // Show toast notification when clicking on an unavailable spot
      toast.error("This parking spot is already reserved", {
        description: "Please select an available spot"
      });
    }
  };
  
  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="min-w-full">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center space-x-2 mb-2">
            {row.map((spot) => (
              <button
                key={spot.id}
                className={cn(
                  "w-8 h-8 flex items-center justify-center rounded-md text-xs font-medium transition-colors",
                  spot.available
                    ? selectedSpot?.id === spot.id
                      ? "bg-parkingSelected text-white"
                      : "bg-parkingAvailable text-white hover:bg-parkingSelected"
                    : "bg-parkingOccupied text-white cursor-pointer opacity-70"
                )}
                onClick={() => handleSpotClick(spot)}
              >
                {spot.spotNumber}
              </button>
            ))}
          </div>
        ))}
      </div>
      
      <div className="flex items-center justify-center mt-4 space-x-4 text-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-parkingAvailable rounded-full mr-1"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-parkingOccupied rounded-full mr-1"></div>
          <span>Occupied</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-parkingSelected rounded-full mr-1"></div>
          <span>Selected</span>
        </div>
      </div>
    </div>
  );
};

export default ParkingSpotGrid;
