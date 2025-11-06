// Formatar duração da chamada
export const formatCallDuration = (seconds) => {
  if (!seconds || seconds < 0) return '00:00';
  
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Formatar data de forma inteligente
export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return `Hoje às ${date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}`;
  } else if (diffDays === 1) {
    return `Ontem às ${date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}`;
  } else if (diffDays < 7) {
    return date.toLocaleDateString('pt-PT', { 
      weekday: 'long', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } else {
    return date.toLocaleDateString('pt-PT', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

// Formatar tamanho do ficheiro
export const formatFileSize = (bytes) => {
  if (!bytes || bytes < 0) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

// Calcular diferença de tempo
export const getTimeDifference = (startTime, endTime) => {
  const start = new Date(startTime);
  const end = endTime ? new Date(endTime) : new Date();
  return Math.floor((end - start) / 1000);
};

// Gerar timestamp único
export const generateTimestamp = () => {
  return new Date().toISOString().replace(/[:.]/g, '-');
};