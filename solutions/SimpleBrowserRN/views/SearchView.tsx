import { Button, TextInput, View } from "react-native";
import React from "react";
import styles from "../styles";
import { SearchViewProps } from "../types";

function SearchView({ inputUrl, setInputUrl, loadUrl }: SearchViewProps): React.JSX.Element {
  return (
    <View style={styles.searchContainer}>
      <TextInput
        style={styles.searchBar}
        value={inputUrl}
        onChangeText={setInputUrl}
      />
      <Button
        title="Search!"
        onPress={loadUrl}
      />
    </View>
  )
}

export default SearchView;