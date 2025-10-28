import { StyleSheet, Text, View } from "react-native";

export default function CitiesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>City Search & Management</Text>
      <Text style={styles.subtitle}>
        We'll build out the location search and management features here later!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1E1E1E", // Dark background for contrast
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#AAAAAA",
    textAlign: "center",
    paddingHorizontal: 30,
  },
});
