import { CarCoordinate } from '../models/CarCoordinate';

export type RootStackParamList = {
  App: undefined;
  Map: {
    coordinate: CarCoordinate;
  };
};