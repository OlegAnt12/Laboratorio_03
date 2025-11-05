import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, DeviceEventEmitter } from 'react-native';

const MessagePassingDemo = () => {
  const [messages, setMessages] = useState([]);
  const [workerThreadActive, setWorkerThreadActive] = useState(false);
  const workerRef = useRef(null);

  useEffect(() => {
    // Listener para mensagens do worker thread
    const subscription = DeviceEventEmitter.addListener('messageFromWorker', (message) => {
      setMessages(prev => [...prev, `UI: ${message}`]);
    });

    return () => {
      subscription.remove();
      if (workerRef.current) {
        clearInterval(workerRef.current);
      }
    };
  }, []);

  const startWorker = () => {
    setWorkerThreadActive(true);
    setMessages(prev => [...prev, 'Worker thread iniciada']);

    let count = 0;
    workerRef.current = setInterval(() => {
      count++;
      DeviceEventEmitter.emit('messageFromWorker', `Mensagem #${count} do Worker`);
    }, 2000);
  };

  const stopWorker = () => {
    if (workerRef.current) {
      clearInterval(workerRef.current);
      workerRef.current = null;
      setWorkerThreadActive(false);
      setMessages(prev => [...prev, 'Worker thread parada']);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Passagem de Mensagens</Text>
      
      <View style={styles.buttonContainer}>
        <Button 
          title="Iniciar Worker" 
          onPress={startWorker}
          disabled={workerThreadActive}
        />
        <Button 
          title="Parar Worker" 
          onPress={stopWorker}
          disabled={!workerThreadActive}
        />
      </View>

      <View style={styles.messagesContainer}>
        <Text style={styles.messagesTitle}>Mensagens:</Text>
        {messages.map((msg, index) => (
          <Text key={index} style={styles.message}>{msg}</Text>
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  messagesContainer: {
    marginTop: 10,
  },
  messagesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    marginBottom: 5,
  },
});

export default MessagePassingDemo;