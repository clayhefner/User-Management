import { useEffect } from 'react';
import { Modal, Form, Input, Select, Switch, Row, Col, Tag, Descriptions, Divider } from 'antd';
import { GoogleOutlined, WindowsOutlined } from '@ant-design/icons';

const UserProfile = ({
  open,
  onClose,
  onSave,
  user = null,
  mode = 'view', // 'add', 'edit', 'view'
  isSuperAdmin = false
}) => {
  const [form] = Form.useForm();
  const isViewMode = mode === 'view';
  const isAddMode = mode === 'add';
  const isEditMode = mode === 'edit';

  useEffect(() => {
    if (user && open) {
      form.setFieldsValue({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phonePrefix: user.phonePrefix,
        phoneNumber: user.phoneNumber,
        role: user.role,
        active: user.active,
        locked: user.locked,
        verified: user.verified,
        ssoProvider: user.ssoProvider,
        mfaEnabled: user.mfaEnabled || false,
      });
    } else if (isAddMode && open) {
      form.resetFields();
      form.setFieldsValue({
        phonePrefix: '+1',
        role: 4, // Default to 'User' role
        active: true,
        locked: false,
        verified: false,
        ssoProvider: null,
        mfaEnabled: false,
      });
    }
  }, [user, open, isAddMode, form]);

  const handleOk = async () => {
    if (isViewMode) {
      onClose();
      return;
    }

    try {
      const values = await form.validateFields();
      onSave(values, user?.id);
      form.resetFields();
      onClose();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
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

  const getTitle = () => {
    if (isAddMode) return 'Add New User';
    if (isEditMode) return 'Edit User';
    return 'User Details';
  };

  if (isViewMode && user) {
    return (
      <Modal
        title={getTitle()}
        open={open}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Close"
        cancelButtonProps={{ style: { display: 'none' } }}
        width={700}
      >
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

        <Divider orientation="left" style={{ fontWeight: 'bold' }}>
          Roles & Permissions
        </Divider>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Role">
            {getRoleLabel(user.role)}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            {user.active ? (
              <Tag color="green">Active</Tag>
            ) : (
              <Tag color="red">Inactive</Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Account">
            {user.locked ? (
              <Tag color="red">Locked</Tag>
            ) : (
              <Tag color="green">Unlocked</Tag>
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
      </Modal>
    );
  }

  return (
    <Modal
      title={getTitle()}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      okText={isAddMode ? 'Add User' : 'Save Changes'}
      cancelText="Cancel"
      width={700}
    >
      <Form
        form={form}
        layout="vertical"
        name="userProfile"
      >
        <Divider orientation="left" style={{ fontWeight: 'bold', marginTop: 0 }}>
          User Information
        </Divider>

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
          <Input placeholder="user@example.com" disabled={isEditMode} />
        </Form.Item>

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

        <Divider orientation="left" style={{ fontWeight: 'bold' }}>
          Roles & Permissions
        </Divider>

        <Form.Item
          label="Role"
          name="role"
          rules={[{ required: true, message: 'Please select a role' }]}
        >
          <Select options={roleOptions} />
        </Form.Item>

        {!isSuperAdmin && (
          <div style={{
            background: '#fff3cd',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '16px',
            fontSize: '12px',
            color: '#856404'
          }}>
            <strong>Note:</strong> As a Platform Admin, you cannot assign Super Admin or Admin roles.
          </div>
        )}

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="Active"
              name="active"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Locked"
              name="locked"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Verified"
              name="verified"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left" style={{ fontWeight: 'bold' }}>
          MFA
        </Divider>

        <Form.Item
          label="SSO Provider"
          name="ssoProvider"
        >
          <Select options={ssoOptions} />
        </Form.Item>

        <Form.Item
          label="MFA Enabled"
          name="mfaEnabled"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UserProfile;
