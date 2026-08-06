import { FlatList, Pressable, Text, StyleSheet, View, TouchableOpacity } from "react-native";
import { LibraryContextType, RootStackParamList } from "../types";
import { useContext } from "react";
import { LibraryContext } from "../controllers/LibraryContext";
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { appStyles } from "../styles";
import BookRow from "./BookRow";
import { SwipeListView } from 'react-native-swipe-list-view';
import Ionicons from "@react-native-vector-icons/ionicons/static";

const LibraryView: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { books, setBooks } = useContext(LibraryContext) as LibraryContextType;

  const deleteBook = (rowMap: { [key: string]: any }, rowKey: string) => {
    rowMap[rowKey]?.closeRow();
    setBooks(books.filter((item) => item.id !== rowKey));
  };

  return (
    <SafeAreaProvider style={appStyles.container}>
      <Text style={appStyles.header}>Library</Text>
      <SwipeListView
        data={books.filter((book) => book.displayed)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (BookRow({ item, onPress: () => navigation.navigate('BookDetails', { book: item }) }))}
        renderHiddenItem={(data, rowMap) => (
          <TouchableOpacity onPress={() => deleteBook(rowMap, data.item.id)}>
            <Ionicons name="trash" size={25} color="red" style={appStyles.trashIcon} />
          </TouchableOpacity>
        )}
        leftOpenValue={0}
        rightOpenValue={-75}
        disableRightSwipe
      />
    </SafeAreaProvider>
  );
}

export default LibraryView;