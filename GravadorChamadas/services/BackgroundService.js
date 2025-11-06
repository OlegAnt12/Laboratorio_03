import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import RecordingService from './RecordingManager';
import SecurityManager from './SecurityManager';

// Definir tarefas de background
const BACKGROUND_TASKS = {
  CALL_MONITORING: 'call-monitoring-task',
  CLEANUP: 'cleanup-task',
  BACKUP: 'backup-task'
};

// Configurar notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class BackgroundService {
  static isInitialized = false;

  // Inicializar serviços de background
  static async initialize() {
    if (this.isInitialized) return;

    try {
      // Registrar tarefas de background
      await this.registerBackgroundTasks();
      
      // Configurar notificações
      await this.setupNotifications();
      
      this.isInitialized = true;
      console.log('✅ Serviços de background inicializados');
    } catch (error) {
      console.error('❌ Erro ao inicializar serviços de background:', error);
    }
  }

  // Registrar tarefas de background
  static async registerBackgroundTasks() {
    // Tarefa de monitorização de chamadas
    TaskManager.defineTask(BACKGROUND_TASKS.CALL_MONITORING, async () => {
      try {
        await this.checkForCalls();
        return BackgroundFetch.Result.NewData;
      } catch (error) {
        return BackgroundFetch.Result.Failed;
      }
    });

    // Tarefa de limpeza
    TaskManager.defineTask(BACKGROUND_TASKS.CLEANUP, async () => {
      try {
        await this.cleanupOldRecordings();
        return BackgroundFetch.Result.NewData;
      } catch (error) {
        return BackgroundFetch.Result.Failed;
      }
    });

    // Registrar tarefas no sistema
    try {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_TASKS.CALL_MONITORING, {
        minimumInterval: 60, // 1 minuto
        stopOnTerminate: false,
        startOnBoot: true,
      });

      await BackgroundFetch.registerTaskAsync(BACKGROUND_TASKS.CLEANUP, {
        minimumInterval: 60 * 60 * 24, // 1 dia
        stopOnTerminate: false,
        startOnBoot: true,
      });

      console.log('✅ Tarefas de background registradas');
    } catch (error) {
      console.log('❌ Não foi possível registrar tarefas de background:', error);
    }
  }

  // Verificar chamadas (simulação)
  static async checkForCalls() {
    try {
      const settings = await RecordingService.getSettings();
      
      if (!settings.autoRecord) {
        return;
      }

      // Simular deteção de chamadas (10% de chance a cada verificação)
      const shouldSimulateCall = Math.random() < 0.1;
      
      if (shouldSimulateCall) {
        const callType = Math.random() > 0.5 ? 'incoming' : 'outgoing';
        const phoneNumber = `+244 9${Math.floor(Math.random() * 10000000)}`;
        
        // Validar segurança antes de gravar
        const canRecord = await SecurityManager.validateRecordingOperation();
        
        if (canRecord) {
          await RecordingService.startRecording({
            phoneNumber,
            type: callType
          });

          // Enviar notificação
          await this.sendNotification(
            'Chamada Detetada',
            `A gravar chamada de ${phoneNumber}`,
            { callType, phoneNumber }
          );

          // Parar gravação após tempo aleatório
          setTimeout(async () => {
            try {
              const recording = await RecordingService.stopRecording();
              
              await this.sendNotification(
                'Gravação Concluída',
                `Chamada de ${phoneNumber} gravada (${recording.duration}s)`,
                { recordingId: recording.id }
              );
            } catch (error) {
              console.error('Erro ao parar gravação em background:', error);
            }
          }, Math.random() * 30000 + 10000); // 10-40 segundos
        }
      }
    } catch (error) {
      console.error('Erro na verificação de chamadas:', error);
    }
  }

  // Limpar gravações antigas
  static async cleanupOldRecordings() {
    try {
      const recordings = await RecordingService.getRecordings();
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

      const oldRecordings = recordings.filter(recording => {
        const recordingDate = new Date(recording.startTime);
        return recordingDate < thirtyDaysAgo;
      });

      for (const recording of oldRecordings) {
        await RecordingService.deleteRecording(recording.id);
      }

      if (oldRecordings.length > 0) {
        await this.sendNotification(
          'Limpeza Automática',
          `${oldRecordings.length} gravações antigas foram eliminadas`
        );
      }

      console.log(`🧹 ${oldRecordings.length} gravações antigas eliminadas`);
    } catch (error) {
      console.error('Erro na limpeza de gravações:', error);
    }
  }

  // Configurar notificações
  static async setupNotifications() {
    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('call-recording', {
          name: 'Gravações de Chamadas',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#E53E3E',
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('❌ Permissão para notificações não concedida');
        return;
      }

      console.log('✅ Notificações configuradas');
    } catch (error) {
      console.error('Erro ao configurar notificações:', error);
    }
  }

  // Enviar notificação
  static async sendNotification(title, body, data = {}) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
          priority: 'high',
        },
        trigger: null, // Enviar imediatamente
      });
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
    }
  }

  // Parar todos os serviços de background
  static async stopAllServices() {
    try {
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_TASKS.CALL_MONITORING);
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_TASKS.CLEANUP);
      
      this.isInitialized = false;
      console.log('🛑 Serviços de background parados');
    } catch (error) {
      console.error('Erro ao parar serviços de background:', error);
    }
  }

  // Verificar status dos serviços
  static async getServiceStatus() {
    try {
      const callMonitoringStatus = await BackgroundFetch.getStatusAsync();
      const tasks = await TaskManager.getRegisteredTasksAsync();
      
      return {
        callMonitoring: callMonitoringStatus,
        registeredTasks: tasks,
        isInitialized: this.isInitialized
      };
    } catch (error) {
      console.error('Erro ao verificar status dos serviços:', error);
      return { error: error.message };
    }
  }
}

export default BackgroundService;