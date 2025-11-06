import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PermissionManager from './PermissionManager';

class SecurityManager {
  static LEGAL_WARNING_SHOWN_KEY = '@legal_warning_shown';

  // Verificar se a gravação é permitida no país/região do utilizador
  static isRecordingAllowed() {
    // Países onde a gravação de chamadas é geralmente permitida com consentimento
    const allowedCountries = [
      'US', // Estados Unidos (um-part consent)
      'CA', // Canadá (um-part consent)
      'GB', // Reino Unido (um-part consent)
      'PT', // Portugal (requer consentimento)
      'BR', // Brasil (um-part consent)
      'AO'  // Angola (verificar legislação local)
    ];
    
    // Em produção, obter o país real do dispositivo
    const userCountry = this.getUserCountry();
    
    return allowedCountries.includes(userCountry);
  }

  // Obter país do utilizador (simulação)
  static getUserCountry() {
    // Em produção, usar react-native-device-info ou API de geolocalização
    return 'PT'; // Portugal como padrão
  }

  // Mostrar aviso legal obrigatório
  static async showLegalWarning() {
    const hasSeenWarning = await AsyncStorage.getItem(this.LEGAL_WARNING_SHOWN_KEY);
    
    if (!hasSeenWarning) {
      return new Promise((resolve) => {
        Alert.alert(
          '⚠️ Aviso Legal Importante',
          'A gravação de chamadas telefónicas está sujeita a leis de privacidade.\n\n' +
          '• É sua responsabilidade informar todas as partes sobre a gravação\n' +
          '• Deve cumprir com a legislação local de proteção de dados\n' +
          '• O uso indevido pode ter consequências legais\n\n' +
          'Ao continuar, confirma que compreende e aceita estas condições.',
          [
            {
              text: 'Não Aceito',
              style: 'cancel',
              onPress: () => resolve(false)
            },
            {
              text: 'Compreendo e Aceito',
              style: 'default',
              onPress: async () => {
                await AsyncStorage.setItem(this.LEGAL_WARNING_SHOWN_KEY, 'true');
                resolve(true);
              }
            }
          ]
        );
      });
    }
    
    return true;
  }

  // Validar operação de gravação
  static async validateRecordingOperation() {
    try {
      // 1. Verificar permissões técnicas
      const hasPermissions = await PermissionManager.hasEssentialPermissions();
      if (!hasPermissions) {
        throw new Error('Permissões essenciais não concedidas');
      }

      // 2. Verificar conformidade legal
      if (!this.isRecordingAllowed()) {
        Alert.alert(
          'Restrição Legal',
          'A gravação de chamadas não é permitida na sua região de acordo com as leis locais.'
        );
        return false;
      }

      // 3. Mostrar aviso legal (apenas uma vez)
      const legalAccepted = await this.showLegalWarning();
      if (!legalAccepted) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro na validação de segurança:', error);
      throw error;
    }
  }

  // Encriptar dados sensíveis (simulação)
  static async encryptData(data) {
    try {
      // Em produção, usar react-native-crypto ou expo-crypto
      // Esta é uma simulação básica
      const encrypted = btoa(JSON.stringify(data)); // Base64 encoding
      return encrypted;
    } catch (error) {
      console.error('Erro ao encriptar dados:', error);
      return data;
    }
  }

  // Desencriptar dados
  static async decryptData(encryptedData) {
    try {
      const decrypted = JSON.parse(atob(encryptedData));
      return decrypted;
    } catch (error) {
      console.error('Erro ao desencriptar dados:', error);
      return encryptedData;
    }
  }

  // Verificar integridade dos dados
  static verifyDataIntegrity(data, originalHash) {
    // Em produção, implementar verificação de hash
    return true;
  }

  // Limpar dados sensíveis
  static async clearSensitiveData() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const sensitiveKeys = keys.filter(key => 
        key.includes('recording') || 
        key.includes('call') || 
        key.includes('audio')
      );
      
      await AsyncStorage.multiRemove(sensitiveKeys);
      return true;
    } catch (error) {
      console.error('Erro ao limpar dados sensíveis:', error);
      return false;
    }
  }

  // Auditoria de segurança
  static async securityAudit() {
    const auditResults = {
      permissions: await PermissionManager.hasEssentialPermissions(),
      legalAccepted: await AsyncStorage.getItem(this.LEGAL_WARNING_SHOWN_KEY),
      storageEncrypted: false, // Em produção, verificar se os dados estão encriptados
      lastAudit: new Date().toISOString()
    };

    await AsyncStorage.setItem('@security_audit', JSON.stringify(auditResults));
    return auditResults;
  }
}

export default SecurityManager;