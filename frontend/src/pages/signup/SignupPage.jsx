import api from '../../utils/axios';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { FormNav } from '../../components/FormNav';
import UpdateLoading from '../../assets/update-loading.gif';
import 'animate.css';
import './SignupPage.css';

export function SignupPage({ formError, setFormError }) {
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const navigate = useNavigate();

  async function signup(e) {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      return setFormError('Confirm the password again');
    }

    try {
      setIsCreating(true);

      const response = await api.post('/api/v1/auth/signup', {
        name: newName,
        email: newEmail,
        password: newPassword
      });

      const user = response.data.data.user;
      const token = response.data.data.token;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      setFormError('');
      navigate('/signedup');
    } catch (error) {
      setFormError(error.response?.data?.message || 'Something went wrong');
    } finally {
      setIsCreating(false);
    };
  };

  function clickShowPassword() {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="signup-page">
      <title>Signing up account</title>

      <FormNav />

      <div className="registration-form animate__animated animate__slideInRight">
        <form onSubmit={signup}>
          <div className="back-icon" onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-left-circle-fill"></i >
          </div>
          <h2>Sign Up</h2>
          <div>
            <label>Name</label>
            <input type="text" value={newName} autoComplete="off" onChange={(e) => setNewName(e.target.value)} />
          </div>
          <div>
            <label>Email</label>
            <input id="email" type="email" value={newEmail} autoComplete="off" onChange={(e) => setNewEmail(e.target.value)} />
          </div>
          <div>
            <label>Password</label>
            <input type={showPassword ? 'text' : 'password'} value={newPassword} autoComplete="off" onChange={(e) => setNewPassword(e.target.value)} />
          </div>
          <div>
            <label>Confirm Password</label>
            <input type={showPassword ? 'text' : 'password'} value={confirmPassword} autoComplete="off" onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
          <div className={showPassword ? 'show-password active' : 'show-password'} onClick={clickShowPassword}>
            <i className="bi bi-eye-fill"></i> &nbsp;Show Password
          </div>
          <p className="err-message">{formError}</p>
          {isCreating ? (
            <img src={UpdateLoading} className="update-loading" />
          ) : (
            <button type="submit">Create Account</button>
          )}
        </form>
      </div>
    </div >
  );
};