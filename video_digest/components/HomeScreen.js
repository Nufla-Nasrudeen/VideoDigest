// HomeScreen.js
import React from 'react';
import { SafeAreaView, StyleSheet, ScrollView, View, Text, Button,useColorScheme } from 'react-native';
import Header from './Header';

const HomeScreen = ({ navigation }) => {
  const colorScheme = useColorScheme(); // Get the device's color scheme (dark or light)

  return (
    <SafeAreaView style={styles.container}>
      <Header title="VideoDigest" />
      <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.scrollView}>
        <View style={styles.body}>
          <Text style={styles.title}>Youtube and Local Video Summarizer</Text>
          <Text style={styles.appintro}>Get the text summary of youtube videos and local videos you have in your device.</Text>
          <View style={styles.stepsContainer}>
            <Text style={styles.step}>How to do:</Text>           
            <Text style={styles.step}>1. Click 'Continue' button.</Text>
            <Text style={styles.step}>2. Paste the video's youtube link or upload the video from your device.</Text>
            <Text style={styles.step}>3. Click the "Summarize" button.</Text>
          </View>
          <Button
            title="Continue" 
            onPress={() => navigation.navigate('Summarization')}
            color="#731e9e"
            
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  darkContainer: {
    backgroundColor: '#121212', // Dark mode background color
  },
  scrollView: {
    //flexGrow: 1,//
    backgroundColor: '#f8f9fa',
    //justifyContent: 'space-between',
  },
  darkscrollView: {
    //flexGrow: 1,//
    backgroundColor: '#121212',
    //justifyContent: 'space-between',
  },
  body: {
    padding: 20,
    //flexGrow: 1,//
    //justifyContent: 'center',//
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  darkTitle: {
    color: '#fff', // Dark mode title color
  },
  appintro: {
    fontSize: 16,
    marginBottom: 50,
    textAlign: 'center',
  },
  darkAppIntro: {
    color: '#ccc', // Dark mode app intro color
  },
  stepsContainer: {
    backgroundColor: '#e7d8f0',
    //borderRadius: 5,
    padding: 10,
    //marginTop:35,
    marginBottom: 50,
    
  },
  step: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'left',
  },
  darkStep: {
    color: '#ccc', // Dark mode step color
  },
 
});

export default HomeScreen;
