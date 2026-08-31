const webpush = require('web-push');
const Subscription = require('../models/subscriptionModel');

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC,
  process.env.VAPID_PRIVATE
);

exports.getVapidPublicKey = (req, res) => {
  try {
    return res.status(200).json({
      status: 'success',
      data: {
        publicKey: process.env.VAPID_PUBLIC
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong'
    });
  }
};

exports.getNotificationStatus = async (req, res) => {
  try {
    const { endpoint } = req.body;

    const subscription = await Subscription.findOne({
      endpoint,
      user: req.user._id
    });

    return res.status(200).json({
      status: 'success',
      data: {
        enabled: !!subscription
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.saveSubscription = async (req, res) => {
  try {
    const { endpoint, expirationTime, keys } = req.body;

    const subscription = await Subscription.findOneAndUpdate(
      {
        user: req.user._id,
        endpoint
      },
      {
        endpoint,
        expirationTime,
        keys,
        user: req.user._id
      },
      {
        upsert: true,
        runValidators: true,
        returnDocument: 'after'
      }
    );

    return res.status(201).json({
      status: 'success',
      message: 'Push subscription saved',
      data: {
        subscription
      }
    });
  } catch (error) {
    console.error('Save subscription error:', error);

    return res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.sendTestNotification = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ user: req.user._id });

    const payload = JSON.stringify({
      title: 'Task Manager',
      body: 'Your push notification is working 🎉'
    });

    for (const subscription of subscriptions) {
      await webpush.sendNotification(
        subscription,
        payload
      );
    }

    res.status(200).json({
      status: 'success',
      message: 'Test notification sent.'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.deleteSubscription = async (req, res) => {
  try {
    const { endpoint } = req.body;

    await Subscription.findOneAndDelete({ endpoint, user: req.user._id });

    return res.status(200).json({
      status: 'success',
      message: 'Push subscription removed.'
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};