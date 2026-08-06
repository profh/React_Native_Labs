import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { styles } from '../styles/AppStyles';

export const RepositoryRow = ({ repository, onPress }) => (
  <TouchableOpacity style={styles.repositoryRow} onPress={onPress}>
    <View>
      <Text style={styles.repositoryName}>{repository.name}</Text>
      <Text style={styles.repositoryDescription} numberOfLines={1}>
        {repository.description || 'N/A'}
      </Text>
    </View>
  </TouchableOpacity>
);