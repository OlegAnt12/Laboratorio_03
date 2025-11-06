import { useState, useEffect, useCallback } from 'react';
import RecordingService from '../services/RecordingManager';

const useRecordings = () => {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadRecordings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const calls = await RecordingService.getRecordings();
      setRecordings(calls);
    } catch (err) {
      setError(err.message);
      console.error('Erro ao carregar gravações:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshRecordings = useCallback(async () => {
    await loadRecordings();
  }, [loadRecordings]);

  const deleteRecording = useCallback(async (recordingId) => {
    try {
      const success = await RecordingService.deleteRecording(recordingId);
      if (success) {
        await loadRecordings();
      }
      return success;
    } catch (err) {
      setError(err.message);
      console.error('Erro ao eliminar gravação:', err);
      return false;
    }
  }, [loadRecordings]);

  // Atualizar automaticamente quando uma gravação está em progresso
  useEffect(() => {
    if (recordings.some(rec => rec.isRecording)) {
      const interval = setInterval(() => {
        loadRecordings();
      }, 2000); // Atualizar a cada 2 segundos durante gravação

      return () => clearInterval(interval);
    }
  }, [recordings, loadRecordings]);

  useEffect(() => {
    loadRecordings();
  }, [loadRecordings]);

  return {
    recordings,
    loading,
    error,
    refreshRecordings,
    deleteRecording,
    setRecordings
  };
};

export default useRecordings;