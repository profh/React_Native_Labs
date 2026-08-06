import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  headerButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  headerButton: {
    marginHorizontal: 5,
  },
  personRow: {
    flexDirection: "row",
    alignItems: "center",
    left: 0,
    right: 0,
    width: (width - 20),
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    backgroundColor: "#ccc",
    minHeight: 100,
  },
  personName: {
    fontSize: 18,
  },
  rowBack: {
    alignItems: "flex-end",
    backgroundColor: "#DDD",
    flex: 1,
    width: (width - 20),
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "flex-end",
    minHeight: 100,
  },
  deleteButton: {
    backgroundColor: "red",
    width: 75,
    right: 0,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#fff",
  },
  centerContainer: {
  },
  section: {
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
  },
  detailsInput: {
    minHeight: 100,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    resizeMode: "cover",
  },
  photoButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  photoButtonText: {
    marginLeft: 5,
    color: "#007AFF",
  },
});

export const colors = {
  primary: "#007AFF",
  darkGray: "#555",
};