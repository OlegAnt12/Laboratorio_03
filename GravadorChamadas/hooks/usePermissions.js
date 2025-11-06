import { useState, useEffect, useCallback } from 'react';
import PermissionManager from '../services/PermissionManager';

const usePermissions = () => {
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [essentialGranted, setEssentialGranted] = useState(false);

  const checkPermissions = useCallback(async () => {
    try {
      setLoading(true);
      const results = await PermissionManager.checkAndRequestPermissions();
      setPermissions(results);
      
      const essential = await PermissionManager.hasEssentialPermissions();
      setEssentialGranted(essential);
      
      return { results, essential };
    } catch (error) {
      console.error('Erro ao verificar permissões:', error);
      return { results: {}, essential: false };
    } finally {
      setLoading(false);
    }
  }, []);

  const requestPermission = useCallback(async (permissionType) => {
    try {
      const result = await PermissionManager.requestPermission(permissionType);
      
      setPermissions(prev => ({
        ...prev,
        [permissionType]: result
      }));

      // Re-verificar permissões essenciais
      const essential = await PermissionManager.hasEssentialPermissions();
      setEssentialGranted(essential);

      return result;
    } catch (error) {
      console.error(`Erro ao solicitar permissão ${permissionType}:`, error);
      throw error;
    }
  }, []);

  // Monitorizar mudanças nas permissões (apenas Android)
  useEffect(() => {
    if (Platform.OS === 'android') {
      const interval = setInterval(() => {
        checkPermissions();
      }, 30000); // Verificar a cada 30 segundos

      return () => clearInterval(interval);
    }
  }, [checkPermissions]);

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  return {
    permissions,
    loading,
    essentialGranted,
    checkPermissions,
    requestPermission,
    hasEssentialPermissions: essentialGranted
  };
};

export default usePermissions;