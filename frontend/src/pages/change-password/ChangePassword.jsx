import api from '../../utils/axios';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { FormNav } from '../../components/FormNav';
import UpdateLoading from '../../assets/update-loading.gif';
import 'animate.css';
import './ChangePassword.css';

export function ChangePassword() {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isConfirming, setIsConfirming] = useState(false);

  const [formError, setFormError] = useState('');

  function clickShowPassword() {
    setShowPassword((prev) => !prev);
  };

  async function confirmChangePassword(e) {
    e.preventDefault();

    try {
      setIsConfirming(true);

      const response = await api.patch('/api/v1/auth/change-password', {
        currentPassword,
        newPassword,
        confirmPassword
      });

      if (response.data.status === 'success') {
        setFormError('');
        setIsConfirming(false);
        window.alert('Password changed successfully. Please log in again.');
      };

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/');
    } catch (error) {
      setFormError(error.response?.data?.message || 'Something went wrong');
    } finally {
      setIsConfirming(false);
    };
  };

  return (
    <div className="change-password-page">
      <title>Get the password changed</title>

      <FormNav />

      <div className="form-container animate__animated animate__zoomIn">
        <form onSubmit={confirmChangePassword}>
          <div className="back-icon" onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-left-circle-fill"></i >
          </div>
          <h2>Change Password</h2>
          <div className="row-wrap">
            <label>Current Password</label>
            <input type={showPassword ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          </div>
          <div className="row-wrap">
            <label>New Password</label>
            <input type={showPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
          <div className="row-wrap">
            <label>Confirm Password</label>
            <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
          <div className={showPassword ? 'show-password active' : 'show-password'} onClick={clickShowPassword}>
            <i className="bi bi-eye-fill"></i> &nbsp;Show Password
          </div>
          <p className="err-message">{formError}</p>
          {isConfirming ? (
            <img src={UpdateLoading} className="update-loading" />
          ) : (
            <button type="submit">Confirm</button>
          )}
        </form>
      </div>
    </div>
  );
};