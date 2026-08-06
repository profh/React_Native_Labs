export interface CarCoordinate {
  latitude: number;
  longitude: number;
}

export const defaultCarCoordinate: CarCoordinate = {
  latitude: 0.0,
  longitude: 0.0,
};

export const isValidCoordinate = (coordinate: CarCoordinate): boolean => {
  return coordinate.latitude !== 0 || coordinate.longitude !== 0;
};