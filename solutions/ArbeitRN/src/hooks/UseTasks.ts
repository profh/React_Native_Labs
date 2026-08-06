import { useState, useEffect } from 'react';
import { Task } from '../models/Task';
import { taskRepository } from '../repositories/TaskRepository';


export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to task updates from Firestore
    const unsubscribe = taskRepository.subscribe((updatedTasks) => {
      setTasks(updatedTasks);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return { tasks, loading };
};