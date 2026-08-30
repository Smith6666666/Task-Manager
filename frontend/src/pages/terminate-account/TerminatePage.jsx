import api from '../../utils/axios';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { FormNav } from '../../components/FormNav';
import { OtpInput } from '../../components/OtpInput';
import UpdateLoading from '../../assets/update-loading.gif';
import 'animate.css';
import './TerminatePage.css';

export function TerminatePage() {
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [isConfirming, setIsConfirming] = useState(false);
  const [resetOtp, setResetOtp] = useState(0);

  const [showOtp, setShowOtp] = useState(false);

  const user = JSON.parse(localStorage.getItem('user'));
  const twoFactorEnabled = user?.twoFactorEnabled;

  async function confirmTerminate(e) {
    e.preventDefault();

    if (!password) {
      return setError('Password is required');
    };

    if (!twoFactorEnabled) {
      return terminateAccount();
    };

    try {
      setIsConfirming(true);
      setError('');

      const response = await api.post('/api/v1/auth/verify-account-password', { password });

      if (response.data.status === 'success') {
        setShowOtp(true);
      };
    } catch (error) {
      setError(error.response?.data?.message || 'Unable to confirm the password');
    } finally {
      setIsConfirming(false);
    };
  };

  async function terminateAccount(otpCode) {
    try {
      setIsConfirming(true);
      setError('');

      const response = await api.delete('/api/v1/auth/terminate-account', {
        data: {
          password,
          ...(otpCode && { token: otpCode })
        }
      });

      if (response.data.status === 'success') {
        window.alert('Account has been terminated successfully.');

        localStorage.removeItem('token');
        localStorage.removeItem('user');

        navigate('/', { replace: true });
      };
    } catch (error) {
      setError(error.response?.data?.message || 'Unable to terminate the account');

      if (showOtp) {
        setResetOtp((prev) => prev + 1);
      };
    } finally {
      setIsConfirming(false);
    };
  };

  function backBtn() {
    setShowOtp(false);
    setError('');
    setResetOtp((prev) => prev + 1);
    setPassword('');
  };

  return (
    <div className="terminate-page">
      <title>Terminate account</title>

      <FormNav />

      {showOtp ? (
        <div className="otp-box-wrapper animate__animated animate__zoomIn">
          <h3>Enter your authentication code</h3>
          <div className="otp-box">
            <OtpInput length={6} onComplete={terminateAccount} disabled={isConfirming} autoFocus resetKey={resetOtp} />
            <p className="err-message">{error}</p>
          </div>
          <button className="back-btn" onClick={backBtn} disabled={isConfirming}>Back</button>
        </div>
      ) : (
        <form onSubmit={confirmTerminate} className="form-container animate__animated animate__zoomIn">
          <div className="back-icon" onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-left-circle-fill"></i >
          </div>
          <i className="bi bi-exclamation-circle-fill"></i>
          <h3>Terminate Account</h3>
          <p className="warning-text">This action is permanent. Your account and its data will be deleted.</p>
          <div className="password-wrapper">
            <label>Account Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isConfirming} />
          </div>
          <p className="err-message">{error}</p>
          {isConfirming ? (
            <img src={UpdateLoading} className="update-loading" />
          ) : (
            <button type="submit" className="confirm-btn">Confirm</button>
          )}
        </form>
      )}
    </div>
  );
};