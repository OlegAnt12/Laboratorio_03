// Gerar número de telefone angolano aleatório
export const generateAngolanPhoneNumber = () => {
  const prefixes = ['91', '92', '93', '94', '95'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = Math.floor(1000000 + Math.random() * 9000000);
  return `+244 ${prefix} ${number.toString().substring(0, 3)} ${number.toString().substring(3, 6)}`;
};

// Simular chamada de entrada
export const simulateIncomingCall = () => {
  return {
    phoneNumber: generateAngolanPhoneNumber(),
    type: 'incoming',
    timestamp: new Date().toISOString()
  };
};

// Simular chamada de saída
export const simulateOutgoingCall = () => {
  return {
    phoneNumber: generateAngolanPhoneNumber(),
    type: 'outgoing',
    timestamp: new Date().toISOString()
  };
};

// Simular lista de contactos frequentes
export const getFrequentContacts = () => {
  return [
    { name: 'Maria Silva', number: '+244 921 123 456' },
    { name: 'João Santos', number: '+244 922 234 567' },
    { name: 'Ana Pereira', number: '+244 923 345 678' },
    { name: 'Carlos Fernandes', number: '+244 924 456 789' },
    { name: 'Sofia Rodrigues', number: '+244 925 567 890' }
  ];
};

// Simular deteção de chamada em background
export const simulateBackgroundCallDetection = () => {
  const shouldDetectCall = Math.random() < 0.3; // 30% de chance
  if (!shouldDetectCall) return null;

  const callType = Math.random() > 0.5 ? 'incoming' : 'outgoing';
  
  return {
    phoneNumber: generateAngolanPhoneNumber(),
    type: callType,
    timestamp: new Date().toISOString(),
    duration: Math.floor(Math.random() * 300) + 30 // 30-330 segundos
  };
};