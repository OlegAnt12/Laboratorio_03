import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RECORDINGS_KEY = '@call_recordings';

export class RecordingManager {
  static isRecording = false;
  static currentRecording = null;

  static async startRecording(callInfo) {
    if (this.isRecording) return;

    try {
      this.isRecording = true;
      
      const timestamp = new Date().toISOString();
      const fileName = `call_${timestamp.replace(/[:.]/g, '-')}.mp3`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      this.currentRecording = {
        id: timestamp,
        fileUri,
        phoneNumber: callInfo.phoneNumber,
        type: callInfo.type,
        startTime: timestamp,
        duration: 0,
        isRecording: true
      };

      console.log(`🎙️ Iniciando gravação: ${callInfo.phoneNumber}`);
      
      await this.saveRecordingMetadata(this.currentRecording);
      
      return this.currentRecording;
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      this.isRecording = false;
    }
  }

  static async stopRecording() {
    if (!this.isRecording || !this.currentRecording) return;

    try {
      this.isRecording = false;
      
      const endTime = new Date().toISOString();
      const startTime = new Date(this.currentRecording.startTime);
      const duration = Math.floor((new Date(endTime) - startTime) / 1000);

      this.currentRecording.endTime = endTime;
      this.currentRecording.duration = duration;
      this.currentRecording.isRecording = false;

      await this.updateRecordingMetadata(this.currentRecording);
      
      console.log(`⏹️ Gravação parada. Duração: ${duration}s`);
      
      const finishedRecording = { ...this.currentRecording };
      this.currentRecording = null;
      
      return finishedRecording;
    } catch (error) {
      console.error('Erro ao parar gravação:', error);
    }
  }

  static async saveRecordingMetadata(recording) {
    try {
      const existingRecordings = await this.getRecordings();
      const updatedRecordings = [recording, ...existingRecordings];
      
      await AsyncStorage.setItem(RECORDINGS_KEY, JSON.stringify(updatedRecordings));
    } catch (error) {
      console.error('Erro ao salvar metadados:', error);
    }
  }

  static async updateRecordingMetadata(updatedRecording) {
    try {
      const recordings = await this.getRecordings();
      const index = recordings.findIndex(r => r.id === updatedRecording.id);
      
      if (index !== -1) {
        recordings[index] = updatedRecording;
        await AsyncStorage.setItem(RECORDINGS_KEY, JSON.stringify(recordings));
      }
    } catch (error) {
      console.error('Erro ao atualizar metadados:', error);
    }
  }

  static async getRecordings() {
    try {
      const recordingsJson = await AsyncStorage.getItem(RECORDINGS_KEY);
      return recordingsJson ? JSON.parse(recordingsJson) : [];
    } catch (error) {
      console.error('Erro ao obter gravações:', error);
      return [];
    }
  }

  static async deleteRecording(recordingId) {
    try {
      const recordings = await this.getRecordings();
      const recordingToDelete = recordings.find(r => r.id === recordingId);
      
      if (recordingToDelete) {
        // Eliminar o ficheiro de áudio
        await FileSystem.deleteAsync(recordingToDelete.fileUri);
        
        // Eliminar dos metadados
        const updatedRecordings = recordings.filter(r => r.id !== recordingId);
        await AsyncStorage.setItem(RECORDINGS_KEY, JSON.stringify(updatedRecordings));
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao eliminar gravação:', error);
      return false;
    }
  }
}

export default RecordingManager;