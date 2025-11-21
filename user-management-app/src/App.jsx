import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Select, ConfigProvider } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  SettingOutlined,
  LogoutOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import UserProfilePage from './pages/UserProfilePage';
import './App.css';

const { Header, Sider, Content } = Layout;

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState('super_admin');

  const isSuperAdmin = userRole === 'super_admin';

  const currentPath = location.pathname;

  // Mock current user data - in a real app, this would come from auth context
  const currentUser = {
    firstName: 'John',
    lastName: 'Doe',
  };

  const getUserInitials = (firstName, lastName) => {
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    return firstInitial + lastInitial;
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => navigate('/profile'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
    },
  ];

  const sidebarMenuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    ...(userRole !== 'user' ? [{
      key: '/users',
      icon: <TeamOutlined />,
      label: 'Users',
    }] : []),
  ];

  const getSelectedKey = () => {
    if (currentPath.startsWith('/users')) {
      return ['/users'];
    }
    if (currentPath === '/' || currentPath.startsWith('/dashboard')) {
      return ['/dashboard'];
    }
    return [currentPath];
  };

  return (
    <Layout className="app-layout">
      <Sider
        className="menu-sidebar"
        width={256}
        theme="dark"
      >
        <div className="sidebar-logo">
          <h1>User Management</h1>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={getSelectedKey()}
          onClick={({ key }) => navigate(key)}
          items={sidebarMenuItems}
        />
      </Sider>
      <Layout className="main-layout">
        <Header style={{ padding: 0, background: '#f5f5f5' }}>
          <div className="app-header">
            <div></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div className="role-toggle">
                <span className="role-label" style={{ marginRight: '8px' }}>
                  Role (PoC):
                </span>
                <Select
                  value={userRole}
                  onChange={setUserRole}
                  style={{ width: 160 }}
                  options={[
                    { value: 'user', label: 'User' },
                    { value: 'platform_admin', label: 'Platform Admin' },
                    { value: 'super_admin', label: 'Super Admin' },
                  ]}
                />
              </div>
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <Avatar
                  src={localStorage.getItem(`avatar_user_3k4dqxwmjr858vzk8mqp4zyb59`)}
                  style={{
                    backgroundColor: '#4013be',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  {!localStorage.getItem(`avatar_user_3k4dqxwmjr858vzk8mqp4zyb59`) && getUserInitials(currentUser.firstName, currentUser.lastName)}
                </Avatar>
              </Dropdown>
            </div>
          </div>
        </Header>
        <Content>
          <div className="inner-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/users" element={<Users />} />
              <Route path="/users/new" element={<UserProfilePage mode="admin" userRole={userRole} />} />
              <Route path="/users/:userId" element={<UserProfilePage mode="admin" userRole={userRole} />} />
              <Route path="/profile" element={<UserProfilePage mode="self" userRole={userRole} />} />
            </Routes>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#4013be',
        },
      }}
    >
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
