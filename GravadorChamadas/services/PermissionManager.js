import { Platform, Alert, Linking } from 'react-native';
import * as Permissions from 'expo-permissions';
import * as IntentLauncher from 'expo-intent-launcher';

class PermissionManager {
  // Tipos de permissões necessárias
  static PERMISSION_TYPES = {
    AUDIO: 'AUDIO_RECORDING',
    PHONE: 'PHONE',
    STORAGE: 'MEDIA_LIBRARY',
    NOTIFICATIONS: 'NOTIFICATIONS',
    BACKGROUND: 'BACKGROUND'
  };

  // Mapeamento de permissões por plataforma
  static getPlatformPermissions() {
    if (Platform.OS === 'ios') {
      return {
        [this.PERMISSION_TYPES.AUDIO]: Permissions.AUDIO_RECORDING,
        [this.PERMISSION_TYPES.STORAGE]: Permissions.MEDIA_LIBRARY,
        [this.PERMISSION_TYPES.NOTIFICATIONS]: Permissions.NOTIFICATIONS,
      };
    } else {
      return {
        [this.PERMISSION_TYPES.AUDIO]: Permissions.AUDIO_RECORDING,
        [this.PERMISSION_TYPES.PHONE]: Permissions.PHONE,
        [this.PERMISSION_TYPES.STORAGE]: Permissions.MEDIA_LIBRARY,
        [this.PERMISSION_TYPES.NOTIFICATIONS]: Permissions.NOTIFICATIONS,
      };
    }
  }

  // Solicitar permissão individual
  static async requestPermission(permissionType) {
    try {
      const platformPermissions = this.getPlatformPermissions();
      const permission = platformPermissions[permissionType];
      
      if (!permission) {
        console.warn(`Permissão ${permissionType} não suportada nesta plataforma`);
        return { status: 'unsupported' };
      }

      const { status, canAskAgain } = await Permissions.askAsync(permission);
      
      return {
        status,
        canAskAgain,
        permissionType,
        platform: Platform.OS
      };
    } catch (error) {
      console.error(`Erro ao solicitar permissão ${permissionType}:`, error);
      return { status: 'error', error: error.message };
    }
  }

  // Verificar estado atual das permissões
  static async checkPermissionStatus(permissionType) {
    try {
      const platformPermissions = this.getPlatformPermissions();
      const permission = platformPermissions[permissionType];
      
      if (!permission) {
        return { status: 'unsupported' };
      }

      const { status, expires, permissions } = await Permissions.getAsync(permission);
      
      return {
        status,
        expires,
        permissionType,
        platform: Platform.OS
      };
    } catch (error) {
      console.error(`Erro ao verificar permissão ${permissionType}:`, error);
      return { status: 'error' };
    }
  }

  // Solicitar todas as permissões necessárias
  static async requestAllPermissions() {
    const permissions = {};
    const permissionTypes = Object.values(this.PERMISSION_TYPES);

    for (const type of permissionTypes) {
      const result = await this.requestPermission(type);
      permissions[type] = result;
    }

    return permissions;
  }

  // Verificar se todas as permissões essenciais foram concedidas
  static async hasEssentialPermissions() {
    const essentialPermissions = [
      this.PERMISSION_TYPES.AUDIO,
      this.PERMISSION_TYPES.STORAGE
    ];

    for (const permissionType of essentialPermissions) {
      const status = await this.checkPermissionStatus(permissionType);
      if (status.status !== 'granted') {
        return false;
      }
    }

    return true;
  }

  // Mostrar diálogo explicativo para permissão negada
  static showPermissionExplanation(permissionType) {
    const messages = {
      [this.PERMISSION_TYPES.AUDIO]: {
        title: 'Permissão de Microfone Necessária',
        message: 'Para gravar chamadas telefónicas, a aplicação precisa de acesso ao microfone. As gravações são guardadas localmente no seu dispositivo.',
        settingsKey: 'microphone'
      },
      [this.PERMISSION_TYPES.PHONE]: {
        title: 'Permissão de Telefone Necessária',
        message: 'Para detetar chamadas automaticamente, a aplicação precisa de acesso ao estado do telefone.',
        settingsKey: 'phone'
      },
      [this.PERMISSION_TYPES.STORAGE]: {
        title: 'Permissão de Armazenamento Necessária',
        message: 'Para guardar as gravações de chamadas, a aplicação precisa de acesso ao armazenamento do dispositivo.',
        settingsKey: 'storage'
      }
    };

    const config = messages[permissionType];
    if (!config) return;

    Alert.alert(
      config.title,
      config.message,
      [
        {
          text: 'Abrir Configurações',
          onPress: () => this.openAppSettings()
        },
        {
          text: 'Mais Tarde',
          style: 'cancel'
        }
      ]
    );
  }

  // Abrir definições da aplicação
  static async openAppSettings() {
    if (Platform.OS === 'ios') {
      await Linking.openURL('app-settings:');
    } else {
      await IntentLauncher.startActivityAsync(
        IntentLauncher.ActivityAction.APPLICATION_DETAILS_SETTINGS,
        { data: 'package:com.isptec.callrecorder' }
      );
    }
  }

  // Verificar e solicitar permissões em lote
  static async checkAndRequestPermissions() {
    const results = {};
    const permissionTypes = Object.values(this.PERMISSION_TYPES);

    // Primeiro verificar o estado atual
    for (const type of permissionTypes) {
      results[type] = await this.checkPermissionStatus(type);
    }

    // Solicitar apenas as que não estão concedidas
    const permissionsToRequest = permissionTypes.filter(
      type => results[type].status !== 'granted' && results[type].status !== 'unsupported'
    );

    for (const type of permissionsToRequest) {
      results[type] = await this.requestPermission(type);
      
      // Se foi negada, mostrar explicação
      if (results[type].status === 'denied') {
        this.showPermissionExplanation(type);
      }
    }

    return results;
  }

  // Monitorizar mudanças nas permissões (apenas Android)
  static startPermissionMonitoring(callback) {
    if (Platform.OS !== 'android') return;

    // Em produção, implementar com EventEmitter ou contexto
    this.permissionCallback = callback;
  }
}

export default PermissionManager;