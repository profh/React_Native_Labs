import { ReactNode, useContext, useEffect, useState } from "react";
import { Person, createBlankPerson } from "../models/Person";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PeopleContext, STORAGE_KEY, PeopleContextType } from "../context/PeopleContext";

export const PeopleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPeople();
  }, []);

  useEffect(() => {
    if (!loading) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(people)).catch((error) => {
        console.error('Error saving people:', error);
      });
    }
  }, [people, loading]);

  const loadPeople = async () => {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (json != null) {
        setPeople(JSON.parse(json));
      }
    } catch (error) {
      console.error('Error loading people:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPerson = (): Person => {
    const person = createBlankPerson();
    setPeople((prev) => [...prev, person]);
    return person;
  };

  const updatePerson = (id: string, updates: Partial<Person>) => {
    setPeople((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const deletePerson = (id: string) => {
    setPeople((prev) => prev.filter((p) => p.id !== id));
  };

  const getPerson = (id: string) => people.find((p) => p.id === id);

  return (
    <PeopleContext.Provider
      value={{ people, loading, addPerson, updatePerson, deletePerson, getPerson }}>
      {children}
    </PeopleContext.Provider>
  );
};