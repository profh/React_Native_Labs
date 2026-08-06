import React from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useRoute } from '@react-navigation/native';
import { usePeople } from '../context/PeopleContext';
import { RootStackParamList } from '../navigation/Types';
import { styles, colors } from '../styles/Styles';

type EditPersonRouteProp = RouteProp<RootStackParamList, 'EditPerson'>;

const EditPersonScreen: React.FC = () => {
  const route = useRoute<EditPersonRouteProp>();
  const { personId } = route.params;
  const { getPerson, updatePerson } = usePeople();
  const person = getPerson(personId);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0 && person) {
      updatePerson(person.id, { photoUri: result.assets[0].uri });
    }
  };

  if (!person) {
    return (
      <View style={styles.centerContainer}>
        <Text>Contact not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.centerContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.section}>
        {person.photoUri ? (
          <Image source={{ uri: person.photoUri }} style={styles.photo} resizeMode="cover" />
        ) : null}
        <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
          <Ionicons name="person-circle-outline" size={20} color={colors.primary} />
          <Text style={styles.photoButtonText}>Select a photo</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Information</Text>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={person.name}
          onChangeText={(text) => updatePerson(person.id, { name: text })}
          textContentType="name"
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={person.email}
          onChangeText={(text) => updatePerson(person.id, { email: text })}
          textContentType="emailAddress"
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Details</Text>
        <TextInput
          style={[styles.input, styles.detailsInput]}
          placeholder="Details on this person"
          value={person.details}
          onChangeText={(text) => updatePerson(person.id, { details: text })}
          multiline
        />
      </View>
    </ScrollView>
  );
};

export default EditPersonScreen;