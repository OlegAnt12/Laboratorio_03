import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import RecordingService from '../services/RecordingManager';
import SecurityManager from '../services/SecurityManager';
import BackgroundService from '../services/BackgroundService';
import { formatFileSize } from '../utils/dateUtils';
import { RECORDING_SETTINGS } from '../constants/recording';

const Settings = () => {
  const [settings, setSettings] = useState({
    autoRecord: true,
    storageLocation: 'internal',
    audioFormat: 'mp3',
    quality: 'medium'
  });
  const [storageInfo, setStorageInfo] = useState({ free: 0, total: 0, used: 0 });
  const [loading, setLoading] = useState(true);
  const [serviceStatus, setServiceStatus] = useState(null);

  useEffect(() => {
    loadSettings();
    loadStorageInfo();
    checkServiceStatus();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await RecordingService.getSettings();
      setSettings(savedSettings);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStorageInfo = async () => {
    try {
      const info = await RecordingService.getStorageInfo();
      setStorageInfo(info);
    } catch (error) {
      console.error('Erro ao carregar informações de armazenamento:', error);
    }
  };

  const checkServiceStatus = async () => {
    try {
      const status = await BackgroundService.getServiceStatus();
      setServiceStatus(status);
    } catch (error) {
      console.error('Erro ao verificar status do serviço:', error);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      setSettings(newSettings);
      await RecordingService.saveSettings(newSettings);
    } catch (error) {
      console.error('Erro ao guardar configurações:', error);
      Alert.alert('Erro', 'Não foi possível guardar as configurações.');
    }
  };

  const handleAutoRecordToggle = (value) => {
    saveSettings({ ...settings, autoRecord: value });
  };

  const handleStorageLocationChange = (location) => {
    saveSettings({ ...settings, storageLocation: location });
  };

  const handleAudioFormatChange = (format) => {
    saveSettings({ ...settings, audioFormat: format });
  };

  const handleQualityChange = (quality) => {
    saveSettings({ ...settings, quality });
  };

  const clearAllRecordings = () => {
    Alert.alert(
      'Limpar Todas as Gravações',
      'Tem a certeza que deseja eliminar todas as gravações? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar Tudo',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('@call_recordings');
              Alert.alert('Sucesso', 'Todas as gravações foram eliminadas.');
              loadStorageInfo();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível eliminar as gravações.');
            }
          }
        }
      ]
    );
  };

  const resetSettings = () => {
    Alert.alert(
      'Repor Configurações',
      'Tem a certeza que deseja repor todas as configurações para os valores padrão?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Repor',
          style: 'destructive',
          onPress: async () => {
            const defaultSettings = {
              autoRecord: true,
              storageLocation: 'internal',
              audioFormat: 'mp3',
              quality: 'medium'
            };
            await saveSettings(defaultSettings);
            Alert.alert('Sucesso', 'Configurações repostas com sucesso.');
          }
        }
      ]
    );
  };

  const runSecurityAudit = async () => {
    try {
      const auditResults = await SecurityManager.securityAudit();
      Alert.alert(
        'Auditoria de Segurança',
        `Permissões: ${auditResults.permissions ? '✅' : '❌'}\n` +
        `Aviso Legal: ${auditResults.legalAccepted ? '✅' : '❌'}\n` +
        `Última Auditoria: ${new Date(auditResults.lastAudit).toLocaleString('pt-PT')}`
      );
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível executar a auditoria de segurança.');
    }
  };

  const storageUsage = storageInfo.total > 0 ? (storageInfo.used / storageInfo.total) * 100 : 0;

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#E53E3E" />
        <Text style={styles.loadingText}>A carregar configurações...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Configurações</Text>

      {/* Configurações de Gravação */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configurações de Gravação</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="recording" size={24} color="#E53E3E" />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Gravação Automática</Text>
              <Text style={styles.settingDescription}>
                Gravar chamadas automaticamente quando detectadas
              </Text>
            </View>
          </View>
          <Switch
            value={settings.autoRecord}
            onValueChange={handleAutoRecordToggle}
            trackColor={{ false: '#CBD5E0', true: '#FED7D7' }}
            thumbColor={settings.autoRecord ? '#E53E3E' : '#A0AEC0'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="folder" size={24} color="#3182CE" />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Local de Armazenamento</Text>
              <Text style={styles.settingDescription}>
                Onde guardar os ficheiros de áudio
              </Text>
            </View>
          </View>
          <View style={styles.radioGroup}>
            {RECORDING_SETTINGS.STORAGE_LOCATIONS.map((location) => (
              <TouchableOpacity
                key={location}
                style={[
                  styles.radioButton,
                  settings.storageLocation === location && styles.radioButtonSelected
                ]}
                onPress={() => handleStorageLocationChange(location)}
              >
                <Text style={[
                  styles.radioText,
                  settings.storageLocation === location && styles.radioTextSelected
                ]}>
                  {location === 'internal' ? 'Interno' : 'Externo'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="musical-notes" size={24} color="#38A169" />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Formato de Áudio</Text>
              <Text style={styles.settingDescription}>
                Formato dos ficheiros de gravação
              </Text>
            </View>
          </View>
          <View style={styles.radioGroup}>
            {RECORDING_SETTINGS.SUPPORTED_FORMATS.map((format) => (
              <TouchableOpacity
                key={format}
                style={[
                  styles.radioButton,
                  settings.audioFormat === format && styles.radioButtonSelected
                ]}
                onPress={() => handleAudioFormatChange(format)}
              >
                <Text style={[
                  styles.radioText,
                  settings.audioFormat === format && styles.radioTextSelected
                ]}>
                  {format.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="speedometer" size={24} color="#D69E2E" />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Qualidade de Áudio</Text>
              <Text style={styles.settingDescription}>
                Qualidade das gravações (afecta o tamanho do ficheiro)
              </Text>
            </View>
          </View>
          <View style={styles.radioGroup}>
            {Object.keys(RECORDING_SETTINGS.QUALITY_PRESETS).map((quality) => (
              <TouchableOpacity
                key={quality}
                style={[
                  styles.radioButton,
                  settings.quality === quality && styles.radioButtonSelected
                ]}
                onPress={() => handleQualityChange(quality)}
              >
                <Text style={[
                  styles.radioText,
                  settings.quality === quality && styles.radioTextSelected
                ]}>
                  {quality === 'low' ? 'Baixa' : quality === 'medium' ? 'Média' : 'Alta'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Informações de Armazenamento */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Armazenamento</Text>
        
        <View style={styles.storageInfo}>
          <View style={styles.storageHeader}>
            <Text style={styles.storageTitle}>Espaço em Disco</Text>
            <Text style={styles.storagePercentage}>{storageUsage.toFixed(1)}%</Text>
          </View>
          
          <View style={styles.storageBar}>
            <View 
              style={[
                styles.storageProgress, 
                { width: `${Math.min(storageUsage, 100)}%` }
              ]} 
            />
          </View>
          
          <View style={styles.storageDetails}>
            <Text style={styles.storageDetail}>
              Usado: {formatFileSize(storageInfo.used)}
            </Text>
            <Text style={styles.storageDetail}>
              Livre: {formatFileSize(storageInfo.free)}
            </Text>
            <Text style={styles.storageDetail}>
              Total: {formatFileSize(storageInfo.total)}
            </Text>
          </View>
        </View>
      </View>

      {/* Segurança e Privacidade */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Segurança e Privacidade</Text>
        
        <TouchableOpacity 
          style={styles.securityButton}
          onPress={runSecurityAudit}
        >
          <Ionicons name="shield-checkmark" size={20} color="#3182CE" />
          <Text style={styles.securityButtonText}>Executar Auditoria de Segurança</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.securityButton}
          onPress={() => SecurityManager.showLegalWarning()}
        >
          <Ionicons name="document-text" size={20} color="#718096" />
          <Text style={styles.securityButtonText}>Rever Aviso Legal</Text>
        </TouchableOpacity>
      </View>

      {/* Status do Serviço */}
      {serviceStatus && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status do Serviço</Text>
          
          <View style={styles.serviceStatus}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Serviço de Background</Text>
              <View style={styles.statusValue}>
                <View 
                  style={[
                    styles.statusIndicator,
                    serviceStatus.isInitialized ? styles.statusOn : styles.statusOff
                  ]} 
                />
                <Text style={styles.statusText}>
                  {serviceStatus.isInitialized ? 'Ativo' : 'Inativo'}
                </Text>
              </View>
            </View>
            
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Monitorização</Text>
              <Text style={styles.statusText}>
                {serviceStatus.callMonitoring === BackgroundFetch.Status.AVAILABLE ? 'Disponível' : 'Indisponível'}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Acções */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acções</Text>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.dangerButton]}
          onPress={clearAllRecordings}
        >
          <Ionicons name="trash" size={20} color="white" />
          <Text style={styles.actionButtonText}>Limpar Todas as Gravações</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={resetSettings}
        >
          <Ionicons name="refresh" size={20} color="#718096" />
          <Text style={[styles.actionButtonText, styles.secondaryActionText]}>
            Repor Configurações
          </Text>
        </TouchableOpacity>
      </View>

      {/* Informações da App */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações</Text>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Versão</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Desenvolvido por</Text>
          <Text style={styles.infoValue}>ISPTEC - Aplicações Móveis</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Laboratório</Text>
          <Text style={styles.infoValue}>#03 - Multithreading e Armazenamento</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#718096',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 24,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#718096',
    lineHeight: 20,
  },
  radioGroup: {
    flexDirection: 'row',
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    padding: 4,
  },
  radioButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginHorizontal: 2,
  },
  radioButtonSelected: {
    backgroundColor: '#E53E3E',
  },
  radioText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#718096',
  },
  radioTextSelected: {
    color: 'white',
  },
  storageInfo: {
    marginTop: 8,
  },
  storageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  storageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
  },
  storagePercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E53E3E',
  },
  storageBar: {
    height: 8,
    backgroundColor: '#EDF2F7',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  storageProgress: {
    height: '100%',
    backgroundColor: '#E53E3E',
    borderRadius: 4,
  },
  storageDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  storageDetail: {
    fontSize: 12,
    color: '#718096',
  },
  securityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#F7FAFC',
  },
  securityButtonText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
  },
  serviceStatus: {
    marginTop: 8,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
  },
  statusLabel: {
    fontSize: 14,
    color: '#718096',
  },
  statusValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusOn: {
    backgroundColor: '#38A169',
  },
  statusOff: {
    backgroundColor: '#E53E3E',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#F7FAFC',
  },
  dangerButton: {
    backgroundColor: '#FED7D7',
  },
  actionButtonText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
  },
  secondaryActionText: {
    color: '#718096',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
  },
  infoLabel: {
    fontSize: 14,
    color: '#718096',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    textAlign: 'right',
    flex: 1,
    marginLeft: 8,
  },
});

export default Settings;