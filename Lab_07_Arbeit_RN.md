# Lab 7: Arbeit Task Manager (RN)

Last week we learned to save data on the mobile device itself.  This week in lab, you will learn to save data in the cloud using Firebase Firestore. You'll learn about app architecture, state management, Firebase integration, and the like.  Here is a preview of what the app will look like:

<img src=https://i.imgur.com/OopE7mB.png width="25%"/> 
<img src=https://i.imgur.com/OhRhn7z.png width="25%"/>
<img src=https://i.imgur.com/Gw6D8rf.png width="25%"/>

I realize it's been a little while since we talked about this in class (and we've had fall break), but it's an important topic so it's worth taking the time to read and understand the code.  Please don't rush through and just copy/paste code to get this lab done; understanding this better will help a lot in Sprint 4 and beyond.

## Part 0: Initial Setup; Firebase

### Initial Setup

1. Create a new project called 'Arbeit' using Expo.  (We've done this plenty of times -- you know the drill by now.)

2. Next we need to create a Firebase Firestore 
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project named "Arbeit"
   - Create a Firestore database (start in test mode since we are in development) and populate it with two test records. The structure should look like this:
      <img src=https://i.imgur.com/QGBIaY2.png width="85%"/>
   
   - Add a web app to the project called ArbeitRN.  After you do this, the next step is 'Add Firebase SDK'. Google will give you some configuration code for npm.  Copy that code to the clipboard.  Create a new directory in the project called `config` and within it create a new file called `firebase.ts`.  Open that new file and paste in the code on the clipboard that you got from Firebase.


3. Now we need to add Firebase dependencies; while we're at this, we probably ought to add a few other dependencies.  Below is the `package.json` file I used to build this app:

```javascript
{
  "name": "arbeitrn",
  "version": "1.0.0",
  "main": "index.ts",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "@react-native-community/datetimepicker": "^8.4.4",
    "@react-navigation/native": "^7.1.18",
    "@react-navigation/native-stack": "^7.3.28",
    "expo": "~54.0.13",
    "expo-status-bar": "~3.0.8",
    "firebase": "^12.4.0",
    "react": "19.1.0",
    "react-native": "0.81.4",
    "react-native-safe-area-context": "^5.6.1",
    "react-native-screens": "~4.16.0"
  },
  "devDependencies": {
    "@types/react": "~19.1.0",
    "typescript": "~5.9.2"
  },
  "private": true
}
```
   


## Part 1: Creating the Task Model

Create a new directory called `src/models` and add a new ts file, `src/models/Task.ts`.  To this file, add to it the following code:

```typescript
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
```

#### Understanding the Code

A couple of reminders from lecture so we understand this code better:

- **Document ID**:
	- Firebase property that will sync with Firestore document ID
	- Optional because new tasks don't have IDs yet

- **Comparable Protocol for React Native**:
	- Enables sorting tasks
	- Implements `==` for equality and `<` for ordering

- **Validation Extension**:
	- Separates validation logic
	- Static method for easy reuse later in the interface



## Part 2: Creating the Repository

Create a new directory called `src/repositories` and add a new ts file, `src/repositories/TaskRepository.ts`.  To this file, add to it the following code:

```typescript
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../config/firebase';
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

```


## Part 3: Creating Hooks

In the iOS app, we would create some ViewModels to help us handle some of the business logic.  In React Native, we typically refer to these as hooks and need two for this app.

#### Step 3.1: Create useTask.ts

Create a new directory called `src/hooks` and add a new ts file, `src/hooks/useTask.ts`.  This will be used to handle issues related to the a particular task.  To this file, add to it the following code:

```typescript
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
```


#### Step 3.2: Create useTasks.ts 

In this same directory add another ts file, `src/hooks/useTasks.ts`.  This will be used to handle issues related to the overall list of tasks.  To this file, add to it the following code:

```typescript
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
```


## Part 4: Creating Screens and Components

Now we have a bunch of views to create -- the task list (and its rows), the task details, new task form and the like.  Create a directory called `components` and another called `screens` and one more called `styles`.  Now let's dive in.

#### Step 4.0: Create styles

Create a new ts file `src/styles/styles.ts` and add the following code:

```typescript
import { StyleSheet, Platform } from 'react-native';

// Color palette
export const colors = {
  primary: '#007AFF',
  background: '#f5f5f5',
  white: '#ffffff',
  black: '#000000',
  textPrimary: '#000000',
  textSecondary: '#666666',
  textTertiary: '#999999',
  border: '#e0e0e0',
  danger: '#FF3B30',
};

// Common styles used across the app
export const styles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  section: {
    backgroundColor: colors.white,
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  // Text styles
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: colors.textTertiary,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  taskName: {
    fontSize: 17,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  assignee: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  dueDate: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 8,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: colors.textTertiary,
  },
  statusText: {
    fontSize: 17,
    color: colors.textPrimary,
  },
  dateText: {
    fontSize: 17,
    color: colors.textPrimary,
  },

  // Input styles
  input: {
    fontSize: 17,
    color: colors.textPrimary,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  // Button styles
  addButton: {
    marginRight: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '600',
    marginTop: -2,
  },
  cancelButton: {
    color: colors.primary,
    fontSize: 17,
    marginLeft: 16,
  },
  saveButton: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: '600',
    marginRight: 16,
  },
  dateButton: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  deleteButton: {
    backgroundColor: colors.danger,
    marginHorizontal: 16,
    marginVertical: 32,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '600',
  },

  // Checkbox styles
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxCompleted: {
    backgroundColor: colors.primary,
  },
  checkmark: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },

  // TaskRowView specific styles
  taskRowContainer: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  taskRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  taskRowLeftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  taskRowTextContainer: {
    flex: 1,
  },

  // Status row styles
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
});
```

**Note:** these are pretty generic; feel free to adjust colors and other styling details however you'd like.

#### Step 4.1: Create TaskRowView

Create a new ts file `src/components/TaskRowView.tsx` and add the following code:

```typescript
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Task } from '../models/Task';
import { styles } from '../styles/styles';

interface TaskRowViewProps {
  task: Task;
  onPress: () => void;
  onToggleCompleted: () => void;
}

export const TaskRowView: React.FC<TaskRowViewProps> = ({
  task,
  onPress,
  onToggleCompleted,
}) => {
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <TouchableOpacity style={styles.taskRowContainer} onPress={onPress}>
      <View style={styles.taskRowContent}>
        <View style={styles.taskRowLeftSection}>
          <TouchableOpacity
            style={[
              styles.checkbox,
              task.completed && styles.checkboxCompleted,
            ]}
            onPress={onToggleCompleted}
          >
            {task.completed && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>

          <View style={styles.taskRowTextContainer}>
            <Text
              style={[
                styles.taskName,
                task.completed && styles.completedText,
              ]}
            >
              {task.name}
            </Text>
            <Text style={styles.assignee}>Assigned to: {task.assignedTo}</Text>
          </View>
        </View>

        <Text
          style={[
            styles.dueDate,
            task.completed && styles.completedText,
          ]}
        >
          {formatDate(task.dueDate)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
```

#### Step 4.2: Create TasksView

Create a new tsx file `src/screens/TasksView.tsx` and add this code:

```typescript
import React from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Text,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTasks } from '../hooks/useTasks';
import { TaskRowView } from '../components/TaskRowView';
import { taskRepository } from '../repositories/TaskRepository';
import { RootStackParamList } from '../navigation/AppNavigator';
import { styles, colors } from '../styles/styles';

type TasksViewNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Tasks'
>;

interface Props {
  navigation: TasksViewNavigationProp;
}

export const TasksView: React.FC<Props> = ({ navigation }) => {
  const { tasks, loading } = useTasks();

  const handleToggleCompleted = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      await taskRepository.toggleCompleted(task);
    }
  };

  const handleTaskPress = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      navigation.navigate('TaskDetails', { task });
    }
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('NewTask')}
          style={styles.addButton}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (tasks.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No tasks yet</Text>
        <Text style={styles.emptySubtext}>Tap + to create your first task</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id || ''}
        renderItem={({ item }) => (
          <TaskRowView
            task={item}
            onPress={() => handleTaskPress(item.id!)}
            onToggleCompleted={() => handleToggleCompleted(item.id!)}
          />
        )}
      />
    </View>
  );
};
```


#### Step 4.3: Create NewTaskView

Create a new tsx file `src/screens/NewTaskView.tsx` and add this code:

```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTask } from '../hooks/useTask';
import { TaskValidator } from '../models/Task';
import { RootStackParamList } from '../navigation/AppNavigator';
import { styles } from '../styles/styles';

type NewTaskViewNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'NewTask'
>;

interface Props {
  navigation: NewTaskViewNavigationProp;
}

export const NewTaskView: React.FC<Props> = ({ navigation }) => {
  const { task, updateTask, saveTask } = useTask();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSave = async () => {
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

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      updateTask({ dueDate: selectedDate });
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveButton}>Save</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, task]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.label}>Task Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter task name"
          value={task.name}
          onChangeText={(text) => updateTask({ name: text })}
          autoFocus
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Assigned To</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter assignee name"
          value={task.assignedTo}
          onChangeText={(text) => updateTask({ assignedTo: text })}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Due Date</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateText}>{formatDate(task.dueDate)}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={task.dueDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
          />
        )}
      </View>
    </ScrollView>
  );
};

```

#### Step 4.4: Create TaskDetailsView

Create a new tsx file `src/screens/TaskDetailsView.tsx` and add this code:

```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useTask } from '../hooks/useTask';
import { TaskValidator } from '../models/Task';
import { RootStackParamList } from '../navigation/AppNavigator';
import { styles } from '../styles/styles';

type TaskDetailsViewNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'TaskDetails'
>;

type TaskDetailsViewRouteProp = RouteProp<RootStackParamList, 'TaskDetails'>;

interface Props {
  navigation: TaskDetailsViewNavigationProp;
  route: TaskDetailsViewRouteProp;
}

export const TaskDetailsView: React.FC<Props> = ({ navigation, route }) => {
  const { task, updateTask, saveTask, deleteTask } = useTask(route.params.task);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSave = async () => {
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

  const handleDelete = () => {
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

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      updateTask({ dueDate: selectedDate });
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Edit Task',
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveButton}>Save</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, task]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.label}>Task Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter task name"
          value={task.name}
          onChangeText={(text) => updateTask({ name: text })}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Assigned To</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter assignee name"
          value={task.assignedTo}
          onChangeText={(text) => updateTask({ assignedTo: text })}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Due Date</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateText}>{formatDate(task.dueDate)}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={task.dueDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Status</Text>
        <TouchableOpacity
          style={styles.statusRow}
          onPress={() => updateTask({ completed: !task.completed })}
        >
          <View
            style={[
              styles.checkbox,
              task.completed && styles.checkboxCompleted,
            ]}
          >
            {task.completed && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.statusText}>
            {task.completed ? 'Completed' : 'Not Completed'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteButtonText}>Delete Task</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

```

###STOP!
If you have been reading the code provided to this point, something is making your brain itch.  This code is in desparate need of refactoring.  Look over what you put in and see where the code could be refactored.  I'll wait.

*Seriously, look over where it needs to be refactored -- don't just skip ahead...*

*Totally serious about looking over this code first before moving ahead.*

*Don't deprive yourself of this learning opportunity.* 😏

---
**Last warning: don't read this until you've identified the issues.**
### Refactoring time 

We have a lot of code duplication -- functions like `handleSave()`, `formatDate()`, and `handleDateChange()` are complete duplicates.  Also, it would be nice to move `handleDelete(`) to outside the screen view and have it handled by the same helper that does the saving. (Remember our lessons about MVC from 67-272; they still apply here.)

We'll start by creating a new directory called `utils` and within it creating a file called `taskFormHelpers.ts`.  Open that file and add in the following code:

```typescript
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

```

Now that we have this, it's time to go back to `TaskDetailsView.tsx` and import these utils and apply them.  Here's how we can do that (*read the code first and see how it was applied*):

```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useTask } from '../hooks/useTask';
import { RootStackParamList } from '../navigation/AppNavigator';
import { styles } from '../styles/styles';
import {
  formatDate,
  createDateChangeHandler,
  createSaveHandler,
  createDeleteHandler,
} from '../utils/taskFormHelpers';

type TaskDetailsViewNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'TaskDetails'
>;

type TaskDetailsViewRouteProp = RouteProp<RootStackParamList, 'TaskDetails'>;

interface Props {
  navigation: TaskDetailsViewNavigationProp;
  route: TaskDetailsViewRouteProp;
}

export const TaskDetailsView: React.FC<Props> = ({ navigation, route }) => {
  const { task, updateTask, saveTask, deleteTask } = useTask(route.params.task);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSave = createSaveHandler(task, saveTask, navigation);
  const handleDateChange = createDateChangeHandler(setShowDatePicker, updateTask);
  const handleDelete = createDeleteHandler(deleteTask, navigation);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Edit Task',
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveButton}>Save</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, task]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.label}>Task Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter task name"
          value={task.name}
          onChangeText={(text) => updateTask({ name: text })}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Assigned To</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter assignee name"
          value={task.assignedTo}
          onChangeText={(text) => updateTask({ assignedTo: text })}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Due Date</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateText}>{formatDate(task.dueDate)}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={task.dueDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Status</Text>
        <TouchableOpacity
          style={styles.statusRow}
          onPress={() => updateTask({ completed: !task.completed })}
        >
          <View
            style={[
              styles.checkbox,
              task.completed && styles.checkboxCompleted,
            ]}
          >
            {task.completed && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.statusText}>
            {task.completed ? 'Completed' : 'Not Completed'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteButtonText}>Delete Task</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};
```
Now we have to do something similar to `NewTaskView.tsx`, but if you understand what we've done so far, this is pretty easy, so I am leaving it as an exercise for you to do on your own.

---

## Part 5: Navigation for the App

We have all the components and screens, but we need to pull these things altogether.  We can do that by creating some navigation for the app and then applying it to `App`.  First step is to create a new directory called `src/navigation` and within it, create a file `src/navigation/AppNavigator.tsx`.  Open that file and add the following:

```typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TasksView } from '../screens/TasksView';
import { NewTaskView } from '../screens/NewTaskView';
import { TaskDetailsView } from '../screens/TaskDetailsView';
import { Task } from '../models/Task';

export type RootStackParamList = {
  Tasks: undefined;
  NewTask: undefined;
  TaskDetails: { task: Task };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Tasks"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      >
        <Stack.Screen
          name="Tasks"
          component={TasksView}
          options={{
            title: 'Arbeit',
          }}
        />
        <Stack.Screen
          name="NewTask"
          component={NewTaskView}
          options={{
            title: 'New Task',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="TaskDetails"
          component={TaskDetailsView}
          options={{
            title: 'Task Details',
            presentation: 'modal',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
```

Now that we have some navigation to pull our three main screens together, it's time to add this to `App`.  Go into the main `App.tsx` file and revise it as follows:

```typescript
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <>
      <AppNavigator />
      <StatusBar style="light" />
    </>
  );
}
```

Open this puppy with Expo Go (you know the drill by now) and verify it's working fine.


## Part 6: Enhancements (Optional Challenges)

This app should be functioning and working and at this point you'll get full credit, but honestly, it's just the start.  There are a number of ways we could expand this app and if you have the time, I'd encourage you to follow up and try to expand on this app because you will learn a lot.  If you are interested, here are some challenges that you might want to pursue to improve the app:

- **Challenge 1: Filter Tasks** --  Add a filter to show only incomplete tasks
- **Challenge 2: Sort Tasks** --  Add sorting by due date or name
- **Challenge 3: Task Priority** --  Add to the Task model and modify the interface to allow the user to set a task priority
- **Challenge 4: Search Tasks** --  Search tasks by either name or assignee
- **Challenge 5: User Authentication** --  Add Firebase Authentication, create login/signup views, and then filter tasks by user


Many, but not all apps this semester, will use Firebase to store some or all of the app's data.  In any case, there are great concepts to learn here, so take your time, understand each concept, and don't hesitate to experiment. 

**Qapla'** 

---

*Lab created by Prof. H - 2025*
