import api from '../../utils/axios';
import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router';
import { getProfileImage } from '../../utils/profileImage';
import UpdateLoading from '../../assets/update-loading.gif';
import './SettingPage.css';

export function SettingPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    return JSON.parse(localStorage.getItem('user'));
  });

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [formError, setFormError] = useState('');

  const [profileNav, setProfileNav] = useState(true);
  const [securityNav, setSecurityNav] = useState(false);
  const [editBtn, setEditBtn] = useState(false);

  const [changePfpBtn, setChangePfpBtn] = useState(false);
  const [profileFile, setProfileFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const message = location.state?.message;

    if (!message) return;

    navigate(location.pathname, {
      replace: true,
      state: null
    });

    window.alert(message);
  }, [location.state, location.pathname, navigate]);

  function navBtnSwitch(navBtn1, navBtn2) {
    navBtn1((prev) => {
      if (prev === true) {
        return true;
      };

      if (prev === false) {
        navBtn2(false);
        return true;
      };
    });
  };

  function btnSwitch(setBtn) {
    setBtn((prev) => !prev);
  };

  function cancelEditBtn() {
    setEditBtn((prev) => !prev);
    setName(user?.name || '');
    setEmail(user?.email || '');
    setFormError('');
  };

  function cancelChangePfpBtn() {
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    };

    setChangePfpBtn(false);
    setProfileFile(null);
    setPhotoPreview(null);
  }

  function importPfp(e) {
    const file = e.target.files[0];
    if (!file) return;

    setProfileFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setChangePfpBtn(true);
  };

  async function updateProfile() {
    try {
      setIsUpdating(true);
      const response = await api.patch('/api/v1/auth/update', {
        name,
        email
      });

      const updatedUser = response.data.data.user;

      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      setFormError('');
      setEditBtn(false);
      return updatedUser;
    } catch (error) {
      setFormError(error.response?.data?.message);
    } finally {
      setIsUpdating(false);
    }
  };

  async function updateProfilePhoto() {
    if (!profileFile) return;

    try {
      setIsUpdating(true);

      const formData = new FormData();
      formData.append('profile', profileFile);

      const response = await api.patch('/api/v1/auth/update-profile-image', formData);
      const updatedUser = response.data.data.user;

      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }

      setProfileFile(null);
      setPhotoPreview(null);
      setChangePfpBtn(false);
      setFormError('');
    } catch (error) {
      return setFormError(error.response?.data?.message || 'Unable to load the photo');
    } finally {
      setIsUpdating(false);
    }
  };

  async function removeProfilePhoto() {
    const confirm = window.confirm('Do you want to remove your profile photo?');
    if (!confirm) return;

    try {
      setIsUpdating(true);

      const response = await api.delete('/api/v1/auth/remove-profile-image');
      const updatedUser = response.data.data.user;

      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setFormError('');
    } catch (error) {
      setFormError(error.response?.data?.message || 'Unable to remove the photo');
    } finally {
      setIsUpdating(false);
    }
  };

  function performByKey(e, perform) {
    if (e.key === 'Enter') {
      perform();
    };
  };

  function disable2fa() {
    const confirm = window.confirm('Do you want to disable your two-factor authentication?');
    if (confirm) {
      navigate('/disable/two-factor');
    };
  };

  return (
    <div className="setting-page">
      <title>Setting Profile</title>

      <div className="header">
        <div>
          <NavLink className="image-container" to="/dashboard">
            {/* <img src={user?.profile ? `/uploads/users/${user.profile}` : '/uploads/users/user-default.png'} /> */}
            <img src={getProfileImage(user?.profile)} />
          </NavLink>
          <p>Welcome, {user?.name}</p>
        </div>
      </div>

      <p className="user-email">
        <i className="bi bi-check-circle-fill"></i>
        <span>{user?.email}</span>
      </p>

      <div className="btns-container">
        <div>
          <button className={profileNav ? 'active' : ''} onClick={() => navBtnSwitch(setProfileNav, setSecurityNav)}>Profile</button>
          <button className={securityNav ? 'active' : ''} onClick={() => navBtnSwitch(setSecurityNav, setProfileNav)}>Security</button>
        </div>
      </div>

      <div className="features-display">
        {profileNav ? (
          <div className="profile-container">
            <div className="img-box">
              {/* <img src={photoPreview || (user?.profile ? `/uploads/users/${user.profile}` : '/uploads/users/user-default.png')} /> */}
              <img src={photoPreview || getProfileImage(user?.profile)} />
              <div>
                {changePfpBtn ? (
                  <>
                    <button className="save-btn" onClick={updateProfilePhoto}>{isUpdating ? <img className='update-loading' src={UpdateLoading} /> : 'Save'}</button>
                    <button className="cancel-btn" onClick={cancelChangePfpBtn} disabled={isUpdating}>Cancel</button>
                  </>
                ) : (
                  <>
                    {user?.profile === 'user-default.png' ? (
                      <>
                        <label className="change-img" htmlFor="photo">Change profile</label>
                        <input type="file" className="img-input" id="photo" accept="image/*" onChange={importPfp} />
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="change-img" htmlFor="photo">Change profile</label>
                          <input type="file" className="img-input" id="photo" accept="image/*" onChange={importPfp} />
                        </div>
                        <div className="remove-img" onClick={removeProfilePhoto} disabled={isUpdating}>
                          {isUpdating ? <img className="update-loading" src={UpdateLoading} /> : 'Remove profile'}
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
            <span></span>
            <div className="name-email-box" onKeyDown={name.trim() === user.name && email.trim() === user.email ? undefined : (e) => performByKey(e, updateProfile)}>
              <div className="name-email-wrap">
                <label>Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} disabled={!editBtn} />
              </div>

              <div className="name-email-wrap">
                <label>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={!editBtn} />
              </div>

              <p className="err-message">{formError}</p>

              <div className="btns-wrap">
                {!editBtn ? (
                  <button className="edit-btn" onClick={() => btnSwitch(setEditBtn)}>Edit</button>
                ) : (
                  <>
                    <button className={name.trim() === user?.name && email.trim() === user?.email ? 'update-btn disable' : 'update-btn'} onClick={updateProfile} disabled={name.trim() === user?.name && email.trim() === user?.email}>
                      {isUpdating ? <img className="update-loading" src={UpdateLoading} /> : 'Update'}
                    </button>
                    <button className="cancel-btn" onClick={cancelEditBtn} disabled={isUpdating}>Cancel</button>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : securityNav ? (
          <div className="security-container">
            <NavLink to="/change-password" className="link-wrap">
              <p>Change the password</p>
              <div className="icon-wrap">
                <span></span>
                <i className="bi bi-stars"></i>
              </div>
            </NavLink>

            <div className="btn-wrap">
              <p>Set up two factors authentication</p>
              <div className="icon-wrap">
                {user.twoFactorEnabled ? (
                  <button className="two-fa-btn disable" onClick={disable2fa}>Disable</button>
                ) : (
                  <button className="two-fa-btn enable" onClick={() => navigate('/enable/two-factor')}>Enable</button>
                )}
                <span></span>
                <i className="bi bi-shield-check"></i>
              </div>
            </div>

            <NavLink to="/terminate-account" className="link-wrap">
              <p>Terminate account</p>
              <div className="icon-wrap">
                <span></span>
                <i className="bi bi-x-circle-fill"></i>
              </div>
            </NavLink>
          </div>
        ) : ''}
      </div>
    </div >
  );
};