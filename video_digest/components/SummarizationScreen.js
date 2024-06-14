import React, {useState,useEffect } from 'react';
import { Platform } from 'react-native'; // Import Platform for file extension validation
import { SafeAreaView, StyleSheet, ScrollView, View, Text, TextInput, TouchableOpacity, Button ,BackHandler,Alert} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as DocumentPicker from 'expo-document-picker';
import axios from 'axios';
import Header from './Header';


const SummarizationScreen = () => {

  const [link, setLink] = useState('');
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
      });

      if (!result.cancelled) {
        const selectedFile = result;
        const formData = new FormData();
        formData.append('file', {
          uri: selectedFile.uri,
          type: selectedFile.type,
          name: selectedFile.name,
        });

        setFile(formData);
        setErrorMessage('');
      }
    } catch (err) {
      console.log('Error selecting file:', err);
    }
  };

  const uploadFile = async () => {
    if (!file) {
      setErrorMessage('Please select a file to upload.');
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:5000/summarize_local', file, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSummary(response.data.summary);
      Alert.alert('Upload Success', 'File uploaded successfully!');
    } catch (error) {
      Alert.alert('Upload Failed', 'Failed to upload file');
      console.log('Upload Error', error);
    }
  };
  // const [link, setLink] = useState('');
  // const [file, setFile] = useState(null);
  // const [summary, setSummary] = useState('');
  // const [errorMessage, setErrorMessage] = useState('');//

  
  // useEffect(() => {
  //   const backAction = () => {
  //     navigation.goBack();
  //     return true;
  //   };

  //   const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

  //   return () => backHandler.remove();
  // }, []);


  // const handleFileUpload = async () => {
  //   try {
  //     const result = await DocumentPicker.getDocumentAsync({
  //       type: '*/*',
  //     });
  //     console.log('Selected File:', result); // Log the selected file information
  //     if (!result.cancelled) {
  //       const selectedFile = result.assets[0];
  //       // Check if the uploaded file is a video file (supported file extensions: mp4, mov, avi, etc.)
  //       const videoExtensions = ['mp4', 'mov', 'avi']; // Add more extensions if needed
  //       const fileExtension = selectedFile.name.split('.').pop(); // Get file extension
  //       if (!videoExtensions.includes(fileExtension.toLowerCase())) {
  //           setErrorMessage('Please upload a valid video file.');
  //           return;
  //       }
  //       setFile(selectedFile);
  //       // Clear error message when a valid file is uploaded
  //       setErrorMessage('');
  //     }
  //   } catch (err) {
  //     console.log('Error selecting file:', err); // Log any errors that occur
  //   }
  // };

  // const uploadFile = async () => {
  //   if (!file) {
  //       setErrorMessage('Please select a file to upload.');
  //       return;
  //   }
  
  //   const formData = new FormData();
  //   formData.append('file', {
  //     uri: file.uri,
  //     type: file.mimeType,
  //     name: file.name,
  //   });
  
  //   try {
  //     const response = await axios.post('http://127.0.0.1:5000/summarize_local', formData, {
  //       headers: {
  //         'Content-Type': 'multipart/form-data',
  //       },
  //     });
  //     console.log('Upload Response:', response.data); // Add this line
  
  //    // Alert.alert('Upload Success', 'File uploaded successfully!');
  //     //console.log('Upload Success', response.data);
  //     setSummary(response.data.summary);
  //     Alert.alert('Upload Success', 'File uploaded successfully!');
 
  //   } catch (error) {
  //     Alert.alert('Upload Failed', 'Failed to upload file');
  //     console.log('Upload Error', error);
  //   }
  // };

  const handleSummarize = async () => {
    if (!link && !file) {
        setErrorMessage('Please paste a valid youtube video link or upload a video file.');
        return;
    }
    // Clear error message when a link is pasted or a video is uploaded
    setErrorMessage('');

    if (link) {
        if (!isYouTubeLink(link)) {
          setErrorMessage('Please paste a valid YouTube video link.');
          return;
        } else {
          // Clear error message when a valid YouTube link is pasted
          //setErrorMessage('');
          try {
            const response = await axios.post('http://127.0.0.1:5000/summarize_youtube', { url: link });
            setSummary(response.data.summary);
          } catch (error) {
            Alert.alert('Error', 'Failed to summarize YouTube video.');
            console.log('Error summarizing YouTube video:', error);
          }
        }
      }
  
    if (file) {
      // Check if the uploaded file is a video file (supported file extensions: mp4, mov, avi, etc.)
        const videoExtensions = ['mp4', 'mov', 'avi']; // Add more extensions if needed
        const fileExtension = file.name.split('.').pop(); // Get file extension
        if (!videoExtensions.includes(fileExtension.toLowerCase())) {
            setErrorMessage('Please upload a valid video file.');
            return;
        }   
      // Call uploadFile if a file is selected
      uploadFile();
    }
  
    // Here you would implement the logic to summarize the video based on the link or file
    // For this example, we'll just set a dummy summary
   // setSummary('This is a dummy summary of the video.');
  };

  const isYouTubeLink = (link) => {
    // Regular expression to match YouTube video URLs
    const youtubeRegex = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/;
    return youtubeRegex.test(link);
  };
  

  return (
    <SafeAreaView style={styles.container}>
      <Header title="VideoDigest" />
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.label}>Paste Video Link:</Text>
        <TextInput
          style={styles.input}
          onChangeText={setLink}
          value={link}
          placeholder="Enter video link"
        />
        <Text style={styles.label}>Upload Video File:</Text>
        <TouchableOpacity style={styles.uploadBox} onPress={handleFileUpload} >
        {(!file) && (
            <>
            <Icon name="file-upload" size={24} color="#888" />
            <Text style={styles.uploadText}>Tap to upload file</Text>
            </>
        )}
        {(file) && (
            <Text style={styles.uploadText}>{file.name}</Text>
        )}
        </TouchableOpacity>
         <Button title="Summarize" onPress={handleSummarize} color="#731e9e" />
         {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}
       
         {summary && (
          <ScrollView  style={styles.summaryBox}>
            <Text style={styles.summaryText}>{summary}</Text>
          </ScrollView >
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  body: {
    paddingBottom: 100,
    flexGrow: 1,
    padding:20,
    justifyContent: 'center',
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    backgroundColor: '#e7d8f0',
    borderWidth: 1,
    marginBottom: 20,
    paddingLeft: 8,
    color: '#888'
  }, 
  summaryBox: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#e7d8f0',
    //borderRadius: 5,
    maxHeight: 250,
  },
  summaryText: {
    fontSize: 16,
  },
  uploadBox: {
    height: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    //borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    backgroundColor: '#e7d8f0',
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical:30,
  },
  uploadText: {
    fontSize: 16,
    color: '#888',
    marginLeft: 10,
    alignItems:'center',
  },
  errorMessage: {
    color: 'red',
    marginTop: 10,
  },
});

export default SummarizationScreen;

