function validateEnv() {
  const requiredEnv = [
    'DB_URL',
    'JWT_KEY',
    'FRONTEND_URL',
    'VAPID_PUBLIC',
    'VAPID_PRIVATE',
    'VAPID_SUBJECT',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'EMAIL_HOST',
    'EMAIL_PORT',
    'EMAIL_USERNAME',
    'EMAIL_PASSWORD',
    'NODE_ENV'
  ];

  const missing = requiredEnv.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  };
};

module.exports = validateEnv;