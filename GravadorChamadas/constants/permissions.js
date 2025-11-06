export const PERMISSIONS = {
  AUDIO: 'AUDIO_RECORDING',
  PHONE: 'PHONE',
  STORAGE: 'MEDIA_LIBRARY',
  NOTIFICATIONS: 'NOTIFICATIONS',
  BACKGROUND: 'BACKGROUND'
};

export const PERMISSION_DESCRIPTIONS = {
  [PERMISSIONS.AUDIO]: {
    title: 'Microfone',
    description: 'Permite gravar o áudio das chamadas telefónicas',
    icon: 'mic',
    essential: true
  },
  [PERMISSIONS.PHONE]: {
    title: 'Estado do Telefone',
    description: 'Permite detetar quando uma chamada está a decorrer',
    icon: 'call',
    essential: false
  },
  [PERMISSIONS.STORAGE]: {
    title: 'Armazenamento',
    description: 'Permite guardar as gravações no seu dispositivo',
    icon: 'folder',
    essential: true
  },
  [PERMISSIONS.NOTIFICATIONS]: {
    title: 'Notificações',
    description: 'Permite mostrar notificações sobre gravações',
    icon: 'notifications',
    essential: false
  },
  [PERMISSIONS.BACKGROUND]: {
    title: 'Execução em Background',
    description: 'Permite detetar chamadas mesmo quando a app não está em uso',
    icon: 'sync',
    essential: false
  }
};

export const PERMISSION_STATUS = {
  GRANTED: 'granted',
  DENIED: 'denied',
  UNDETERMINED: 'undetermined',
  UNSUPPORTED: 'unsupported',
  ERROR: 'error'
};