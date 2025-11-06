import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RecordingManager from '../services/RecordingManager';

const CallList = () => {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    loadRecordings();
  }, []);

  const loadRecordings = async () => {
    try {
      const calls = await RecordingManager.getRecordings();
      setRecordings(calls);
    } catch (error) {
      console.error('Erro ao carregar gravações:', error);
    } finally {
      setLoading(false);
    }
  };

  const simulateCall = async () => {
    if (isSimulating) return;
    
    setIsSimulating(true);
    
    try {
      const callType = Math.random() > 0.5 ? 'incoming' : 'outgoing';
      const phoneNumber = `+244 9${Math.floor(Math.random() * 10000000)}`;
      
      await RecordingManager.startRecording({
        phoneNumber,
        type: callType
      });
      
      loadRecordings();
      
      setTimeout(async () => {
        await RecordingManager.stopRecording();
        loadRecordings();
        setIsSimulating(false);
      }, Math.random() * 20000 + 5000);
      
    } catch (error) {
      console.error('Erro na simulação:', error);
      setIsSimulating(false);
    }
  };

  const deleteRecording = (recordingId) => {
    Alert.alert(
      'Eliminar Gravação',
      'Tem a certeza que deseja eliminar esta gravação?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedRecordings = recordings.filter(r => r.id !== recordingId);
              setRecordings(updatedRecordings);
              // Aqui também deve eliminar o ficheiro de áudio
            } catch (error) {
              console.error('Erro ao eliminar:', error);
            }
          }
        }
      ]
    );
  };

  const playRecording = (recording) => {
    Alert.alert('Reproduzir', `Reproduzindo gravação de ${recording.phoneNumber}`);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-PT');
  };

  const renderRecordingItem = ({ item }) => (
    <View style={styles.recordingItem}>
      <View style={styles.recordingHeader}>
        <Ionicons 
          name={item.type === 'incoming' ? 'call-received' : 'call-made'} 
          size={20} 
          color={item.type === 'incoming' ? 'green' : 'blue'} 
        />
        <Text style={styles.phoneNumber}>{item.phoneNumber}</Text>
        {item.isRecording && (
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>Gravando</Text>
          </View>
        )}
      </View>
      
      <View style={styles.recordingDetails}>
        <Text style={styles.date}>{formatDate(item.startTime)}</Text>
        {item.duration > 0 && (
          <Text style={styles.duration}>{formatDuration(item.duration)}</Text>
        )}
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => playRecording(item)} style={styles.actionButton}>
          <Ionicons name="play" size={20} color="green" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteRecording(item.id)} style={styles.actionButton}>
          <Ionicons name="trash" size={20} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="red" />
        <Text>Carregando gravações...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gravações de Chamadas</Text>
        <Text style={styles.subtitle}>{recordings.length} gravações encontradas</Text>
      </View>

      <TouchableOpacity 
        style={[styles.simulateButton, isSimulating && styles.simulateButtonDisabled]}
        onPress={simulateCall}
        disabled={isSimulating}
      >
        <Ionicons name="call" size={20} color="white" />
        <Text style={styles.simulateButtonText}>
          {isSimulating ? 'Simulando Chamada...' : 'Simular Chamada'}
        </Text>
      </TouchableOpacity>

      <FlatList
        data={recordings}
        renderItem={renderRecordingItem}
        keyExtractor={item => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  simulateButton: {
    flexDirection: 'row',
    backgroundColor: 'red',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  simulateButtonDisabled: {
    backgroundColor: '#ccc',
  },
  simulateButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  recordingItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recordingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  phoneNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    flex: 1,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'red',
    marginRight: 4,
  },
  recordingText: {
    fontSize: 12,
    color: 'red',
    fontWeight: 'bold',
  },
  recordingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
  duration: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    padding: 8,
    marginLeft: 12,
  },
});

export default CallList;