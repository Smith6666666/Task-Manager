import api from '../../utils/axios';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { FormNav } from '../../components/FormNav';
import { Loading } from '../../components/Loading';
import UpdateLoading from '../../assets/update-loading.gif';
import './ResetPassword.css';

export function ResetPassword() {
  const { token } = useParams();

  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function validateToken() {
      try {
        await api.get(`/api/v1/auth/validate/reset-password/${token}`);
      } catch (error) {
        window.alert(error.response?.data?.message || 'Password reset token is invalid or expired');
        navigate('/', { replace: true });
      };
    };

    validateToken();
  }, [token, navigate]);

  function clickShowPassword() {
    setShowPassword((prev) => !prev);
  };

  async function confirmResetPassword(e) {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      return setError('All fields are required');
    }

    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      setIsConfirming(true);

      const response = await api.patch(`/api/v1/auth/reset-password/${token}`, { newPassword, confirmPassword });

      setError('');

      window.alert(response.data.message);
      navigate('/', { replace: true });
    } catch (error) {
      setError(error.response?.data?.message || 'Unable to confirm the password');
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="reset-password-page">
      <title>Reset password</title>

      <FormNav />

      <form className="form-container" onSubmit={confirmResetPassword}>
        <h3>Reset Password</h3>

        <div className="password-input-wrapper">
          <label>New password</label>
          <input type={showPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        </div>

        <div className="password-input-wrapper">
          <label>Confirm password</label>
          <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </div>

        <div className={showPassword ? 'show-password active' : 'show-password'} onClick={clickShowPassword}>
          <i className="bi bi-eye-fill"></i> &nbsp;Show Password
        </div>

        <p className="err-message">{error}</p>

        {isConfirming ? (
          <img className="update-loading" src={UpdateLoading} />
        ) : (
          <button type="submit" disabled={isConfirming}>Confirm</button>
        )}
      </form>
    </div>
  );
};