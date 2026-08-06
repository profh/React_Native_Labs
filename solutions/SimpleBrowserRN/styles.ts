import { StyleSheet, Dimensions } from "react-native";

const deviceHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    top: 60,
  },
  searchBar: {
    flex: 2,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
    marginRight: 10,
  },
  searchButton: {
    fontSize: 32,
  },
  controlBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    top: 20
  },
  webViewContainer: {
    height: deviceHeight - 120,
    padding: 10,
    top: 45,
  },
})

export default styles;