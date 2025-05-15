
export const generateSpots = (totalSpots: number) => {
  const spots = [];
  for (let i = 1; i <= totalSpots; i++) {
    spots.push({
      id: `spot_${i}`,
      spotNumber: i,
      available: Math.random() > 0.4,
    });
  }
  return spots;
};
