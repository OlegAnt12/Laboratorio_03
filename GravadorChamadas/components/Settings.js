import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Settings = () => {
  const [settings, setSettings] = useState({
    autoRecord: true,
    storageLocation: 'internal',
    audioFormat: 'mp3',
    encryption: false,
    retentionDays: 30
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('@settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      setSettings(newSettings);
      await AsyncStorage.setItem('@settings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Erro ao guardar configurações:', error);
    }
  };

  const handleToggle = (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    saveSettings(newSettings);
  };

  const handleClearData = () => {
    Alert.alert(
      'Limpar Dados',
      'Tem a certeza que deseja eliminar todas as gravações e configurações?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar Tudo',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert('Sucesso', 'Todos os dados foram eliminados.');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível limpar os dados.');
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Configurações</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Gravação</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="recording" size={24} color="#3182CE" />
            <View style={styles.settingText}>
              <Text style={styles.settingName}>Gravação Automática</Text>
              <Text style={styles.settingDescription}>
                Gravar chamadas automaticamente quando são detetadas
              </Text>
            </View>
          </View>
          <Switch
            value={settings.autoRecord}
            onValueChange={() => handleToggle('autoRecord')}
            trackColor={{ false: '#CBD5E0', true: '#3182CE' }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Armazenamento</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="save" size={24} color="#3182CE" />
            <View style={styles.settingText}>
              <Text style={styles.settingName}>Local de Armazenamento</Text>
              <Text style={styles.settingDescription}>
                {settings.storageLocation === 'internal' ? 'Armazenamento Interno' : 'Armazenamento Externo'}
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.optionButton}
            onPress={() => {
              const newLocation = settings.storageLocation === 'internal' ? 'external' : 'internal';
              saveSettings({ ...settings, storageLocation: newLocation });
            }}
          >
            <Text style={styles.optionButtonText}>
              {settings.storageLocation === 'internal' ? 'Interno' : 'Externo'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="lock-closed" size={24} color="#3182CE" />
            <View style={styles.settingText}>
              <Text style={styles.settingName}>Criptografia</Text>
              <Text style={styles.settingDescription}>
                Proteger gravações com criptografia
              </Text>
            </View>
          </View>
          <Switch
            value={settings.encryption}
            onValueChange={() => handleToggle('encryption')}
            trackColor={{ false: '#CBD5E0', true: '#3182CE' }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ações</Text>
        
        <TouchableOpacity style={styles.dangerButton} onPress={handleClearData}>
          <Ionicons name="trash" size={20} color="white" />
          <Text style={styles.dangerButtonText}>Limpar Todos os Dados</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.version}>Versão 1.0.0</Text>
        <Text style={styles.copyright}>© 2024 ISPTEC - Aplicações Móveis</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
    padding: 20
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 30,
    textAlign: 'center'
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 16
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7'
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  settingText: {
    marginLeft: 12,
    flex: 1
  },
  settingName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4
  },
  settingDescription: {
    fontSize: 14,
    color: '#718096',
    lineHeight: 20
  },
  optionButton: {
    backgroundColor: '#EDF2F7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6
  },
  optionButtonText: {
    color: '#2D3748',
    fontWeight: '500'
  },
  dangerButton: {
    backgroundColor: '#E53E3E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8
  },
  dangerButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
    padding: 20
  },
  version: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 4
  },
  copyright: {
    fontSize: 12,
    color: '#A0AEC0'
  }
});

export default Settings;