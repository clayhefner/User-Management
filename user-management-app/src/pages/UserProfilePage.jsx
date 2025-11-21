import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Form, Input, Select, Switch, Row, Col, Tag, Descriptions, Divider, Button, Card, message, Alert, Avatar, Progress, Collapse, Tooltip, Breadcrumb, Modal, Upload } from 'antd';
import { GoogleOutlined, WindowsOutlined, LockOutlined, UnlockOutlined, WarningOutlined, ClockCircleOutlined, CheckCircleOutlined, EditOutlined, SaveOutlined, CloseOutlined, SafetyOutlined, ExperimentOutlined, MailOutlined, ExclamationCircleOutlined, StopOutlined, CameraOutlined } from '@ant-design/icons';
import { mockUsers } from '../data/mockUsers';

const UserProfilePage = ({ mode: pageMode, userRole }) => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [searchParams] = useSearchParams();
  const queryMode = searchParams.get('mode') || 'view';
  const [form] = Form.useForm();
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({ title: '', content: '', action: null });
  const [avatarUrl, setAvatarUrl] = useState(null);

  // Determine context
  const isSelfService = pageMode === 'self';
  const isAdminMode = pageMode === 'admin';

  // For self-service, use the first user in mockUsers as "current user" for PoC
  const currentUserId = isSelfService ? mockUsers[0].id : null;

  // Determine if admin is managing another user
  const isAdminManagingOther = isAdminMode && userId && userId !== currentUserId;

  // Mode detection for add/edit/view
  const isViewMode = queryMode === 'view';
  const isAddMode = queryMode === 'add';
  const isEditMode = queryMode === 'edit' || isSelfService;

  // Get user data
  const user = isSelfService
    ? mockUsers.find(u => u.id === currentUserId)
    : userId
      ? mockUsers.find(u => u.id === userId)
      : null;

  // Permission checks
  const isSuperAdmin = userRole === 'super_admin';
  const isPlatformAdmin = userRole === 'platform_admin' || isSuperAdmin;
  const isRegularUser = userRole === 'user';

  // Section visibility
  const showAccountSettings = true; // All users can see this
  const showRolesPermissions = isAdminMode && isPlatformAdmin;
  const showMFA = isAdminMode && isSuperAdmin;

  useEffect(() => {
    // Reset editing state when userId changes (navigating to different user)
    setEditingSection(null);
    setShowPasswordChange(false);

    // Load avatar from localStorage
    const currentId = isSelfService ? currentUserId : userId;
    if (currentId) {
      const savedAvatar = localStorage.getItem(`avatar_${currentId}`);
      setAvatarUrl(savedAvatar);
    }

    if (user) {
      // Calculate password expiration date (90 days from creation for PoC)
      const createdDate = new Date(user.createdOn);
      const expirationDate = new Date(createdDate);
      expirationDate.setDate(expirationDate.getDate() + 90);
      const expirationString = expirationDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      form.setFieldsValue({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phonePrefix: user.phonePrefix,
        phoneNumber: user.phoneNumber,
        role: user.role,
        testModeOnly: user.testModeOnly,
        active: user.active,
        locked: user.locked,
        verified: user.verified,
        ssoProvider: user.ssoProvider,
        mfaEnabled: user.mfaEnabled || false,
        passwordExpiration: expirationString,
        timezone: user.timezone || null,
      });
    } else if (isAddMode) {
      form.resetFields();
      form.setFieldsValue({
        phonePrefix: '+1',
        role: 4,
        testModeOnly: true,
        active: true,
        locked: false,
        verified: false,
        ssoProvider: null,
        mfaEnabled: false,
        passwordExpiration: null,
        timezone: null,
      });
    }
  }, [user, userId, isAddMode, form]);

  const handleEditSection = (section) => {
    setEditingSection(section);
  };

  const handleCancelSection = () => {
    // Reset form fields to original values
    if (user) {
      const createdDate = new Date(user.createdOn);
      const expirationDate = new Date(createdDate);
      expirationDate.setDate(expirationDate.getDate() + 90);
      const expirationString = expirationDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      form.setFieldsValue({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phonePrefix: user.phonePrefix,
        phoneNumber: user.phoneNumber,
        passwordExpiration: expirationString,
        timezone: user.timezone || null,
        role: user.role,
        testModeOnly: user.testModeOnly,
        active: user.active,
        locked: user.locked,
        verified: user.verified,
        ssoProvider: user.ssoProvider,
        mfaEnabled: user.mfaEnabled || false,
        oldPassword: undefined,
        newPassword: undefined,
        confirmPassword: undefined,
      });
    }
    setEditingSection(null);
    setShowPasswordChange(false);
    setPasswordStrength({ score: 0, label: '', color: '' });
  };

  const handleSaveSection = async (section) => {
    try {
      // Validate only the fields in this section
      let fieldsToValidate = [];

      if (section === 'userInfo') {
        fieldsToValidate = ['firstName', 'lastName', 'phonePrefix', 'phoneNumber'];
      } else if (section === 'password') {
        if (showPasswordChange) {
          if (isSelfService) {
            fieldsToValidate = ['oldPassword', 'newPassword', 'confirmPassword'];
          } else {
            fieldsToValidate = ['newPassword', 'confirmPassword'];
          }
        }
      } else if (section === 'preferences') {
        fieldsToValidate = ['timezone'];
      } else if (section === 'accessPermissions') {
        fieldsToValidate = ['role', 'testModeOnly'];
      } else if (section === 'roleAssignment') {
        fieldsToValidate = ['role'];
      } else if (section === 'accountStatus') {
        fieldsToValidate = ['active', 'locked', 'verified'];
      } else if (section === 'authSettings') {
        fieldsToValidate = ['ssoProvider', 'mfaEnabled'];
      }

      if (fieldsToValidate.length > 0) {
        await form.validateFields(fieldsToValidate);
      }

      const values = form.getFieldsValue(fieldsToValidate);

      if (isSelfService) {
        if (section === 'password' && showPasswordChange) {
          console.log('Self-service password change requested');
          message.success('Password changed successfully!');
          setShowPasswordChange(false);
          setPasswordStrength({ score: 0, label: '', color: '' });
        } else {
          message.success('Section updated successfully!');
          console.log('Self-service section update:', section, values);
        }
      } else {
        // Admin mode
        if (section === 'password' && showPasswordChange) {
          console.log('Admin password reset for user:', userId);
          console.log('AUDIT: Admin', userRole, 'reset password for user', userId);
          message.success('Password reset successfully. User will be notified via email.');
          setShowPasswordChange(false);
          setPasswordStrength({ score: 0, label: '', color: '' });
        } else {
          message.success('Section updated successfully!');
          console.log('AUDIT: Admin', userRole, 'updated', section, 'for user', userId, ':', values);
        }
      }

      setEditingSection(null);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      // Handle password change if password change is active
      if (showPasswordChange && (values.oldPassword || values.newPassword || values.confirmPassword)) {
        if (isSelfService) {
          console.log('Self-service password change requested');
          message.success('Password changed successfully!');
          setShowPasswordChange(false);
        } else {
          console.log('Admin password reset for user:', userId);
          console.log('AUDIT: Admin', userRole, 'reset password for user', userId);
          message.success('Password reset successfully. User will be notified via email.');
        }
        // In a real app, you would call an API to change/reset the password
      } else if (!isSelfService && (values.newPassword || values.confirmPassword)) {
        // Admin password reset
        console.log('Admin password reset for user:', userId);
        console.log('AUDIT: Admin', userRole, 'reset password for user', userId);
        message.success('Password reset successfully. User will be notified via email.');
      }

      // Remove password fields from user data update
      const { oldPassword, newPassword, confirmPassword, passwordExpiration, ...userData } = values;

      if (isAddMode) {
        message.success('User added successfully!');
        console.log('AUDIT: Admin', userRole, 'added new user:', userData);
      } else if (isEditMode) {
        if (isSelfService) {
          message.success('Profile updated successfully!');
          console.log('Self-service profile update:', userData);
        } else {
          message.success('User updated successfully!');
          console.log('AUDIT: Admin', userRole, 'updated user', userId, ':', userData);
        }
      }

      // Navigate based on context
      if (isSelfService) {
        navigate('/profile');
      } else {
        navigate('/users');
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleCancel = () => {
    if (isSelfService) {
      navigate('/profile');
    } else {
      navigate('/users');
    }
  };

  const showActionModal = (action) => {
    let config = {};

    switch (action) {
      case 'resendVerification':
        config = {
          title: 'Resend Verification Email',
          content: `Are you sure you want to resend the verification email to ${user.email}? This will send a new verification link to the user.`,
          action: () => {
            message.success('Verification email sent successfully!');
            console.log('AUDIT: Admin', userRole, 'resent verification email to user', userId);
          }
        };
        break;
      case 'resetSecurityLock':
        config = {
          title: 'Reset Security Lock',
          content: `Are you sure you want to reset the security lock for ${user.firstName} ${user.lastName}? This will unlock the user's account and allow them to log in again.`,
          action: () => {
            message.success('Security lock reset successfully!');
            console.log('AUDIT: Admin', userRole, 'reset security lock for user', userId);
          }
        };
        break;
      case 'disableAccount':
        config = {
          title: 'Disable Account',
          content: `Are you sure you want to disable the account for ${user.firstName} ${user.lastName}? The user will not be able to log in until the account is re-enabled.`,
          action: () => {
            message.success('Account disabled successfully!');
            console.log('AUDIT: Admin', userRole, 'disabled account for user', userId);
          }
        };
        break;
      case 'enableAccount':
        config = {
          title: 'Enable Account',
          content: `Are you sure you want to enable the account for ${user.firstName} ${user.lastName}? The user will be able to log in once their account is enabled.`,
          action: () => {
            message.success('Account enabled successfully!');
            console.log('AUDIT: Admin', userRole, 'enabled account for user', userId);
          }
        };
        break;
      case 'resetMFA':
        config = {
          title: 'Reset Multi-Factor Authentication',
          content: `Are you sure you want to reset MFA for ${user.firstName} ${user.lastName}? This will remove their current MFA setup and require them to set it up again on their next login.`,
          action: () => {
            message.success('MFA reset successfully!');
            console.log('AUDIT: Super Admin', userRole, 'reset MFA for user', userId);
          }
        };
        break;
      default:
        return;
    }

    setModalConfig(config);
    setIsModalOpen(true);
  };

  const handleModalOk = () => {
    if (modalConfig.action) {
      modalConfig.action();
    }
    setIsModalOpen(false);
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
  };

  const handleAvatarUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Image = e.target.result;
      const currentId = isSelfService ? currentUserId : userId;
      if (currentId) {
        localStorage.setItem(`avatar_${currentId}`, base64Image);
        setAvatarUrl(base64Image);
        message.success('Avatar updated successfully!');
      }
    };
    reader.readAsDataURL(file);
    return false; // Prevent default upload behavior
  };

  const getRoleLabel = (roleNumber) => {
    const roleMap = {
      1: 'Super Admin',
      2: 'Admin',
      3: 'Manager',
      4: 'User',
      5: 'Viewer',
    };
    return roleMap[roleNumber] || 'Unknown';
  };

  const getRoleColor = (roleNumber) => {
    const colorMap = {
      1: 'red',
      2: 'orange',
      3: 'blue',
      4: 'green',
      5: 'default',
    };
    return colorMap[roleNumber] || 'default';
  };

  const getUserInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const calculatePasswordStrength = (password) => {
    if (!password) return { score: 0, label: '', color: '' };

    let score = 0;

    // Length check
    if (password.length >= 8) score += 25;
    if (password.length >= 12) score += 15;

    // Character variety checks
    if (/[a-z]/.test(password)) score += 15;
    if (/[A-Z]/.test(password)) score += 15;
    if (/[0-9]/.test(password)) score += 15;
    if (/[^a-zA-Z0-9]/.test(password)) score += 15;

    let label = '';
    let color = '';

    if (score < 40) {
      label = 'Weak';
      color = '#ff4d4f';
    } else if (score < 70) {
      label = 'Fair';
      color = '#faad14';
    } else if (score < 90) {
      label = 'Good';
      color = '#52c41a';
    } else {
      label = 'Strong';
      color = '#52c41a';
    }

    return { score, label, color };
  };

  const roleOptions = [
    { value: 1, label: 'Super Admin', disabled: !isSuperAdmin },
    { value: 2, label: 'Admin', disabled: !isSuperAdmin },
    { value: 3, label: 'Manager' },
    { value: 4, label: 'User' },
    { value: 5, label: 'Viewer' },
  ];

  const ssoOptions = [
    { value: null, label: 'None' },
    { value: 'google', label: 'Google' },
    { value: 'microsoft', label: 'Microsoft' },
  ];

  const timezoneOptions = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
    { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
    { value: 'UTC', label: 'UTC' },
  ];

  const getTitle = () => {
    if (isSelfService) return 'My Profile';
    if (isAddMode) return 'Add New User';
    if (isEditMode) return 'Edit User';
    return 'User Details';
  };

  if (isViewMode && user && !isSelfService) {
    return (
      <div className="page-container">
        <div className="page-header page-header-sticky">
          <div className="header-left">
            <div className="header-title-section">
              <h1>{getTitle()}</h1>
              <div className="user-info">
                <span className="user-id">ID: {userId}</span>
                <span className="user-name">{user.firstName} {user.lastName}</span>
              </div>
            </div>
          </div>
          <div className="header-actions">
            <Button onClick={handleCancel}>Close</Button>
            <Button type="primary" onClick={() => navigate(`/users/${userId}?mode=edit`)}>
              Edit User
            </Button>
          </div>
        </div>

        {isAdminManagingOther && (
          <Alert
            message={`You are managing ${user.firstName} ${user.lastName}'s account`}
            description="Changes made here will affect this user's account and will be logged for audit purposes."
            type="warning"
            icon={<WarningOutlined />}
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        <div className="form-content">
          <Card bordered className="form-section" style={{ marginBottom: 24 }}>
            <Divider orientation="left" style={{ fontWeight: 'bold', marginTop: 0 }}>
              User Information
            </Divider>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Full Name" span={2}>
                {user.firstName} {user.lastName}
              </Descriptions.Item>
              <Descriptions.Item label="Email" span={2}>
                {user.email}
              </Descriptions.Item>
              <Descriptions.Item label="Phone" span={2}>
                {user.phonePrefix} {user.phoneNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Last Login" span={2}>
                {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
              </Descriptions.Item>
              <Descriptions.Item label="Created On" span={2}>
                {new Date(user.createdOn).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Modified On" span={2}>
                {new Date(user.modifiedOn).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>

            {isSelfService && (
              <>
                <Divider orientation="left" style={{ fontWeight: 'bold' }}>
                  Your Role
                </Divider>
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="Role" span={2}>
                    {getRoleLabel(user.role)}
                  </Descriptions.Item>
                </Descriptions>
              </>
            )}

            {showRolesPermissions && (
              <>
                <Divider orientation="left" style={{ fontWeight: 'bold' }}>
                  Roles & Permissions
                </Divider>
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="Role">
                    {getRoleLabel(user.role)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Dashboard Access">
                    {user.active ? (
                      <Tag color="green">Enabled</Tag>
                    ) : (
                      <Tag color="red">Disabled</Tag>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Security Lock">
                    {user.locked ? (
                      <Tag color="red" icon={<LockOutlined />}>Locked Out</Tag>
                    ) : (
                      <Tag color="green" icon={<UnlockOutlined />}>Normal</Tag>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Verified">
                    {user.verified ? (
                      <Tag color="green">Verified</Tag>
                    ) : (
                      <Tag color="orange">Pending</Tag>
                    )}
                  </Descriptions.Item>
                </Descriptions>
              </>
            )}

            {showMFA && (
              <>
                <Divider orientation="left" style={{ fontWeight: 'bold' }}>
                  MFA
                </Divider>
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="SSO Provider">
                    {user.ssoProvider === 'google' && (
                      <Tag icon={<GoogleOutlined />} color="#4285F4">
                        Google
                      </Tag>
                    )}
                    {user.ssoProvider === 'microsoft' && (
                      <Tag icon={<WindowsOutlined />} color="#00A4EF">
                        Microsoft
                      </Tag>
                    )}
                    {!user.ssoProvider && '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="MFA Enabled">
                    {user.mfaEnabled ? (
                      <Tag color="green">Enabled</Tag>
                    ) : (
                      <Tag color="default">Disabled</Tag>
                    )}
                  </Descriptions.Item>
                </Descriptions>
              </>
            )}
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header page-header-sticky">
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          {!isSelfService && (
            <Breadcrumb
              style={{ marginBottom: 8 }}
              items={[
                {
                  title: 'Users',
                  href: '#',
                  onClick: (e) => {
                    e.preventDefault();
                    navigate('/users');
                  }
                },
                {
                  title: isAddMode ? 'New User' : user ? `${user.firstName} ${user.lastName}` : 'User Profile'
                }
              ]}
            />
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ margin: 0 }}>{getTitle()}</h1>
            {!isSelfService && isAddMode && (
              <div className="header-actions">
                <Button onClick={handleCancel}>Cancel</Button>
                <Button type="primary" onClick={handleSave}>
                  Add User
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isAdminManagingOther && (
        <Alert
          message={`You are managing ${user.firstName} ${user.lastName}'s account`}
          description="Changes made here will affect this user's account and will be logged for audit purposes."
          type="warning"
          icon={<WarningOutlined />}
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <div className="form-content">
        <Form form={form} layout="vertical" name="userProfile">
          {user && !isAddMode ? (
            <Row gutter={24}>
              {/* Left Sidebar - User Info */}
              <Col span={6}>
                <Card bordered style={{ position: 'sticky', top: 24 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
                      <Avatar
                        size={100}
                        src={avatarUrl}
                        style={{
                          backgroundColor: '#4013be',
                          fontSize: '40px',
                          fontWeight: 'bold',
                        }}
                      >
                        {!avatarUrl && getUserInitials(user.firstName, user.lastName)}
                      </Avatar>
                      <Upload
                        accept="image/*"
                        showUploadList={false}
                        beforeUpload={handleAvatarUpload}
                      >
                        <Button
                          type="primary"
                          shape="circle"
                          icon={<CameraOutlined />}
                          size="small"
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                          }}
                        />
                      </Upload>
                    </div>
                    <h2 style={{ margin: 0, marginBottom: 4 }}>
                      {user.firstName} {user.lastName}
                    </h2>
                    <div style={{ fontSize: '13px', color: '#8c8c8c', marginBottom: 16 }}>
                      {user.email}
                    </div>
                  </div>

                  <Divider style={{ margin: '16px 0' }} />

                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: 4 }}>Role</div>
                    <div style={{ fontWeight: 500, fontSize: '14px' }}>
                      {getRoleLabel(user.role)}
                    </div>
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: 4 }}>Mode Access</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '14px' }}>
                      {user.testModeOnly ? (
                        <>
                          <span style={{ fontWeight: 500 }}>Test Only</span>
                          <Tooltip title="Test Mode Only">
                            <ExperimentOutlined style={{ color: '#722ed1', fontSize: '16px' }} />
                          </Tooltip>
                        </>
                      ) : (
                        <span style={{ fontWeight: 500 }}>Test and Live</span>
                      )}
                    </div>
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: 4 }}>Status</div>
                    {!user.active ? (
                      <Tag color="red" style={{ fontSize: '13px', width: 'fit-content' }}>Inactive</Tag>
                    ) : user.active && !user.verified ? (
                      <Tag color="orange" style={{ fontSize: '13px', width: 'fit-content' }}>Invited</Tag>
                    ) : (
                      <Tag color="green" style={{ fontSize: '13px', width: 'fit-content' }}>Active</Tag>
                    )}
                  </div>

                  {user.locked && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: 4 }}>Alert</div>
                      <Tag color="red" icon={<LockOutlined />} style={{ fontSize: '13px', width: 'fit-content' }}>Security Lock Out</Tag>
                    </div>
                  )}

                  <Divider style={{ margin: '16px 0' }} />

                  <div style={{ fontSize: '13px' }}>
                    <div style={{ marginBottom: 8 }}>
                      <ClockCircleOutlined style={{ marginRight: 6, color: '#8c8c8c' }} />
                      <span style={{ color: '#8c8c8c' }}>Last Login:</span>
                    </div>
                    <div style={{ paddingLeft: 22 }}>
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      }) : 'Never'}
                    </div>
                  </div>

                  {!isSelfService && (
                    <>
                      <Divider style={{ margin: '16px 0' }} />
                      <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                        <span className="user-id">ID: {userId}</span>
                      </div>
                    </>
                  )}
                </Card>

                {/* Action Buttons - Only in Edit Mode for Admins */}
                {!isSelfService && !isAddMode && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {/* Resend Verification Email - Show if not verified */}
                      {!user.verified && (
                        <Button
                          icon={<MailOutlined />}
                          onClick={() => showActionModal('resendVerification')}
                          block
                        >
                          Resend Verification Email
                        </Button>
                      )}

                      {/* Reset Security Lock - Show if locked */}
                      {user.locked && (
                        <Button
                          icon={<UnlockOutlined />}
                          onClick={() => showActionModal('resetSecurityLock')}
                          block
                        >
                          Reset Security Lock
                        </Button>
                      )}

                      {/* Enable/Disable Account - Always show for admins */}
                      {user.active ? (
                        <Button
                          danger
                          icon={<StopOutlined />}
                          onClick={() => showActionModal('disableAccount')}
                          block
                        >
                          Disable Account
                        </Button>
                      ) : (
                        <Button
                          icon={<CheckCircleOutlined />}
                          onClick={() => showActionModal('enableAccount')}
                          block
                        >
                          Enable Account
                        </Button>
                      )}

                      {/* Reset MFA - Super Admin only, show if MFA enabled */}
                      {isSuperAdmin && user.mfaEnabled && (
                        <Button
                          danger
                          icon={<SafetyOutlined />}
                          onClick={() => showActionModal('resetMFA')}
                          block
                        >
                          Reset MFA
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </Col>

              {/* Right Side - Content Cards */}
              <Col span={18}>
                {/* User Information Card */}
                <Card
                  title="User Information"
                  bordered
                  className="form-section"
                  style={{ marginBottom: 24 }}
                  extra={
                    editingSection !== 'userInfo' && !isAddMode ? (
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEditSection('userInfo')}
                      >
                        Edit
                      </Button>
                    ) : editingSection === 'userInfo' && !isAddMode ? (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Button icon={<CloseOutlined />} onClick={handleCancelSection}>
                          Cancel
                        </Button>
                        <Button type="primary" icon={<SaveOutlined />} onClick={() => handleSaveSection('userInfo')}>
                          Save
                        </Button>
                      </div>
                    ) : null
                  }
                >
                  {editingSection !== 'userInfo' && !isAddMode ? (
                    // Read-only view with labels and text
                    <>
                      <Row gutter={16}>
                        <Col span={12}>
                          <div style={{ marginBottom: 24 }}>
                            <div style={{ fontSize: '14px', fontWeight: 500, color: '#28364f', marginBottom: 8 }}>
                              First Name
                            </div>
                            <div style={{ fontSize: '14px', color: '#595959' }}>
                              {user?.firstName}
                            </div>
                          </div>
                        </Col>
                        <Col span={12}>
                          <div style={{ marginBottom: 24 }}>
                            <div style={{ fontSize: '14px', fontWeight: 500, color: '#28364f', marginBottom: 8 }}>
                              Last Name
                            </div>
                            <div style={{ fontSize: '14px', color: '#595959' }}>
                              {user?.lastName}
                            </div>
                          </div>
                        </Col>
                      </Row>

                      <div style={{ marginBottom: 24 }}>
                        <div style={{ fontSize: '14px', fontWeight: 500, color: '#28364f', marginBottom: 8 }}>
                          Phone Number
                        </div>
                        <div style={{ fontSize: '14px', color: '#595959' }}>
                          {user?.phonePrefix} {user?.phoneNumber}
                        </div>
                      </div>
                    </>
                  ) : (
                    // Editable form view
                    <>
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item
                            label="First Name"
                            name="firstName"
                            rules={[{ required: true, message: 'Please enter first name' }]}
                          >
                            <Input placeholder="Enter first name" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            label="Last Name"
                            name="lastName"
                            rules={[{ required: true, message: 'Please enter last name' }]}
                          >
                            <Input placeholder="Enter last name" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col span={6}>
                          <Form.Item
                            label="Phone Prefix"
                            name="phonePrefix"
                            rules={[{ required: true, message: 'Required' }]}
                          >
                            <Input placeholder="+1" />
                          </Form.Item>
                        </Col>
                        <Col span={18}>
                          <Form.Item
                            label="Phone Number"
                            name="phoneNumber"
                            rules={[{ required: true, message: 'Please enter phone number' }]}
                          >
                            <Input placeholder="(555) 123-4567" />
                          </Form.Item>
                        </Col>
                      </Row>
                    </>
                  )}
                </Card>

                {/* Access & Permissions Card - Admin Only */}
                {!isSelfService && (
                  <Card
                    title="Access & Permissions"
                    bordered
                    className="form-section"
                    style={{ marginBottom: 24 }}
                    extra={
                      editingSection !== 'accessPermissions' && !isAddMode ? (
                        <Button
                          type="text"
                          icon={<EditOutlined />}
                          onClick={() => handleEditSection('accessPermissions')}
                        >
                          Edit
                        </Button>
                      ) : editingSection === 'accessPermissions' && !isAddMode ? (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <Button icon={<CloseOutlined />} onClick={handleCancelSection}>
                            Cancel
                          </Button>
                          <Button type="primary" icon={<SaveOutlined />} onClick={() => handleSaveSection('accessPermissions')}>
                            Save
                          </Button>
                        </div>
                      ) : null
                    }
                  >
                    {editingSection !== 'accessPermissions' && !isAddMode ? (
                      // Read-only view
                      <Descriptions column={1} bordered>
                        <Descriptions.Item label="Role">
                          <span style={{ fontWeight: 500 }}>
                            {getRoleLabel(user.role)}
                          </span>
                        </Descriptions.Item>
                        <Descriptions.Item label="Mode Access">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {user.testModeOnly ? (
                              <>
                                <span style={{ fontWeight: 500 }}>Test Only</span>
                                <Tooltip title="Test Mode Only">
                                  <ExperimentOutlined style={{ color: '#722ed1', fontSize: '16px' }} />
                                </Tooltip>
                              </>
                            ) : (
                              <span style={{ fontWeight: 500 }}>Test and Live</span>
                            )}
                          </div>
                        </Descriptions.Item>
                      </Descriptions>
                    ) : (
                      // Editable form view
                      <>
                        <Form.Item
                          label="Role"
                          name="role"
                          rules={[{ required: true, message: 'Please select a role' }]}
                        >
                          <Select options={roleOptions} placeholder="Select role" />
                        </Form.Item>
                        <Form.Item
                          label="Mode Access"
                          name="testModeOnly"
                          rules={[{ required: true, message: 'Please select mode access' }]}
                        >
                          <Select placeholder="Select mode access">
                            <Select.Option value={true}>Test Only</Select.Option>
                            <Select.Option value={false}>Test and Live</Select.Option>
                          </Select>
                        </Form.Item>
                      </>
                    )}
                  </Card>
                )}

                {/* Security Card */}
                <Card
                  title="Security"
                  bordered
                  className="form-section"
                  style={{ marginBottom: 24 }}
                  extra={
                    !showPasswordChange && editingSection !== 'password' && !isAddMode ? (
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => {
                          setShowPasswordChange(true);
                          handleEditSection('password');
                        }}
                      >
                        {isSelfService ? 'Change Password' : 'Reset Password'}
                      </Button>
                    ) : showPasswordChange && editingSection === 'password' && !isAddMode ? (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Button icon={<CloseOutlined />} onClick={handleCancelSection}>
                          Cancel
                        </Button>
                        <Button type="primary" icon={<SaveOutlined />} onClick={() => handleSaveSection('password')}>
                          {isSelfService ? 'Save Password' : 'Reset Password'}
                        </Button>
                      </div>
                    ) : null
                  }
                >
                  {!isAddMode && !showPasswordChange && (
                        <Descriptions column={1} bordered>
                          <Descriptions.Item label="Email">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              {user?.email}
                              {user?.verified && (
                                <Tag color="green" icon={<CheckCircleOutlined />}>Verified</Tag>
                              )}
                            </div>
                          </Descriptions.Item>
                          <Descriptions.Item label="Password Expiration Date">
                            {(() => {
                              if (user?.createdOn) {
                                const createdDate = new Date(user.createdOn);
                                const expirationDate = new Date(createdDate);
                                expirationDate.setDate(expirationDate.getDate() + 90);
                                return expirationDate.toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                });
                              }
                              return 'Not set';
                            })()}
                          </Descriptions.Item>
                          <Descriptions.Item label="Single Sign-On (SSO)">
                            {user?.ssoProvider === 'google' ? (
                              <span>
                                <span style={{ display: 'inline-block', marginRight: 8 }}>
                                  <svg width="16" height="16" viewBox="0 0 48 48" style={{ verticalAlign: 'middle' }}>
                                    <path fill="#4285F4" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"/>
                                    <path fill="#34A853" d="M6.3 14.7l6.6 4.8C14.1 16.2 18.7 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 16.4 2 9.8 5.7 6.3 11.5z"/>
                                    <path fill="#FBBC05" d="M24 46c5.5 0 10.5-2 14.4-5.4l-6.7-5.7C29.5 36.7 26.9 37.5 24 37.5c-6.1 0-11.3-3.9-13.2-9.3l-6.6 5.1C8.1 40.3 15.4 46 24 46z"/>
                                    <path fill="#EA4335" d="M44.5 20H24v8.5h11.8c-.9 2.8-2.7 5.2-5.1 6.8l6.7 5.7c4.1-3.8 6.6-9.4 6.6-16 0-1.3-.2-2.7-.5-4z"/>
                                  </svg>
                                </span>
                                Google
                              </span>
                            ) : user?.ssoProvider === 'microsoft' ? (
                              <span>
                                <WindowsOutlined style={{ color: '#00A4EF', marginRight: 8 }} />
                                Microsoft
                              </span>
                            ) : (
                              <span style={{ color: '#8c8c8c' }}>Not configured</span>
                            )}
                          </Descriptions.Item>
                          <Descriptions.Item label="Multi-Factor Authentication (MFA)">
                            {user?.mfaEnabled ? (
                              <span style={{ color: '#52c41a' }}>
                                <SafetyOutlined style={{ marginRight: 8 }} />
                                Enabled
                              </span>
                            ) : (
                              <span style={{ color: '#fa8c16' }}>
                                <SafetyOutlined style={{ marginRight: 8 }} />
                                Not enabled
                              </span>
                            )}
                          </Descriptions.Item>
                        </Descriptions>
                      )}

                      {isSelfService ? (
                        // Self-service: Requires old password
                        <>
                          {!isAddMode && showPasswordChange && (
                            <>
                              <Divider style={{ margin: '16px 0' }} />

                              <Alert
                                message="Changing Your Password"
                                description="Enter your current password and your new password twice to confirm."
                                type="info"
                                showIcon
                                style={{ marginBottom: 16 }}
                              />

                              <Collapse
                                ghost
                                style={{ marginBottom: 16 }}
                                items={[
                                  {
                                    key: 'password-requirements',
                                    label: 'Password Requirements',
                                    children: (
                                      <div style={{ lineHeight: '1.8', color: '#595959' }}>
                                        <div>• At least 8 characters</div>
                                        <div>• One uppercase letter (A-Z)</div>
                                        <div>• One lowercase letter (a-z)</div>
                                        <div>• One number (0-9)</div>
                                        <div>• One special character (!@#$%^&*)</div>
                                      </div>
                                    ),
                                  },
                                ]}
                              />

                              <Form.Item
                                label="Current Password"
                                name="oldPassword"
                                rules={[
                                  { required: true, message: 'Please enter your current password' },
                                ]}
                              >
                                <Input.Password placeholder="Enter current password" />
                              </Form.Item>

                              <Row gutter={16}>
                                <Col span={12}>
                                  <Form.Item
                                    label="New Password"
                                    name="newPassword"
                                    rules={[
                                      { required: true, message: 'Please enter new password' },
                                      { min: 8, message: 'Password must be at least 8 characters' },
                                    ]}
                                  >
                                    <Input.Password
                                      placeholder="Enter new password"
                                      onChange={(e) => {
                                        const strength = calculatePasswordStrength(e.target.value);
                                        setPasswordStrength(strength);
                                      }}
                                    />
                                  </Form.Item>
                                  {passwordStrength.label && (
                                    <div style={{ marginTop: '-16px', marginBottom: '16px' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <span style={{ fontSize: '12px', color: '#8c8c8c' }}>Password Strength</span>
                                        <span style={{ fontSize: '12px', fontWeight: 500, color: passwordStrength.color }}>
                                          {passwordStrength.label}
                                        </span>
                                      </div>
                                      <Progress
                                        percent={passwordStrength.score}
                                        strokeColor={passwordStrength.color}
                                        showInfo={false}
                                        size="small"
                                      />
                                      <div style={{ fontSize: '11px', color: '#8c8c8c', marginTop: 4 }}>
                                        Requirements: 8+ chars, uppercase, lowercase, number, special char
                                      </div>
                                    </div>
                                  )}
                                </Col>
                                <Col span={12}>
                                  <Form.Item
                                    label="Confirm New Password"
                                    name="confirmPassword"
                                    dependencies={['newPassword']}
                                    rules={[
                                      { required: true, message: 'Please confirm your new password' },
                                      ({ getFieldValue }) => ({
                                        validator(_, value) {
                                          if (!value || getFieldValue('newPassword') === value) {
                                            return Promise.resolve();
                                          }
                                          return Promise.reject(new Error('Passwords do not match'));
                                        },
                                      }),
                                    ]}
                                  >
                                    <Input.Password placeholder="Confirm new password" />
                                  </Form.Item>
                                </Col>
                              </Row>
                            </>
                          )}
                        </>
                      ) : (
                        // Admin reset: No old password required
                        <>
                          {!isAddMode && showPasswordChange && (
                            <>
                              <Divider style={{ margin: '16px 0' }} />
                              <Alert
                                message="Admin Password Reset"
                                description="As an administrator, you can reset this user's password without providing their old password. The user will be notified via email and may be required to change their password on next login."
                                type="info"
                                showIcon
                                style={{ marginBottom: 16 }}
                              />
                              <Collapse
                                ghost
                                style={{ marginBottom: 16 }}
                                items={[
                                  {
                                    key: 'password-requirements',
                                    label: 'Password Requirements',
                                    children: (
                                      <div style={{ lineHeight: '1.8', color: '#595959' }}>
                                        <div>• At least 8 characters</div>
                                        <div>• One uppercase letter (A-Z)</div>
                                        <div>• One lowercase letter (a-z)</div>
                                        <div>• One number (0-9)</div>
                                        <div>• One special character (!@#$%^&*)</div>
                                      </div>
                                    ),
                                  },
                                ]}
                              />
                              <Row gutter={16}>
                                <Col span={12}>
                                  <Form.Item
                                    label="New Password"
                                    name="newPassword"
                                    rules={[
                                      { required: true, message: 'Please enter new password' },
                                      { min: 8, message: 'Password must be at least 8 characters' },
                                    ]}
                                  >
                                    <Input.Password placeholder="Enter new password" />
                                  </Form.Item>
                                </Col>
                                <Col span={12}>
                                  <Form.Item
                                    label="Confirm New Password"
                                    name="confirmPassword"
                                    dependencies={['newPassword']}
                                    rules={[
                                      { required: true, message: 'Please confirm the new password' },
                                      ({ getFieldValue }) => ({
                                        validator(_, value) {
                                          if (!value || getFieldValue('newPassword') === value) {
                                            return Promise.resolve();
                                          }
                                          return Promise.reject(new Error('Passwords do not match'));
                                        },
                                      }),
                                    ]}
                                  >
                                    <Input.Password placeholder="Confirm new password" />
                                  </Form.Item>
                                </Col>
                              </Row>
                            </>
                          )}
                        </>
                      )}
                </Card>

                {/* Preferences Card */}
                <Card
                  title="Preferences"
                  bordered
                  className="form-section"
                  style={{ marginBottom: 24 }}
                  extra={
                    editingSection !== 'preferences' && !isAddMode ? (
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEditSection('preferences')}
                      >
                        Edit
                      </Button>
                    ) : editingSection === 'preferences' && !isAddMode ? (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Button icon={<CloseOutlined />} onClick={handleCancelSection}>
                          Cancel
                        </Button>
                        <Button type="primary" icon={<SaveOutlined />} onClick={() => handleSaveSection('preferences')}>
                          Save
                        </Button>
                      </div>
                    ) : null
                  }
                >
                  {editingSection !== 'preferences' && !isAddMode ? (
                    // Read-only view with Descriptions
                    <Descriptions column={1} bordered>
                      <Descriptions.Item label="Timezone">
                        {user?.timezone || 'Not set'}
                      </Descriptions.Item>
                    </Descriptions>
                  ) : (
                    // Editable form view
                    <Form.Item label="Timezone" name="timezone">
                      <Select
                        options={timezoneOptions}
                        placeholder="Select timezone"
                      />
                    </Form.Item>
                  )}
                </Card>
              </Col>
            </Row>
          ) : isAddMode ? (
            <Card bordered className="form-section" style={{ marginBottom: 24 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="First Name"
                    name="firstName"
                    rules={[{ required: true, message: 'Please enter first name' }]}
                  >
                    <Input placeholder="Enter first name" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Last Name"
                    name="lastName"
                    rules={[{ required: true, message: 'Please enter last name' }]}
                  >
                    <Input placeholder="Enter last name" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'Please enter email' },
                  { type: 'email', message: 'Please enter a valid email' },
                ]}
              >
                <Input placeholder="user@example.com" />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Role"
                    name="role"
                    rules={[{ required: true, message: 'Please select a role' }]}
                  >
                    <Select options={roleOptions} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Environment Access"
                    name="testModeOnly"
                    rules={[{ required: true, message: 'Please select environment access' }]}
                  >
                    <Select placeholder="Select environment access">
                      <Select.Option value={true}>Test Only</Select.Option>
                      <Select.Option value={false}>Test and Live</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          ) : null}
        </Form>
      </div>

      {/* Confirmation Modal */}
      <Modal
        title={modalConfig.title}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Confirm"
        cancelText="Cancel"
        icon={<ExclamationCircleOutlined />}
      >
        <p>{modalConfig.content}</p>
      </Modal>
    </div>
  );
};

export default UserProfilePage;
