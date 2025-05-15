
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useParking } from "@/contexts/ParkingContext";
import Navbar from "@/components/Navbar";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Car, 
  CreditCard, 
  IndianRupee, 
  BarChart3, 
  CircleDashed,
  ReceiptText
} from "lucide-react";
import RevenueChart from "@/components/RevenueChart";
import OccupancyChart from "@/components/OccupancyChart";

// Types for our dashboard stats
interface DashboardStats {
  totalReservations: number;
  totalPayments: number;
  totalRevenue: number;
  occupancyRate: number;
}

const AdminDashboard = () => {
  const { adminSession } = useAuth();
  const { parkingLots, reservations } = useParking();
  const [stats, setStats] = useState<DashboardStats>({
    totalReservations: 0,
    totalPayments: 0,
    totalRevenue: 0,
    occupancyRate: 0
  });

  // Calculate dashboard statistics
  useEffect(() => {
    // Count total reservations
    const totalReservations = reservations.length;
    
    // Each reservation has a payment
    const totalPayments = reservations.length;
    
    // Sum up all revenue
    const totalRevenue = reservations.reduce((sum, reservation) => sum + reservation.price, 0);
    
    // Calculate occupancy rate
    let totalSpots = 0;
    let reservedSpots = 0;
    
    parkingLots.forEach(lot => {
      totalSpots += lot.spots.length;
      reservedSpots += lot.spots.filter(spot => !spot.available).length;
    });
    
    const occupancyRate = totalSpots > 0 
      ? Math.round((reservedSpots / totalSpots) * 100) 
      : 0;
    
    setStats({
      totalReservations,
      totalPayments,
      totalRevenue,
      occupancyRate
    });
  }, [reservations, parkingLots]);

  // Important: Move this before any hooks to avoid the "React Hook rules" error
  if (!adminSession) {
    return <Navigate to="/admin-login" replace />;
  }

  // Get parking spots by lot
  const parkingByLot = parkingLots.map(lot => ({
    id: lot.id,
    name: lot.name,
    totalSpots: lot.spots.length,
    availableSpots: lot.spots.filter(spot => spot.available).length,
    occupiedSpots: lot.spots.filter(spot => !spot.available).length,
    occupancyRate: Math.round((lot.spots.filter(spot => !spot.available).length / lot.spots.length) * 100)
  }));

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center space-x-2 mb-8">
          <BarChart3 className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Car className="h-5 w-5 text-red-500" />
                  <span className="font-medium">Total Reservations</span>
                </div>
                <span className="text-2xl font-bold">{stats.totalReservations}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">Total Payments</span>
                </div>
                <span className="text-2xl font-bold">{stats.totalPayments}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <IndianRupee className="h-5 w-5 text-amber-500" />
                  <span className="font-medium">Total Revenue</span>
                </div>
                <span className="text-2xl font-bold">₹{stats.totalRevenue}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CircleDashed className="h-5 w-5 text-violet-500" />
                  <span className="font-medium">Occupancy Rate</span>
                </div>
                <span className="text-2xl font-bold">{stats.occupancyRate}%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section - Modified Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <RevenueChart reservations={reservations} />
          <OccupancyChart parkingLots={parkingLots} />
        </div>

        {/* Parking Availability Table */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Car className="h-5 w-5 text-primary" />
              <CardTitle>Parking Availability by Location</CardTitle>
            </div>
            <CardDescription>
              Current status of parking spots across all locations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Parking Location</TableHead>
                  <TableHead>Total Spots</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead>Occupied</TableHead>
                  <TableHead>Occupancy Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parkingByLot.length > 0 ? (
                  parkingByLot.map((lot) => (
                    <TableRow key={lot.id}>
                      <TableCell className="font-medium">{lot.name}</TableCell>
                      <TableCell>{lot.totalSpots}</TableCell>
                      <TableCell className="text-green-600">{lot.availableSpots}</TableCell>
                      <TableCell className="text-amber-600">{lot.occupiedSpots}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-full bg-muted rounded-full h-2.5 mr-2">
                            <div 
                              className="bg-primary h-2.5 rounded-full" 
                              style={{ width: `${lot.occupancyRate}%` }}
                            ></div>
                          </div>
                          <span>{lot.occupancyRate}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No parking lots available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Payment History Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <ReceiptText className="h-5 w-5 text-amber-500" />
              <CardTitle>Payment History</CardTitle>
            </div>
            <CardDescription>
              History of all payments processed in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Spot ID</TableHead>
                  <TableHead>Parking Lot</TableHead>
                  <TableHead>Amount Paid</TableHead>
                  <TableHead>Payment Time</TableHead>
                  <TableHead>User</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservations.length > 0 ? (
                  reservations.map((reservation) => (
                    <TableRow key={reservation.id}>
                      <TableCell>{reservation.spotNumber}</TableCell>
                      <TableCell>{reservation.parkingLotName}</TableCell>
                      <TableCell>₹{reservation.price}</TableCell>
                      <TableCell>{new Date(reservation.timestamp).toLocaleString()}</TableCell>
                      <TableCell>{reservation.userId.split('_')[1]}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No payments recorded yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
