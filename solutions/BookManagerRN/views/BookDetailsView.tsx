import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BookDetailsScreenProps } from '../types';
import { appStyles } from '../styles';

const BookDetailsView: React.FC<BookDetailsScreenProps> = ({ route }) => {
  const { book } = route.params;

  return (
    <View style={appStyles.container}>
      <Text style={appStyles.bookTitle}>{book.title}</Text>
      <Text style={appStyles.input}>Author: {book.author} ({book.gender})</Text>
    </View>
  );
};

export default BookDetailsView;