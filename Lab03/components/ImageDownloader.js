// components/ImageDownloader.js
import React, { useState } from 'react';
import { View, Text, Button, Image, StyleSheet, ActivityIndicator } from 'react-native';

const ImageDownloader = () => {
  const [imageUrl, setImageUrl] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Simulação de AsyncTask
  const downloadImage = async () => {
    setLoading(true);
    setStatus('Iniciando download...');
    setProgress(0);
    
    try {
      // Simulação do onPreExecute
      setStatus('Preparando download...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulação do doInBackground com progresso
      for (let i = 0; i <= 100; i += 20) {
        setProgress(i);
        setStatus(`Download em progresso: ${i}%`);
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      // Simulação do download completo
      const randomImageId = Math.floor(Math.random() * 1000);
      const downloadedUrl = `https://picsum.photos/300/200?random=${randomImageId}`;
      
      // Simulação do onPostExecute
      setImageUrl(downloadedUrl);
      setStatus('Download completo!');
      
    } catch (error) {
      setStatus('Erro no download: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Download de Imagem</Text>
      
      <Button 
        title="Baixar Imagem Aleatória" 
        onPress={downloadImage}
        disabled={loading}
      />
      
      <View style={styles.statusContainer}>
        <Text style={styles.status}>{status}</Text>
        {loading && (
          <View style={styles.progressContainer}>
            <ActivityIndicator size="small" color="#0000ff" />
            <Text style={styles.progressText}>{progress}%</Text>
          </View>
        )}
      </View>
      
      {imageUrl && (
        <Image 
          source={{ uri: imageUrl }} 
          style={styles.image}
          resizeMode="cover"
        />
      )}
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
  statusContainer: {
    marginVertical: 15,
    alignItems: 'center',
  },
  status: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressText: {
    marginLeft: 10,
    fontSize: 14,
  },
  image: {
    width: 300,
    height: 200,
    alignSelf: 'center',
    borderRadius: 8,
  },
});

export default ImageDownloader;