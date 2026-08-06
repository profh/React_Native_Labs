import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Person, createBlankPerson } from '../models/Person';

export const STORAGE_KEY = '@SimpleContacts:people';

export type PeopleContextType = {
  people: Person[];
  loading: boolean;
  addPerson: () => Person;
  updatePerson: (id: string, updates: Partial<Person>) => void;
  deletePerson: (id: string) => void;
  getPerson: (id: string) => Person | undefined;
};

export const PeopleContext = createContext<PeopleContextType | undefined>(undefined);

export const usePeople = (): PeopleContextType => {
  const context = useContext(PeopleContext);
  if (!context) {
    throw new Error('usePeople must be used within a PeopleProvider');
  }
  return context;
};