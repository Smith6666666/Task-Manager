import axios from 'axios';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { FormNav } from '../../components/FormNav';
import { OtpInput } from '../../components/OtpInput';
import './ForgotPassword2FA.css';

export function ForgotPassword2FA() {
  const navigate = useNavigate();

  const location = useLocation();

  const [isVerifying, setIsVerifying] = useState(false);
  const [resetOtp, setResetOtp] = useState(0);
  const [error, setError] = useState('');

  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      return navigate('/forgot-password', { replace: true });
    };
  }, [email, navigate]);

  async function verifyTwoFactor(otpCode) {
    try {
      setIsVerifying(true);
      setError('');

      const response = await axios.post('/api/v1/auth/forgot-password/two-factor', {
        email,
        token: otpCode
      });

      const resetToken = response.data.data.token;

      setError('');

      navigate(`/reset-password/${resetToken}`, { replace: true });
    } catch (error) {
      setError(error.response?.data?.message || 'Unable to verify the OTP');
      setResetOtp((prev) => prev + 1);
    } finally {
      setIsVerifying(false);
    };
  };

  return (
    <div className="forgot-password-2fa-page">
      <title>Verify your OTP</title>

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