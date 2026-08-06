import { useContext, useState } from "react";
import { Button, Switch, Text, TextInput, View, Alert, Keyboard  } from "react-native";
import { LibraryContext } from "../controllers/LibraryContext";
import { LibraryContextType } from "../types";
import { appStyles } from "../styles";
import DropDownPicker from 'react-native-dropdown-picker';
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function NewBookView() {
  const { addBookToLibrary } = useContext(LibraryContext) as LibraryContextType;

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [gender, setGender] = useState('Male');
  const [displayed, setDisplayed] = useState(false);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Other', value: 'Other' }
  ]);

  const handleAddBook = () => {
    Keyboard.dismiss();
    if (title && author) {
      addBookToLibrary(title, author, gender, displayed);
      setTitle('');
      setAuthor('');
      setGender('Male');
      setDisplayed(false);
      Alert.alert('Success', 'Book added to the library!');
    } else {
      Alert.alert('Error', 'Please provide both title and author.');
    }
  };

  return (
    <SafeAreaProvider style={appStyles.container}>
      <Text style={appStyles.header}>New Book</Text>
      <TextInput
        style={appStyles.input}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={appStyles.input}
        placeholder="Author"
        value={author}
        onChangeText={setAuthor}
      />
      <DropDownPicker
        open={open}
        value={gender}
        items={items}
        setOpen={setOpen}
        setValue={setGender}
        setItems={setItems}
      />
      <Switch
        value={displayed}
        onValueChange={setDisplayed}
      />
      <Button
        title="Add Book"
        onPress={handleAddBook}
        disabled={!title || !author}
      />
    </SafeAreaProvider>
  );
}