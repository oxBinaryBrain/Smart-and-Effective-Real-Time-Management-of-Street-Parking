
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface OccupancyChartProps {
  parkingLots: any[];
}

const OccupancyChart: React.FC<OccupancyChartProps> = ({ parkingLots }) => {
  // Process data for occupancy by lot
  const occupancyData = React.useMemo(() => {
    return parkingLots.map(lot => {
      const totalSpots = lot.spots.length;
      const occupiedSpots = lot.spots.filter((spot: any) => !spot.available).length;
      const availableSpots = totalSpots - occupiedSpots;
      
      return {
        name: lot.name,
        occupied: occupiedSpots,
        available: availableSpots,
        total: totalSpots,
        occupancyRate: Math.round((occupiedSpots / totalSpots) * 100)
      };
    });
  }, [parkingLots]);

  // Data for pie chart - aggregated across all lots
  const pieData = React.useMemo(() => {
    const totalOccupied = occupancyData.reduce((sum, lot) => sum + lot.occupied, 0);
    const totalAvailable = occupancyData.reduce((sum, lot) => sum + lot.available, 0);
    
    return [
      { name: "Occupied", value: totalOccupied, color: "#F97316" },
      { name: "Available", value: totalAvailable, color: "#22C55E" }
    ];
  }, [occupancyData]);

  const config = {
    occupied: {
      label: "Occupied Spots",
      theme: {
        light: "#F97316",
        dark: "#FB923C",
      },
    },
    available: {
      label: "Available Spots",
      theme: {
        light: "#22C55E",
        dark: "#4ADE80",
      },
    },
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-2">
            <Car className="h-5 w-5 text-red-500" />
            <CardTitle className="text-lg font-medium">Parking Occupancy</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col h-full">
            <ChartContainer config={config} className="aspect-[4/3] mb-4">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => [`${value} spots`, name]}
                    />
                  }
                />
                <Legend
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  iconType="circle"
                />
              </PieChart>
            </ChartContainer>
            <div className="mt-auto grid gap-2">
              {occupancyData.map((lot) => (
                <div key={lot.name} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{lot.name}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${lot.occupancyRate}%` }}
                      ></div>
                    </div>
                    <span className="text-muted-foreground w-16 text-right">
                      {lot.occupancyRate}% Full
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OccupancyChart;
