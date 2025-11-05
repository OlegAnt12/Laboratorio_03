import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const ProducerConsumerDemo = () => {
  const [buffer, setBuffer] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isProducing, setIsProducing] = useState(false);
  const [isConsuming, setIsConsuming] = useState(false);
  const producerRef = useRef(null);
  const consumerRef = useRef(null);
  const bufferRef = useRef([]); // Usar ref para acessar o buffer atualizado nos intervals

  const BUFFER_SIZE = 5;

  const addLog = (message) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const startProducing = () => {
    setIsProducing(true);
    addLog('Produtor iniciado');

    producerRef.current = setInterval(() => {
      if (bufferRef.current.length < BUFFER_SIZE) {
        const item = `Item-${Date.now()}`;
        bufferRef.current = [...bufferRef.current, item];
        setBuffer(bufferRef.current);
        addLog(`Produzido: ${item}`);
      } else {
        addLog('Buffer cheio, produtor esperando...');
      }
    }, 1000);
  };

  const stopProducing = () => {
    if (producerRef.current) {
      clearInterval(producerRef.current);
      producerRef.current = null;
      setIsProducing(false);
      addLog('Produtor parado');
    }
  };

  const startConsuming = () => {
    setIsConsuming(true);
    addLog('Consumidor iniciado');

    consumerRef.current = setInterval(() => {
      if (bufferRef.current.length > 0) {
        const item = bufferRef.current[0];
        bufferRef.current = bufferRef.current.slice(1);
        setBuffer(bufferRef.current);
        addLog(`Consumido: ${item}`);
      } else {
        addLog('Buffer vazio, consumidor esperando...');
      }
    }, 1500);
  };

  const stopConsuming = () => {
    if (consumerRef.current) {
      clearInterval(consumerRef.current);
      consumerRef.current = null;
      setIsConsuming(false);
      addLog('Consumidor parado');
    }
  };

  useEffect(() => {
    return () => {
      if (producerRef.current) clearInterval(producerRef.current);
      if (consumerRef.current) clearInterval(consumerRef.current);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Produtor-Consumidor</Text>
      
      <View style={styles.bufferSection}>
        <Text style={styles.bufferTitle}>Buffer (capacidade: {BUFFER_SIZE})</Text>
        <Text style={styles.bufferContent}>
          {buffer.length > 0 ? buffer.join(', ') : 'Vazio'}
        </Text>
      </View>

      <View style={styles.controls}>
        <View style={styles.buttonGroup}>
          <Text>Produtor</Text>
          <Button 
            title="Iniciar" 
            onPress={startProducing}
            disabled={isProducing}
          />
          <Button 
            title="Parar" 
            onPress={stopProducing}
            disabled={!isProducing}
          />
        </View>

        <View style={styles.buttonGroup}>
          <Text>Consumidor</Text>
          <Button 
            title="Iniciar" 
            onPress={startConsuming}
            disabled={isConsuming}
          />
          <Button 
            title="Parar" 
            onPress={stopConsuming}
            disabled={!isConsuming}
          />
        </View>
      </View>

      <View style={styles.logsSection}>
        <Text style={styles.logsTitle}>Logs:</Text>
        {logs.map((log, index) => (
          <Text key={index} style={styles.logEntry}>{log}</Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    margin: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  bufferSection: {
    marginBottom: 20,
  },
  bufferTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  bufferContent: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  buttonGroup: {
    alignItems: 'center',
  },
  logsSection: {
    marginTop: 10,
  },
  logsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  logEntry: {
    fontSize: 12,
    marginBottom: 5,
  },
});

export default ProducerConsumerDemo;