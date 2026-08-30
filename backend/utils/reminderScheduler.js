const Task = require('../models/taskModel');
const Subscription = require('../models/subscriptionModel');
const webpush = require('web-push');

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC,
  process.env.VAPID_PRIVATE
);

async function checkReminders() {
  try {
    const now = new Date();

    const dueTasks = await Task.find({
      reminderAt: { $lte: now },
      reminderSent: false,
      completed: false
    });

    for (const task of dueTasks) {
      const subscriptions = await Subscription.find({
        user: task.user
      });

      let sentSuccessfully = false;

      const payload = JSON.stringify({
        title: 'Task Manager',
        body: task.title
      });

      for (const subscription of subscriptions) {
        try {
          await webpush.sendNotification(
            subscription,
            payload
          );

          sentSuccessfully = true;
        } catch (error) {
          if (error.statusCode === 404 || error.statusCode === 410) {
            await Subscription.findOneAndDelete({ endpoint: subscription.endpoint });
          } else {
            console.error('Push notification failed:', error.message);
          }
        };
      };

      if (sentSuccessfully) {
        task.reminderSent = true;
        await task.save();
      };
    };
  } catch (error) {
    console.error(
      'Reminder check failed:',
      error.message
    );
  };
};

module.exports = checkReminders;