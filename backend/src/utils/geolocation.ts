interface PharmacyLocation {
  _id: string;
  name: string;
  latitude: number;
  longitude: number;
  distance: number;
}

export const findNearbyPharmacies = (
  pharmacies: any[],
  userLat: number,
  userLng: number,
  radius: number = 5000 // 5km default
): PharmacyLocation[] => {
  const toRad = (value: number) => (value * Math.PI) / 180;

  return pharmacies
    .map((pharmacy: any) => {
      const lat1 = toRad(userLat);
      const lat2 = toRad(pharmacy.latitude);
      const deltaLat = toRad(pharmacy.latitude - userLat);
      const deltaLng = toRad(pharmacy.longitude - userLng);

      const a =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = 6371 * c * 1000; // Distance in meters

      return {
        ...pharmacy,
        distance
      };
    })
    .filter((pharmacy: any) => pharmacy.distance <= radius)
    .sort((a: any, b: any) => a.distance - b.distance);
};