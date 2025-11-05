import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, DeviceEventEmitter } from 'react-native';
import ImageDownloader from './components/ImageDownloader';
import MessagePassingDemo from './components/MessagePassingDemo';
import ProducerConsumerDemo from './components/ProducerConsumerDemo';

export default function App() {
  const [activeTab, setActiveTab] = useState('counter');

  const renderTab = () => {
    switch (activeTab) {
      case 'counter':
        return <CounterTab />;
      case 'download':
        return <ImageDownloader />;
      case 'message':
        return <MessagePassingDemo />;
      case 'producerConsumer':
        return <ProducerConsumerDemo />;
      default:
        return <CounterTab />;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Threading Lab - React Native</Text>
      
      <View style={styles.tabButtons}>
        <Button title="Contador" onPress={() => setActiveTab('counter')} />
        <Button title="Download" onPress={() => setActiveTab('download')} />
        <Button title="Mensagens" onPress={() => setActiveTab('message')} />
        <Button title="Produtor-Consumidor" onPress={() => setActiveTab('producerConsumer')} />
      </View>

      <ScrollView style={styles.content}>
        {renderTab()}
      </ScrollView>
    </View>
  );
}

// Vamos mover o contador para um componente separado: CounterTab
const CounterTab = () => {
  const [count, setCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const workerRef = useRef(null);

  const addLog = (message) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    console.log('ThreadLab:', message);
  };

  const startCounter = () => {
    if (workerRef.current) {
      clearInterval(workerRef.current);
    }

    setCount(0);
    setIsRunning(true);
    addLog('Contador iniciado');

    let counter = 0;
    const worker = setInterval(() => {
      counter++;
      setCount(counter);
      addLog(`Tick: ${counter}`);
    }, 1000);

    workerRef.current = worker;
  };

  const stopCounter = () => {
    if (workerRef.current) {
      clearInterval(workerRef.current);
      workerRef.current = null;
      setIsRunning(false);
      addLog('Contador parado');
    }
  };

  useEffect(() => {
    return () => {
      if (workerRef.current) {
        clearInterval(workerRef.current);
      }
    };
  }, []);

  return (
    <View style={styles.tabContent}>
      <View style={styles.counterSection}>
        <Text style={styles.counter}>Contador: {count}</Text>
        <Text style={styles.status}>
          Status: {isRunning ? 'Executando' : 'Parado'}
        </Text>
        
        <View style={styles.buttonContainer}>
          <Button 
            title="Start" 
            onPress={startCounter}
            disabled={isRunning}
          />
          <Button 
            title="Stop" 
            onPress={stopCounter}
            disabled={!isRunning}
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
    flex: 1,
    paddingTop: 50,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  tabButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  counterSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  counter: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  status: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  logsSection: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
  },
  logsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  logEntry: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 5,
    color: '#333',
  },
});