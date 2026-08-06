import { Alert, Platform } from 'react-native';
import { TaskValidator } from '../models/Task';

/**
 * Formats a date object into a human-readable string
 * @param date - The date to format
 * @returns Formatted date string (e.g., "January 15, 2025")
 */
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Creates a date change handler for DateTimePicker
 * @param setShowDatePicker - Function to control date picker visibility
 * @param updateTask - Function to update the task with new date
 * @returns Handler function for date picker onChange event
 */
export const createDateChangeHandler = (
  setShowDatePicker: (show: boolean) => void,
  updateTask: (updates: { dueDate: Date }) => void
) => {
  return (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      updateTask({ dueDate: selectedDate });
    }
  };
};

/**
 * Creates a save handler for task forms
 * @param task - The task object to validate and save
 * @param saveTask - Function to persist the task
 * @param navigation - Navigation object to go back after save
 * @returns Async handler function for save action
 */
export const createSaveHandler = (
  task: { name: string; assignedTo: string },
  saveTask: () => Promise<void>,
  navigation: { goBack: () => void }
) => {
  return async () => {
    if (!TaskValidator.isValid(task.name, task.assignedTo)) {
      Alert.alert('Validation Error', 'Please fill in all fields');
      return;
    }

    try {
      await saveTask();
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save task');
      console.error('Error saving task:', error);
    }
  };
};

/**
 * Creates a delete handler for task forms
 * @param deleteTask - Function to delete the task
 * @param navigation - Navigation object to go back after deletion
 * @returns Handler function that shows confirmation dialog before deleting
 */
export const createDeleteHandler = (
  deleteTask: () => Promise<void>,
  navigation: { goBack: () => void }
) => {
  return () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTask();
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete task');
              console.error('Error deleting task:', error);
            }
          },
        },
      ]
    );
  };
};
