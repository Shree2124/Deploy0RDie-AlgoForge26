export function generateRandomLocations(
  centerLat: number,
  centerLng: number,
  count: number,
  radiusKm = 2
) {
  return Array.from({ length: count }, (_, i) => {
    const r = radiusKm / 111;
    const u = Math.random();
    const v = Math.random();

    const w = r * Math.sqrt(u);
    const t = 2 * Math.PI * v;

    const lat = centerLat + w * Math.cos(t);
    const lng = centerLng + w * Math.sin(t);

    return {
      id: i + 1,
      lat,
      lng
    };
  });
}
