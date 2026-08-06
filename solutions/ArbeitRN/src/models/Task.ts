export interface Task {
  id?: string;
  name: string;
  assignedTo: string;
  dueDate: Date;
  dateAdded: Date;
  completed: boolean;
}

export class TaskValidator {
  static isValid(name: string, assignedTo: string): boolean {
    return name.trim().length > 0 && assignedTo.trim().length > 0;
  }
}

export const compareTasksByName = (a: Task, b: Task): number => {
  return a.name.localeCompare(b.name);
};

export const areTasksEqual = (a: Task, b: Task): boolean => {
  return (
    a.name === b.name &&
    a.assignedTo === b.assignedTo &&
    a.dueDate.getTime() === b.dueDate.getTime()
  );
};