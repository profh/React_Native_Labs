import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Task } from '../models/Task';

export class TaskRepository {
  private collectionName = 'tasks';

  /**
   * Subscribe to real-time updates for all tasks
   * @param callback Function to call when tasks are updated
   * @returns Unsubscribe function
   */
  subscribe(callback: (tasks: Task[]) => void): () => void {
    const tasksCollection = collection(db, this.collectionName);

    return onSnapshot(tasksCollection, (querySnapshot) => {
      const tasks: Task[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        tasks.push({
          id: doc.id,
          name: data.name,
          assignedTo: data.assignedTo,
          dueDate: data.dueDate?.toDate() || new Date(),
          dateAdded: data.dateAdded?.toDate() || new Date(),
          completed: data.completed || false,
        });
      });

      // Sort tasks: incomplete first, then by due date
      tasks.sort((a, b) => {
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        return a.dueDate.getTime() - b.dueDate.getTime();
      });

      callback(tasks);
    });
  }

  /**
   * Add a new task to Firestore
   * @param task Task to add (without id)
   */
  async add(task: Omit<Task, 'id'>): Promise<void> {
    const tasksCollection = collection(db, this.collectionName);
    await addDoc(tasksCollection, {
      name: task.name,
      assignedTo: task.assignedTo,
      dueDate: Timestamp.fromDate(task.dueDate),
      dateAdded: Timestamp.fromDate(task.dateAdded),
      completed: task.completed,
    });
  }

  /**
   * Update an existing task
   * @param task Task to update (must have id)
   */
  async update(task: Task): Promise<void> {
    if (!task.id) {
      throw new Error('Task must have an id to be updated');
    }

    const taskDoc = doc(db, this.collectionName, task.id);
    await updateDoc(taskDoc, {
      name: task.name,
      assignedTo: task.assignedTo,
      dueDate: Timestamp.fromDate(task.dueDate),
      dateAdded: Timestamp.fromDate(task.dateAdded),
      completed: task.completed,
    });
  }

  /**
   * Delete a task
   * @param taskId ID of task to delete
   */
  async delete(taskId: string): Promise<void> {
    const taskDoc = doc(db, this.collectionName, taskId);
    await deleteDoc(taskDoc);
  }

  /**
   * Toggle the completed status of a task
   * @param task Task to toggle
   */
  async toggleCompleted(task: Task): Promise<void> {
    if (!task.id) {
      throw new Error('Task must have an id to be updated');
    }

    const taskDoc = doc(db, this.collectionName, task.id);
    await updateDoc(taskDoc, {
      completed: !task.completed,
    });
  }
}

// Export a singleton instance
export const taskRepository = new TaskRepository();
