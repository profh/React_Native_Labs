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
import { useTask } from '../hooks/UseTask';
import { TaskValidator } from '../models/Task';
import { RootStackParamList } from '../navigation/AppNavigator';
import { styles } from '../styles/Styles';
import { createDateChangeHandler, createSaveHandler, formatDate } from '../utils/TaskFormHelpers';

type NewTaskViewNavigationProp = NativeStackNavigationProp<RootStackParamList, 'NewTask'>;

interface Props {
  navigation: NewTaskViewNavigationProp;
}

export const NewTaskView: React.FC<Props> = ({ navigation }) => {
  const { task, updateTask, saveTask } = useTask();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSave = createSaveHandler(task, saveTask, navigation);
  const handleDateChange = createDateChangeHandler(setShowDatePicker, updateTask);

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
            onValueChange={handleDateChange}
          />
        )}
      </View>
    </ScrollView>
  );
};
