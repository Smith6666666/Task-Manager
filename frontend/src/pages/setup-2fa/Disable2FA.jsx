import api from '../../utils/axios';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { FormNav } from '../../components/FormNav';
import { OtpInput } from '../../components/OtpInput';
import 'animate.css';
import './Disable2FA.css';

export function Disable2FA() {
  const navigate = useNavigate();

  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [resetOtp, setResetOtp] = useState(0);

  async function verifyTwoFactor(otpCode) {
    try {
      setIsVerifying(true);
      const response = await api.patch('/api/v1/auth/disable/two-factor', { token: otpCode });

      const updatedUser = response.data.data.user;
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setError('');

      navigate('/setting', {
        state: {
          message: '🔴 Two-factor authentication is disabled successfully.'
        }
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Unable to verify your otp');
      setResetOtp((prev) => prev + 1);
    } finally {
      setIsVerifying(false);
    };
  };

  return (
    <div className="disable-2fa-page">
      <title>Disable Two-Factor Authentication</title>

      <FormNav />

      <div className="otp-box-wrapper animate__animated animate__zoomIn">
        <h3>Enter your authentication code</h3>
        <div className="otp-box">
          <OtpInput length={6} onComplete={verifyTwoFactor} disabled={isVerifying} autoFocus resetKey={resetOtp} />
          <p className="err-message">{error}</p>
        </div>
        <button className="back-btn" onClick={() => navigate(-1)} disabled={isVerifying}>Back</button>
      </div>
    </div>
  );
};