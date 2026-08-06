import React, { useState, useLayoutEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SwipeListView } from 'react-native-swipe-list-view';
import { Ionicons } from '@expo/vector-icons';
import { usePeople } from '../context/PeopleContext';
import { RootStackParamList } from '../navigation/Types';
import { colors, styles } from '../styles/Styles';

type SortOrder = 'asc' | 'desc';
type PeopleScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'People'>;

const PeopleScreen: React.FC = () => {
  const navigation = useNavigation<PeopleScreenNavigationProp>();
  const { people, addPerson, deletePerson } = usePeople();
  const [searchText, setSearchText] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const handleAddPerson = () => {
    const person = addPerson();
    navigation.navigate('EditPerson', { personId: person.id });
  };

  const handleSort = () => {
    Alert.alert('Sort', undefined, [
      { text: 'Name (A-Z)', onPress: () => setSortOrder('asc') },
      { text: 'Name (Z-A)', onPress: () => setSortOrder('desc') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerSearchBarOptions: {
        placeholder: 'Search',
        onChangeText: (event: any) => setSearchText(event.nativeEvent.text),
      },
      headerRight: () => (
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={handleSort} style={styles.headerButton}>
            <Ionicons name="swap-vertical" size={22} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleAddPerson} style={styles.headerButton}>
            <Ionicons name="add" size={26} color={colors.primary} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, people]);

  const displayedPeople = useMemo(() => {
    let filtered = people;
    if (searchText.trim() !== '') {
      const lower = searchText.toLowerCase();
      filtered = people.filter(
        (p) => p.name.toLowerCase().includes(lower) || p.email.toLowerCase().includes(lower)
      );
    }
    return [...filtered].sort((a, b) =>
      sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    );
  }, [people, searchText, sortOrder]);
  
  const handleDelete = (rowMap: { [key: string]: any }, rowKey: string) => {
    rowMap[rowKey]?.closeRow();
    deletePerson(rowKey);
  };

  return (
    <View style={styles.container}>
      <SwipeListView
        data={displayedPeople}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.personRow}
            onPress={() => navigation.navigate('EditPerson', { personId: item.id })}
          >
            <Text style={styles.personName}>{item.name || 'New Contact'}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.darkGray} />
          </TouchableOpacity>
        )}
        renderHiddenItem={(data, rowMap) => (
          <View style={styles.rowBack}>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(rowMap, data.item.id)}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        rightOpenValue={-75}
        disableRightSwipe
      />
    </View>
  );
};

export default PeopleScreen;