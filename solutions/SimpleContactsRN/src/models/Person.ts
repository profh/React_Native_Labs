import uuid from 'react-native-uuid';

export interface Person {
  id: string;
  name: string;
  email: string;
  details: string;
  photoUri?: string;
}

export const createBlankPerson = (): Person => ({
  id: uuid.v4(),
  name: '',
  email: '',
  details: '',
});