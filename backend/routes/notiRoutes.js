const express = require('express');
const router = express.Router();

const notiController = require('../controllers/notiController');
const authController = require('../controllers/authController');

router.get('/vapid-public-key', notiController.getVapidPublicKey);

router.use(authController.protect);

router.post('/subscribe', notiController.saveSubscription);
router.post('/status', notiController.getNotificationStatus);
router.delete('/unsubscribe', notiController.deleteSubscription);

module.exports = router;