import api from '../utils/axios';
import { useEffect } from 'react';
import { NavLink } from 'react-router';
import { urlBase64ToUint8Array } from '../utils/notification';
import './FeaturesBar.css';

export function FeaturesBar({ tasks, initializeCreateTask, searchInput, setSearchInput, setError, notiPermission, setNotiPermission, notiEnable, setNotiEnable, setIsLoadingTasks }) {
  useEffect(() => {
    const checkNotificationStatus = async () => {
      try {
        if (!('serviceWorker' in navigator)) {
          setNotiEnable(false);
          return;
        };

        const registration = await navigator.serviceWorker.ready;

        const subscription = await registration.pushManager.getSubscription();

        setNotiPermission(Notification.permission);

        if (!subscription || Notification.permission !== 'granted') {
          setNotiEnable(false);
          localStorage.setItem('notificationsEnabled', 'false');
          return;
        };

        const response = await api.post('/api/v1/noti/status', {
          endpoint: subscription.endpoint
        });

        const enabled = response.data.data.enabled;

        setNotiEnable(enabled);
        localStorage.setItem('notificationsEnabled', enabled ? 'true' : 'false');
      } catch (error) {
        setError(error.response?.data?.message || 'Something went wrong');
        setNotiEnable(false);
        localStorage.setItem('notificationsEnabled', 'false');
      };
    };

    checkNotificationStatus();
  }, [setNotiEnable, setNotiPermission, setError]);

  async function enableNoti() {
    if (!('Notification' in window)) {
      return window.alert('Notifications are not supported by this browser.');
    };

    try {
      const permission = await Notification.requestPermission();
      setNotiPermission(permission);

      if (permission !== 'granted') {
        return window.alert('Notification permission was not granted.');
      };

      setIsLoadingTasks(true);

      const response = await api.get('/api/v1/noti/vapid-public-key');
      const publicKey = response.data.data.publicKey;

      const registration = await navigator.serviceWorker.ready;

      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey)
        });
      };

      await api.post('/api/v1/noti/subscribe', subscription.toJSON());

      setError('');
      setNotiEnable(true);
      localStorage.setItem('notificationsEnabled', 'true');
    } catch (error) {
      setError(error.response?.data?.message || 'Unable to enable notifications.');
    } finally {
      setIsLoadingTasks(false);
    };
  };

  async function disableNoti() {
    const confirmed = window.confirm(
      'Are you sure you want to disable notifications?'
    );

    if (!confirmed) return;

    try {
      const registration = await navigator.serviceWorker.ready;

      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await api.delete('/api/v1/noti/unsubscribe', {
          data: {
            endpoint: subscription.endpoint
          }
        });

        await subscription.unsubscribe();
      };

      setNotiEnable(false);

      localStorage.setItem('notificationsEnabled', 'false');

      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'Unable to disable notifications.');
    };
  };

  return (
    <div className="features-bar">
      <p className="feature-btn total-tasks">Total tasks | <span>{tasks.length}</span></p>
      {
        notiPermission === 'granted' && notiEnable ? (
          <button className="feature-btn enable-noti active" onClick={disableNoti}>Disable notifications</button>
        ) : (
          <button className="feature-btn enable-noti" onClick={enableNoti}>Enable notifications</button>
        )
      }
      <NavLink to="/create-task" className="feature-btn create-btn" onClick={initializeCreateTask}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>

        Create task
      </NavLink>
      <div>
        <input className="search-title" type="text" placeholder="Search with a title" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
      </div>
    </div>
  );
};