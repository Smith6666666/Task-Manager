import api from '../../utils/axios';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { FormNav } from '../../components/FormNav';
import UpdateLoading from '../../assets/update-loading.gif';
import 'animate.css';
import './ForgotPassword.css';

export function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  function confirmEmail(e) {
    e.preventDefault();

    setIsConfirming(true);

    if (!email.trim()) {
      setError('Provide your email');
      setIsConfirming(false);
      return;
    };

    setError('');

    setTimeout(() => {
      setConfirmed(true);
      setIsConfirming(false);
    }, 1500);
  };

  async function continueWithEmail() {
    try {
      setIsProcessing(true);

      const response = await api.post('/api/v1/auth/forgot-password', { email: email.trim() });

      setError('');

      window.alert(response.data.message);

      navigate('/', { replace: true });
    } catch (error) {
      setError(error.response?.data?.message || 'Unable to confirm the email');
    } finally {
      setIsProcessing(false);
    };
  };

  function useAuthCode() {
    navigate('/forgot-password/two-factor', {
      state: { email: email.trim() }
    });
  };

  return (
    <div className="forgot-password-page">
      <title>Forgot password</title>

      <FormNav />

      <form className='form-container animate__animated animate__slideInRight' onSubmit={confirmEmail}>
        {confirmed ? (
          <div className="choose-method-container animate__animated animate__zoomIn animate__faster">
            <h3>Choose a recovery method</h3>

            {isProcessing ? (
              <button className="update-loading">
                <img src={UpdateLoading} />
              </button>
            ) : (
              <button onClick={continueWithEmail}>
                <i className="bi bi-envelope-at-fill"></i>
                Continue with Email
              </button>
            )}

            <button onClick={useAuthCode} disabled={isProcessing}>
              <i className="bi bi-google"></i>
              Use Authentication Code
            </button>

            <p className="err-message">{error}</p>
          </div >
        ) : (
          <>
            <div className="back-icon" onClick={() => navigate(-1)}>
              <i className="bi bi-arrow-left-circle-fill"></i >
            </div>
            <h3>Forgot Password</h3>
            <div className="email-wrapper">
              <label>Email</label>
              <input type="email" value={email} placeholder="Enter your email" autoComplete="email" onChange={(e) => setEmail(e.target.value)} />
            </div>
            <p className="err-message">{error}</p>
            {isConfirming ? (
              <img src={UpdateLoading} className="update-loading" />
            ) : (
              <button type="submit" disabled={isConfirming}>Confirm</button>
            )}
          </>
        )}
      </form >
    </div >
  );
};