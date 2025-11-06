import PermissionManager from './PermissionManager';

class SecurityManager {
  static async validateRecordingPermissions() {
    const essentialPermissions = [
      PermissionManager.PERMISSION_TYPES.AUDIO,
      PermissionManager.PERMISSION_TYPES.STORAGE
    ];

    for (const permissionType of essentialPermissions) {
      const status = await PermissionManager.checkPermissionStatus(permissionType);
      if (status.status !== 'granted') {
        throw new Error(`Permissão ${permissionType} necessária para gravação`);
      }
    }

    return true;
  }

  static async secureRecordingOperation(operation) {
    try {
      await this.validateRecordingPermissions();
      return await operation();
    } catch (error) {
      console.error('Operação de gravação bloqueada por segurança:', error);
      throw error;
    }
  }
}

export default SecurityManager;