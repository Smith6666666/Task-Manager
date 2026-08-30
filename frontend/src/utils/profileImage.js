export const getProfileImage = (profile) => {
  if (profile?.startsWith('http')) {
    return profile;
  }

  return `${import.meta.env.VITE_API_URL}/uploads/users/${profile || 'user-default.png'}`;
};