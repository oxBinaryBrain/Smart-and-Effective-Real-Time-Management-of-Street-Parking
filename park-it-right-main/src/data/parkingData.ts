
import { centralAreaParkingLots } from "./parkingAreas/central";
import { suburbanAreaParkingLots } from "./parkingAreas/suburban";
import { ruralAreaParkingLots } from "./parkingAreas/rural";

export const parkingData = [
  ...centralAreaParkingLots,
  ...suburbanAreaParkingLots,
  ...ruralAreaParkingLots,
];
