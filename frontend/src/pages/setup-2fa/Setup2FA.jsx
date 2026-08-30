import api from '../../utils/axios';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { FormNav } from '../../components/FormNav';
import { OtpInput } from '../../components/OtpInput';
import UpdateLoading from '../../assets/update-loading.gif';
import 'animate.css';
import './Setup2FA.css';

export function Setup2FA() {
  const navigate = useNavigate();

  const [qrPhoto, setQrPhoto] = useState(null);
  const [isCalling, setIsCalling] = useState(false);

  const [isVerifying, setIsVerifying] = useState(false);
  const [resetOtp, setResetOtp] = useState(0);

  const [error, setError] = useState('');

  useEffect(() => {
    async function getQr() {
      try {
        setIsCalling(true);
        const response = await api.post('/api/v1/auth/enable/two-factor');
        setQrPhoto(response.data.data.qrCode);
      } catch (error) {
        return window.alert(error.response?.data?.message || 'Unable to load the QR');
      } finally {
        setIsCalling(false);
      };
    };

    getQr();
  }, []);

  async function verifyTwoFactor(otpCode) {
    try {
      setIsVerifying(true);
      const response = await api.post('/api/v1/auth/verify-two-factor', { token: otpCode });

      const updatedUser = response.data.data.user;
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setError('');

      navigate('/setting', {
        state: {
          message: '🎉 Two-factor authentication enabled successfully.'
        }
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Unable to verify the otp');
      setResetOtp((prev) => prev + 1);
    } finally {
      setIsVerifying(false);
    };
  };

  return (
    <div className="twofa-page">
      <title>Setting up two factors</title>

      <FormNav />

      <div className="qr-container animate__animated animate__zoomIn">
        <div className="back-icon" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left-circle-fill"></i >
        </div>

        <div className="icon-container">
          <i className="bi bi-shield-lock-fill"></i>
          <p>Enable Two-Factor Authentication</p>
        </div>

        <span></span>

        <div className="steps-container">
          <div className="stepper">
            <div className="step">
              <div className="circle">1</div>
            </div>
            <div className="step">
              <div className="circle">2</div>
            </div>
            <div className="step">
              <div className="circle">3</div>
            </div>
          </div>

          <div className="details-stepper">
            <div className="step-wrapper">
              <h3>Download app</h3>
              <p>Download the google authentication app.</p>
            </div>

            <div className="step-wrapper">
              <h3>Scan QR code</h3>
              <p>Scan this QR code using the authentication app. This will generate a verification code.</p>
              {isCalling ? (
                <img className="update-loading" src={UpdateLoading} />
              ) : qrPhoto ? (
                <img className="qr-photo" src={qrPhoto} />
              ) : null}
            </div>

            <div className="step-wrapper">
              <h3>Enter code</h3>
              <p>Enter the verification code provided by your authentication app.</p>
              <OtpInput length={6} onComplete={verifyTwoFactor} disabled={isVerifying} autoFocus resetKey={resetOtp} />
            </div>
            <p className="err-message">{error}</p>
          </div>
        </div>
      </div>
    </div>
  );
}