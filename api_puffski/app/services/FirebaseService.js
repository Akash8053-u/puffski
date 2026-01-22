// api/controllers/SomeController.js

module.exports = {
  
  sendNotification: async function(req, res) {
    try {
      const FirebaseService = require('../services/FirebaseService');
      
      // Example 1: Send single notification
      FirebaseService.sendFireBaseNotification({
        token: 'device-token-here',
        id: 'notification-123',
        title: 'New Message',
        notification: 'You have a new message!'
      });
      
      // Example 2: Send to multiple devices (using promise version)
      await FirebaseService.sendFireBaseNotificationPromise({
        token: 'device-token-here',
        id: 'notification-456',
        notification: 'Broadcast message!'
      });
      
      // Example 3: Send to array of devices
      await FirebaseService.sendFireBaseNotificationArray({
        push_token_array: ['token1', 'token2', 'token3'],
        id: 'notification-789',
        notification: 'Group notification!'
      });
      
      return res.ok({ message: 'Notifications sent' });
      
    } catch (error) {
      return res.serverError(error);
    }
  }
  
};