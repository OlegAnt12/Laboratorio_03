import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RECORDINGS_KEY = '@call_recordings';
const SETTINGS_KEY = '@recording_settings';

export class RecordingService {
  static isRecording = false;
  static currentRecording = null;

  // Iniciar gravação de chamada
  static async startRecording(callInfo) {
    if (this.isRecording) {
      throw new Error('Já existe uma gravação em progresso.');
    }

    try {
      this.isRecording = true;
      
      const timestamp = new Date().toISOString();
      const fileName = `call_${timestamp.replace(/[:.]/g, '-')}.mp3`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      this.currentRecording = {
        id: timestamp,
        fileUri,
        phoneNumber: callInfo.phoneNumber,
        type: callInfo.type, // 'incoming' | 'outgoing'
        startTime: timestamp,
        duration: 0,
        isRecording: true,
        fileSize: 0
      };

      // Simular gravação de áudio (em produção, usar expo-av)
      console.log(`🎙️ Iniciando gravação: ${callInfo.phoneNumber}`);
      
      // Salvar metadados imediatamente
      await this.saveRecordingMetadata(this.currentRecording);
      
      return this.currentRecording;
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      this.isRecording = false;
      throw error;
    }
  }

  // Parar gravação
  static async stopRecording() {
    if (!this.isRecording || !this.currentRecording) {
      throw new Error('Nenhuma gravação em progresso.');
    }

    try {
      this.isRecording = false;
      
      const endTime = new Date().toISOString();
      const startTime = new Date(this.currentRecording.startTime);
      const duration = Math.floor((new Date(endTime) - startTime) / 1000);

      // Simular tamanho do ficheiro (em produção, obter do ficheiro real)
      const fileSize = duration * 16000; // Aproximação

      this.currentRecording.endTime = endTime;
      this.currentRecording.duration = duration;
      this.currentRecording.fileSize = fileSize;
      this.currentRecording.isRecording = false;

      // Atualizar metadados com duração
      await this.updateRecordingMetadata(this.currentRecording);
      
      console.log(`⏹️ Gravação parada. Duração: ${duration}s`);
      
      const finishedRecording = { ...this.currentRecording };
      this.currentRecording = null;
      
      return finishedRecording;
    } catch (error) {
      console.error('Erro ao parar gravação:', error);
      throw error;
    }
  }

  // Gestão de metadados
  static async saveRecordingMetadata(recording) {
    try {
      const existingRecordings = await this.getRecordings();
      const updatedRecordings = [recording, ...existingRecordings];
      
      await AsyncStorage.setItem(RECORDINGS_KEY, JSON.stringify(updatedRecordings));
    } catch (error) {
      console.error('Erro ao salvar metadados:', error);
      throw error;
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
      throw error;
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
        // Tentar eliminar o ficheiro de áudio
        try {
          await FileSystem.deleteAsync(recordingToDelete.fileUri);
        } catch (fileError) {
          console.warn('Não foi possível eliminar o ficheiro de áudio:', fileError);
        }
        
        // Eliminar dos metadados
        const updatedRecordings = recordings.filter(r => r.id !== recordingId);
        await AsyncStorage.setItem(RECORDINGS_KEY, JSON.stringify(updatedRecordings));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao eliminar gravação:', error);
      throw error;
    }
  }

  static async getSettings() {
    try {
      const settingsJson = await AsyncStorage.getItem(SETTINGS_KEY);
      return settingsJson ? JSON.parse(settingsJson) : {
        autoRecord: true,
        storageLocation: 'internal',
        audioFormat: 'mp3'
      };
    } catch (error) {
      console.error('Erro ao obter configurações:', error);
      return {};
    }
  }

  static async saveSettings(settings) {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      throw error;
    }
  }

  // Verificar espaço em disco
  static async getStorageInfo() {
    try {
      const storageInfo = await FileSystem.getFreeDiskStorageAsync();
      return {
        free: storageInfo,
        total: storageInfo * 2, // Aproximação, pois não há API para total no Expo
        used: storageInfo // Aproximação
      };
    } catch (error) {
      console.error('Erro ao obter informações de armazenamento:', error);
      return { free: 0, total: 0, used: 0 };
    }
  }
}

export default RecordingService;