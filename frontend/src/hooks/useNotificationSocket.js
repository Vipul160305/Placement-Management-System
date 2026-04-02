import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

/**
 * useNotificationSocket
 * 
 * Future Backend Integration:
 * When the Node.js backend is ready, replace this mock implementation with socket.io-client.
 * 
 * Example integration:
 * import { io } from 'socket.io-client';
 * 
 * useEffect(() => {
 *   if (!user) return;
 *   const socket = io('http://localhost:5000', { query: { userId: user.id } });
 *   socket.on('notification', (data) => addToast(data.message, data.type));
 *   return () => socket.disconnect();
 * }, [user]);
 */
export const useNotificationSocket = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    // We only simulate WebSocket events if a user is logged in
    if (!user) return;

    let interval;

    // Simulate backend sending push notifications to specific roles
    if (user.role === 'student') {
      interval = setInterval(() => {
        const events = [
          { msg: 'Your application to Microsoft was moved to Shortlisted!', type: 'success' },
          { msg: 'Google just posted a new Drive for SWE Intern.', type: 'info' },
          { msg: 'Action Required: Update your resume before the Atlan deadline.', type: 'warning' }
        ];
        const randomEvent = events[Math.floor(Math.random() * events.length)];
        addToast(`🔔 Real-time: ${randomEvent.msg}`, randomEvent.type);
      }, 45000); // Fire a mock WS event every 45 seconds
    } else if (user.role === 'tpo') {
      interval = setInterval(() => {
        addToast('🔔 Real-time: 5 new students applied to the Infosys drive.', 'info');
      }, 60000); // 60 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [user, addToast]);
};
