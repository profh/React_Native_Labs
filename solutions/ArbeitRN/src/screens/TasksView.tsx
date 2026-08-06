import React from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Text,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTasks } from '../hooks/UseTasks';
import { TaskRowView } from '../components/TaskRowView';
import { taskRepository } from '../repositories/TaskRepository';
import { RootStackParamList } from '../navigation/AppNavigator';
import { styles, colors } from '../styles/Styles';

type TasksViewNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Tasks'>;

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