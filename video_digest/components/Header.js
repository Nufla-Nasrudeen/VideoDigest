// Header.js
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const Header = ({ title }) => {
  return (
    <View style={styles.header}>
      <Image
        source={require('../assets/Logo.png')} // Ensure you have the logo image in the specified path
        style={styles.logo}
      />
      <Text style={styles.headerText}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  logo: {
    width: 50, // Adjust the size as needed
    height: 50, // Adjust the size as needed
    marginRight: 10,
  },
  headerText: {
    fontSize: 24,
    color: '#731e9e',
    fontWeight: 'bold',
  },
});

export default Header;
