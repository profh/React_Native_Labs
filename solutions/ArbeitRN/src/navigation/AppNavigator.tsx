import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Task } from "../models/Task";
import { TasksView } from "../screens/TasksView";
import { NavigationContainer } from "@react-navigation/native";
import { TaskDetailsView } from "../screens/TaskDetailsView";
import { NewTaskView } from "../screens/NewTaskView";

export type RootStackParamList = {
  Tasks: undefined;
  TaskDetails: { task: Task };
  NewTask: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Tasks"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}>
        <Stack.Screen
          name="Tasks"
          component={TasksView}
          options={{ title: 'Arbeit' }}
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