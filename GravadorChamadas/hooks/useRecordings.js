import { useState, useEffect } from 'react';
import RecordingManager from '../services/RecordingManager';

const useRecordings = () => {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const refreshRecordings = () => {
    loadRecordings();
  };

  return { recordings, loading, refreshRecordings };
};

export default useRecordings;