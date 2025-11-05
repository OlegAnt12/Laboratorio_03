import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Button, FlatList, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@call_records';

export default function App() {
  const [recording, setRecording] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    loadRecordings();
    
    // Solicitar permissões ao montar o componente
    (async () => {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
    })();
  }, []);

  const loadRecordings = async () => {
    try {
      const storedRecordings = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedRecordings) {
        setRecordings(JSON.parse(storedRecordings));
      }
    } catch (error) {
      console.error('Erro ao carregar gravações:', error);
    }
  };

  const saveRecording = async (newRecording) => {
    try {
      const updatedRecordings = [...recordings, newRecording];
      setRecordings(updatedRecordings);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecordings));
    } catch (error) {
      console.error('Erro ao salvar gravação:', error);
    }
  };

  const startRecording = async () => {
    try {
      console.log('Iniciando gravação...');
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recordingOptions = {
        android: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      };

      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(recordingOptions);
      await newRecording.startAsync();
      setRecording(newRecording);
      setIsRecording(true);
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      // Criar um objeto de metadados da gravação
      const recordingInfo = {
        id: Date.now().toString(),
        uri,
        date: new Date().toISOString(),
        duration: await getRecordingDuration(uri), // Em segundos
      };

      // Salvar os metadados
      await saveRecording(recordingInfo);

      // Resetar o estado de gravação
      setRecording(null);
      setIsRecording(false);
    } catch (error) {
      console.error('Erro ao parar gravação:', error);
    }
  };

  const getRecordingDuration = async (uri) => {
    try {
      const sound = new Audio.Sound();
      await sound.loadAsync({ uri });
      const status = await sound.getStatusAsync();
      return status.durationMillis / 1000; // Converter para segundos
    } catch (error) {
      console.error('Erro ao obter duração:', error);
      return 0;
    }
  };

  const playRecording = async (uri) => {
    try {
      const sound = new Audio.Sound();
      await sound.loadAsync({ uri });
      await sound.playAsync();
    } catch (error) {
      console.error('Erro ao reproduzir gravação:', error);
    }
  };

  const deleteRecording = async (id) => {
    try {
      const updatedRecordings = recordings.filter(rec => rec.id !== id);
      setRecordings(updatedRecordings);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecordings));
    } catch (error) {
      console.error('Erro ao eliminar gravação:', error);
    }
  };

  const renderRecordingItem = ({ item }) => (
    <View style={styles.recordingItem}>
      <Text style={styles.recordingDate}>{new Date(item.date).toLocaleString()}</Text>
      <Text style={styles.recordingDuration}>Duração: {item.duration.toFixed(2)} segundos</Text>
      <View style={styles.recordingActions}>
        <Button title="Reproduzir" onPress={() => playRecording(item.uri)} />
        <Button title="Eliminar" onPress={() => deleteRecording(item.id)} color="red" />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gravador de Chamadas</Text>
      
      <View style={styles.controls}>
        <Button
          title={isRecording ? "Parar Gravação" : "Iniciar Gravação"}
          onPress={isRecording ? stopRecording : startRecording}
          color={isRecording ? "red" : "green"}
        />
      </View>

      <FlatList
        data={recordings}
        renderItem={renderRecordingItem}
        keyExtractor={item => item.id}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  controls: {
    marginBottom: 20,
  },
  list: {
    flex: 1,
  },
  recordingItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  recordingDate: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  recordingDuration: {
    fontSize: 14,
    color: '#666',
    marginVertical: 5,
  },
  recordingActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});