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
import DateTimePicker, { DateTimePickerChangeEvent } from '@react-native-community/datetimepicker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useTask } from '../hooks/UseTask';
import { TaskValidator } from '../models/Task';
import { RootStackParamList } from '../navigation/AppNavigator';
import { styles } from '../styles/Styles';
import { createDateChangeHandler, createDeleteHandler, createSaveHandler, formatDate } from '../utils/TaskFormHelpers';

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
            onValueChange={handleDateChange}
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
