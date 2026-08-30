import { useState } from 'react';
import { Routes, Route } from 'react-router';
import { ProtectRoute, ProtectTwoFactorEnableRoute, ProtectTwoFactorDisableRoute, ProtectTwoFactorLoginRoute } from './components/ProtectRoute';
import { LoginPage } from './pages/login/LoginPage';
import { VerifyLogin } from './pages/login/VerifyLogin';
import { SignupPage } from './pages/signup/SignupPage';
import { SignedupPage } from './pages/signup/SignedupPage';
import { HomePage } from './pages/home/HomePage';
import { CreateTaskPage } from './pages/create-task/CreateTaskPage';
import { SettingPage } from './pages/setting/SettingPage';
import { ChangePassword } from './pages/change-password/ChangePassword';
import { Setup2FA } from './pages/setup-2fa/Setup2FA';
import { Disable2FA } from './pages/setup-2fa/Disable2FA';
import { ForgotPassword } from './pages/forgot-password/ForgotPassword';
import { ForgotPassword2FA } from './pages/forgot-password/ForgotPassword2FA';
import { ResetPassword } from './pages/forgot-password/ResetPassword';
import { TerminatePage } from './pages/terminate-account/TerminatePage';
import { PageNotFound } from './pages/page-not-found/PageNotFound';
import './App.css';

function App() {
  const [formError, setFormError] = useState('');

  const [searchInput, setSearchInput] = useState('');

  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');

  const [isLoadingTasks, setIsLoadingTasks] = useState(true);

  const [notiPermission, setNotiPermission] = useState(
    'Notification' in window ? Notification.permission : 'unsupported'
  );

  const [notiEnable, setNotiEnable] = useState(() => {
    return localStorage.getItem('notiEnabled') === 'true';
  });

  function isTaskTitleValid(taskTitle) {
    if (!taskTitle.trim()) {
      setError('Enter a title');
      return false;
    }

    setError('');
    return true;
  };

  return (
    <Routes>
      <Route index element={<LoginPage formError={formError} setFormError={setFormError} />} />

      <Route element={<ProtectTwoFactorLoginRoute />}>
        <Route path="/verify-login" element={<VerifyLogin />} />
      </Route>

      <Route path="/signup" element={<SignupPage formError={formError} setFormError={setFormError} />} />

      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route path="/forgot-password/two-factor" element={<ForgotPassword2FA />} />

      <Route path="/reset-password/:token" element={<ResetPassword />} />

      <Route element={<ProtectRoute />}>
        <Route path="/signedup" element={<SignedupPage />} />

        <Route path="/dashboard" element={<HomePage tasks={tasks} setTasks={setTasks} setError={setError} isLoadingTasks={isLoadingTasks} setIsLoadingTasks={setIsLoadingTasks} isTaskTitleValid={isTaskTitleValid} notiPermission={notiPermission} setNotiPermission={setNotiPermission} notiEnable={notiEnable} setNotiEnable={setNotiEnable} searchInput={searchInput} setSearchInput={setSearchInput} />} />

        <Route path="/create-task" element={<CreateTaskPage setTasks={setTasks} error={error} setError={setError} isTaskTitleValid={isTaskTitleValid} />} />

        <Route path="/setting" element={<SettingPage />} />

        <Route path="/change-password" element={<ChangePassword />} />

        <Route element={<ProtectTwoFactorEnableRoute />}>
          <Route path="/enable/two-factor" element={<Setup2FA />} />
        </Route>

        <Route element={<ProtectTwoFactorDisableRoute />}>
          <Route path="/disable/two-factor" element={<Disable2FA />} />
        </Route>

        <Route path="/terminate-account" element={<TerminatePage />} />
      </Route>

      <Route path="*" element={<PageNotFound tasks={tasks} searchInput={searchInput} setSearchInput={setSearchInput} setError={setError} notiPermission={notiPermission} setNotiPermission={setNotiPermission} notiEnable={notiEnable} setNotiEnable={setNotiEnable} setIsLoadingTasks={setIsLoadingTasks} />} />
    </Routes>
  );
}

export default App;
