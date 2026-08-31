import api from '../../utils/axios';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { FormNav } from '../../components/FormNav';
import { OtpInput } from '../../components/OtpInput';
import 'animate.css';
import '../setup-2fa/Disable2FA.css';

export function VerifyLogin() {
  const navigate = useNavigate();
  const location = useLocation();

  const [resetOtp, setResetOtp] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  const twoFactorToken = location.state?.twoFactorToken;

  async function verifyTwoFactor(otpCode) {
    try {
      setIsVerifying(true);

      const response = await api.post('/api/v1/auth/verify-login', {
        token: otpCode,
        twoFactorToken
      });

      const updatedUser = response.data.data.user;
      localStorage.setItem('user', JSON.stringify(updatedUser));

      const token = response.data.data.token;
      localStorage.setItem('token', token);

      setError('');
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Unable to verify the OTP');
      setResetOtp((prev) => prev + 1);
    } finally {
      setIsVerifying(false);
    };
  };

  return (
    <div className="disable-2fa-page">
      <title>Verify your login</title>

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