import { useState } from 'react';
import { Task } from '../models/Task';
import { taskRepository } from '../repositories/TaskRepository';

export const useTask = (initialTask?: Task) => {
  const [task, setTask] = useState<Task>(
    initialTask || {
      name: '',
      assignedTo: '',
      dueDate: new Date(),
      dateAdded: new Date(),
      completed: false,
    }
  );

  const updateTask = (updates: Partial<Task>) => {
    setTask((prev) => ({ ...prev, ...updates }));
  };

  const saveTask = async (): Promise<void> => {
    if (task.id) {
      // Update existing task
      await taskRepository.update(task);
    } else {
      // Add new task
      await taskRepository.add(task);
    }
  };

  const deleteTask = async (): Promise<void> => {
    if (task.id) {
      await taskRepository.delete(task.id);
    }
  };

  const toggleCompleted = async (): Promise<void> => {
    if (task.id) {
      await taskRepository.toggleCompleted(task);
    }
  };

  return {
    task,
    updateTask,
    saveTask,
    deleteTask,
    toggleCompleted,
  };
};