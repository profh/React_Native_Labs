import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import LibraryView from './LibraryView';
import NewBookView from './NewBookView';
import ChartsView from './ChartsView';
import { LibraryProvider } from '../controllers/LibraryContext';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import BookDetailsView from './BookDetailsView';

const Tab = createBottomTabNavigator();

const LibraryStack = createStackNavigator<RootStackParamList>();

const LibraryStackScreen = () => {
  return (
    <LibraryStack.Navigator>
      <LibraryStack.Screen
        name="LibraryView"
        component={LibraryView}
        options={{ headerShown: false, title: "Library" }}
      />
      <LibraryStack.Screen
        name="BookDetails"
        component={BookDetailsView}
        options={{ title: 'Book Details' }}
      />
    </LibraryStack.Navigator>
  );
};

const AppView: React.FC = () => {
  return (
    <LibraryProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ color, size }) => {
              let iconName: string = '';
              if (route.name === 'Library') {
                iconName = 'library-sharp';
              } else if (route.name === 'New Book') {
                iconName = 'book-outline';
              } else if (route.name === 'Charts') {
                iconName = 'bar-chart';
              }
              return <Ionicons name={iconName} size={size} color={color} />;
            },
            headerShown: false,
            tabBarActiveTintColor: 'blue',
            tabBarInactiveTintColor: 'gray',
          })}
        >
          <Tab.Screen name="Library" component={LibraryStackScreen} />
          <Tab.Screen name="New Book" component={NewBookView} />
          <Tab.Screen name="Charts" component={ChartsView} />
        </Tab.Navigator>
      </NavigationContainer>
    </LibraryProvider>
  );
};

export default AppView;