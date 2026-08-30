export function formatDateTime(date) {
  if (!date) return 'None';

  return new Date(date).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

export function formatDateTimeLocal(date) {
  if (!date) return '';

  const d = new Date(date);

  const offset = d.getTimezoneOffset();
  const localDate = new Date(d.getTime() - offset * 60 * 1000);

  return localDate.toISOString().slice(0, 16);
}