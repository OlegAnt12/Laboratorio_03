export const simulateIncomingCall = () => {
  return {
    phoneNumber: `+244 9${Math.floor(Math.random() * 10000000)}`,
    type: 'incoming',
    timestamp: new Date().toISOString()
  };
};

export const simulateOutgoingCall = () => {
  return {
    phoneNumber: `+244 9${Math.floor(Math.random() * 10000000)}`,
    type: 'outgoing',
    timestamp: new Date().toISOString()
  };
};