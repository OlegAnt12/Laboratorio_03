import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PermissionManager from '../services/PermissionManager';

const PermissionGate = ({ children, onPermissionsUpdate }) => {
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [essentialGranted, setEssentialGranted] = useState(false);

  const loadPermissions = useCallback(async () => {
    setLoading(true);
    try {
      const results = await PermissionManager.checkAndRequestPermissions();
      setPermissions(results);
      
      const essential = await PermissionManager.hasEssentialPermissions();
      setEssentialGranted(essential);
      
      if (onPermissionsUpdate) {
        onPermissionsUpdate(results, essential);
      }
    } catch (error) {
      console.error('Erro ao carregar permissões:', error);
    } finally {
      setLoading(false);
    }
  }, [onPermissionsUpdate]);

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  const getPermissionStatusIcon = (status) => {
    switch (status) {
      case 'granted':
        return { name: 'checkmark-circle', color: '#38A169' };
      case 'denied':
        return { name: 'close-circle', color: '#E53E3E' };
      case 'undetermined':
        return { name: 'help-circle', color: '#D69E2E' };
      case 'unsupported':
        return { name: 'ban', color: '#718096' };
      default:
        return { name: 'alert-circle', color: '#D69E2E' };
    }
  };

  const getPermissionDescription = (permissionType) => {
    const descriptions = {
      [PermissionManager.PERMISSION_TYPES.AUDIO]: {
        title: 'Microfone',
        description: 'Permite gravar o áudio das chamadas telefónicas'
      },
      [PermissionManager.PERMISSION_TYPES.PHONE]: {
        title: 'Estado do Telefone',
        description: 'Permite detetar quando uma chamada está a decorrer'
      },
      [PermissionManager.PERMISSION_TYPES.STORAGE]: {
        title: 'Armazenamento',
        description: 'Permite guardar as gravações no seu dispositivo'
      },
      [PermissionManager.PERMISSION_TYPES.NOTIFICATIONS]: {
        title: 'Notificações',
        description: 'Permite mostrar notificações sobre gravações'
      }
    };

    return descriptions[permissionType] || { title: permissionType, description: '' };
  };

  const handlePermissionRequest = async (permissionType) => {
    const result = await PermissionManager.requestPermission(permissionType);
    
    const updatedPermissions = { ...permissions, [permissionType]: result };
    setPermissions(updatedPermissions);
    
    const essential = await PermissionManager.hasEssentialPermissions();
    setEssentialGranted(essential);
    
    if (onPermissionsUpdate) {
      onPermissionsUpdate(updatedPermissions, essential);
    }

    if (result.status === 'denied') {
      PermissionManager.showPermissionExplanation(permissionType);
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'granted': 'Concedida',
      'denied': 'Negada',
      'undetermined': 'Por Decidir',
      'unsupported': 'Não Suportada',
      'error': 'Erro'
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="lock-closed" size={64} color="#718096" />
        <Text style={styles.loadingText}>A verificar permissões...</Text>
      </View>
    );
  }

  if (!essentialGranted) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="lock-closed" size={48} color="#E53E3E" />
          <Text style={styles.title}>Permissões Necessárias</Text>
          <Text style={styles.subtitle}>
            Para utilizar o gravador de chamadas, é necessário conceder as seguintes permissões:
          </Text>
        </View>

        <View style={styles.permissionsList}>
          {Object.entries(permissions).map(([permissionType, permission]) => {
            const { title, description } = getPermissionDescription(permissionType);
            const { name: iconName, color: iconColor } = getPermissionStatusIcon(permission.status);
            
            return (
              <View key={permissionType} style={styles.permissionItem}>
                <View style={styles.permissionInfo}>
                  <Ionicons name={iconName} size={24} color={iconColor} />
                  <View style={styles.permissionText}>
                    <Text style={styles.permissionTitle}>{title}</Text>
                    <Text style={styles.permissionDescription}>{description}</Text>
                    <Text style={styles.permissionStatus}>
                      Estado: {getStatusText(permission.status)}
                    </Text>
                  </View>
                </View>
                
                {permission.status !== 'granted' && permission.status !== 'unsupported' && (
                  <TouchableOpacity
                    style={[
                      styles.permissionButton,
                      permission.status === 'denied' && styles.deniedButton
                    ]}
                    onPress={() => handlePermissionRequest(permissionType)}
                  >
                    <Text style={styles.permissionButtonText}>
                      {permission.status === 'denied' ? 'Tentar Novamente' : 'Conceder'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.footer}>
          <Text style={styles.securityNote}>
            🔒 A sua privacidade é importante. As gravações são guardadas localmente 
            no seu dispositivo e não são partilhadas com terceiros.
          </Text>
          
          <TouchableOpacity 
            style={[
              styles.continueButton,
              !essentialGranted && styles.continueButtonDisabled
            ]}
            onPress={loadPermissions}
            disabled={!essentialGranted}
          >
            <Text style={styles.continueButtonText}>
              {essentialGranted ? 'Continuar para a App' : 'Aguardando Permissões'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return children;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
    padding: 20
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7FAFC'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#718096'
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    paddingTop: 40
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D3748',
    marginTop: 16,
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 24
  },
  permissionsList: {
    marginBottom: 30
  },
  permissionItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  permissionInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1
  },
  permissionText: {
    marginLeft: 12,
    flex: 1
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4
  },
  permissionDescription: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 4,
    lineHeight: 20
  },
  permissionStatus: {
    fontSize: 12,
    color: '#A0AEC0',
    fontStyle: 'italic'
  },
  permissionButton: {
    backgroundColor: '#3182CE',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6
  },
  deniedButton: {
    backgroundColor: '#E53E3E'
  },
  permissionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14
  },
  footer: {
    marginTop: 20
  },
  securityNote: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    fontStyle: 'italic'
  },
  continueButton: {
    backgroundColor: '#38A169',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  continueButtonDisabled: {
    backgroundColor: '#CBD5E0'
  },
  continueButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  }
});

export default PermissionGate;