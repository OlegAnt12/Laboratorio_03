export const RECORDING_SETTINGS = {
  DEFAULT_AUDIO_FORMAT: 'mp3',
  DEFAULT_STORAGE_LOCATION: 'internal',
  DEFAULT_AUTO_RECORD: true,
  SUPPORTED_FORMATS: ['mp3', 'wav', 'm4a'],
  STORAGE_LOCATIONS: ['internal', 'external'],
  MAX_RECORDING_DURATION: 3600, // 1 hora em segundos
  QUALITY_PRESETS: {
    low: {
      bitrate: 64000,
      sampleRate: 22050,
      channels: 1
    },
    medium: {
      bitrate: 128000,
      sampleRate: 44100,
      channels: 1
    },
    high: {
      bitrate: 256000,
      sampleRate: 44100,
      channels: 2
    }
  }
};

export const RECORDING_STATUS = {
  RECORDING: 'recording',
  STOPPED: 'stopped',
  PAUSED: 'paused',
  ERROR: 'error'
};

export const CALL_TYPES = {
  INCOMING: 'incoming',
  OUTGOING: 'outgoing',
  MISSED: 'missed',
  REJECTED: 'rejected'
};

export const STORAGE_LIMITS = {
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  WARNING_THRESHOLD: 0.8, // 80% do espaço
  CLEANUP_AGE: 30 * 24 * 60 * 60 * 1000 // 30 dias em milissegundos
};