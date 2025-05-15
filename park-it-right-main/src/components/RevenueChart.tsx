
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IndianRupee, Clock } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Sample average revenue data by hour
const averageRevenueByHour = [
  { hour: "6 AM", amount: 250 },
  { hour: "8 AM", amount: 450 },
  { hour: "10 AM", amount: 350 },
  { hour: "12 PM", amount: 300 },
  { hour: "2 PM", amount: 280 },
  { hour: "4 PM", amount: 400 },
  { hour: "6 PM", amount: 600 },
  { hour: "8 PM", amount: 550 },
  { hour: "10 PM", amount: 300 }
];

// Function to generate real-time revenue data from reservations
const getRealTimeRevenueData = (reservations: any[]) => {
  // Sort reservations by timestamp
  const sortedReservations = [...reservations].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  
  // Group by hour and sum revenue
  return sortedReservations.map((reservation, index) => {
    const time = new Date(reservation.timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return {
      id: index,
      time,
      amount: reservation.price,
      // For the cumulative line
      total: sortedReservations
        .slice(0, index + 1)
        .reduce((sum, r) => sum + r.price, 0)
    };
  });
};

interface RevenueChartProps {
  reservations: any[];
}

const RevenueChart: React.FC<RevenueChartProps> = ({ reservations }) => {
  const realTimeData = getRealTimeRevenueData(reservations);
  
  const averageConfig = {
    amount: {
      label: "Average Revenue (₹)",
      theme: {
        light: "#8B5CF6",
        dark: "#A78BFA",
      },
    },
  };

  const realTimeConfig = {
    amount: {
      label: "Payment Amount (₹)",
      theme: {
        light: "#F59E0B",
        dark: "#FBBF24",
      },
    },
    total: {
      label: "Cumulative Revenue (₹)",
      theme: {
        light: "#10B981",
        dark: "#34D399",
      },
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Average Revenue Trend */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-2">
            <IndianRupee className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-lg font-medium">Average Revenue by Hour</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={averageConfig} className="aspect-[4/3]">
            <BarChart data={averageRevenueByHour} barGap={4}>
              <XAxis 
                dataKey="hour" 
                axisLine={false} 
                tickLine={false} 
                tickMargin={8}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tickMargin={8}
                tickFormatter={(value) => `₹${value}`} 
              />
              <CartesianGrid vertical={false} className="stroke-muted" />
              <ChartTooltip 
                content={
                  <ChartTooltipContent 
                    labelFormatter={(value) => `${value}`}
                    formatter={(value) => [`₹${value}`, "Avg Revenue"]}
                  />
                } 
              />
              <Bar 
                dataKey="amount" 
                fill="var(--color-amount)" 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Real-time Revenue Trend */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-lg font-medium">Real-time Revenue Trend</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {realTimeData.length > 0 ? (
            <ChartContainer config={realTimeConfig} className="aspect-[4/3]">
              <LineChart data={realTimeData}>
                <XAxis
                  dataKey="time"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => `₹${value}`}
                  yAxisId="left"
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  orientation="right"
                  tickMargin={8}
                  tickFormatter={(value) => `₹${value}`}
                  yAxisId="right"
                />
                <CartesianGrid vertical={false} className="stroke-muted" />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => `Time: ${value}`}
                    />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="var(--color-amount)"
                  activeDot={{ r: 6 }}
                  yAxisId="left"
                  name="Payment Amount"
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="var(--color-total)"
                  yAxisId="right"
                  name="Cumulative Revenue"
                />
                <Legend />
              </LineChart>
            </ChartContainer>
          ) : (
            <div className="flex h-48 items-center justify-center text-muted-foreground">
              No real-time revenue data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RevenueChart;
