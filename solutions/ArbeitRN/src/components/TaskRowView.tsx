import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Task } from '../models/Task';
import { styles } from '../styles/Styles';
import { formatDate } from '../utils/TaskFormHelpers';

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