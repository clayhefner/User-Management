import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Button,
  Tag,
  Space,
  Tooltip,
  Dropdown,
  message,
  Input,
  Switch,
  Skeleton,
  Popover,
  Checkbox,
  Avatar,
  Modal,
  Form,
  Select,
  Row,
  Col,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  UnlockOutlined,
  MailOutlined,
  UserAddOutlined,
  CheckCircleOutlined,
  StopOutlined,
  SearchOutlined,
  FilterOutlined,
  SafetyOutlined,
  SafetyCertificateFilled,
  CheckCircleFilled,
  CloseCircleFilled,
  WarningFilled,
  ExclamationCircleFilled,
  ExperimentOutlined,
} from "@ant-design/icons";
import { mockUsers } from "../data/mockUsers";

const Users = ({ userRole }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({
    verified: [],
    mfa: [],
    access: [],
    role: [],
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addUserForm] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: "",
    content: "",
    action: null,
  });
  const [testModeOnly, setTestModeOnly] = useState(false);

  const isSuperAdmin = userRole === "super_admin";

  const getUserInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  const getRoleLabel = (roleNumber) => {
    const roleMap = {
      1: "Super Admin",
      2: "Admin",
      3: "Manager",
      4: "User",
      5: "Viewer",
    };
    return roleMap[roleNumber] || "Unknown";
  };

  const getRoleColor = (roleNumber) => {
    const colorMap = {
      1: "red",
      2: "orange",
      3: "blue",
      4: "green",
      5: "default",
    };
    return colorMap[roleNumber] || "default";
  };

  const getAccessTag = (user) => {
    if (user.active) {
      return <Tag color="green">Enabled</Tag>;
    }
    return <Tag color="red">Disabled</Tag>;
  };

  const handleAddUser = () => {
    setTestModeOnly(false); // Default to Test and Live
    setIsAddModalOpen(true);
  };

  const handleAddUserSubmit = async () => {
    try {
      const values = await addUserForm.validateFields();
      console.log("New user data:", values);
      message.success(
        `User ${values.firstName} ${values.lastName} has been added successfully`
      );
      setIsAddModalOpen(false);
      addUserForm.resetFields();
      // In a real app, you would call an API to create the user
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handleAddModalCancel = () => {
    setIsAddModalOpen(false);
    addUserForm.resetFields();
    setTestModeOnly(false);
  };

  const handleEditUser = (user) => {
    navigate(`/users/${user.id}?mode=edit`);
  };

  const handleLockToggle = (user) => {
    message.success(
      `Security lockout reset for: ${user.firstName} ${user.lastName}`
    );
    console.log("Reset lockout for user:", user.id);
    // In a real app, you would reset the user's failed login attempts and unlock their account
  };

  const handleAccessToggle = (user) => {
    message.info(
      `${user.active ? "Disabling" : "Enabling"} dashboard access for: ${
        user.firstName
      } ${user.lastName}`
    );
    console.log(
      user.active ? "Disable" : "Enable",
      "dashboard access for",
      user.id
    );
    // In a real app, you would update the user's active status here
  };

  const handleDeleteUser = (user) => {
    message.warning(`Delete user: ${user.firstName} ${user.lastName}`);
    console.log("Delete", user.id);
    // In a real app, you would show a confirmation dialog and delete the user
  };

  const handleResendVerification = (user) => {
    message.success(`Verification email sent to ${user.email}`);
    console.log("Resend verification email to:", user.id, user.email);
    // In a real app, you would call an API to resend the verification email
  };

  const handleAccessToggleInline = (user, checked) => {
    message.info(
      `${checked ? "Enabling" : "Disabling"} dashboard access for: ${
        user.firstName
      } ${user.lastName}`
    );
    // In a real app, you would update the user's active status here
  };

  const handleResetMFA = (user) => {
    const config = {
      title: "Reset Multi-Factor Authentication",
      content: `Are you sure you want to reset MFA for ${user.firstName} ${user.lastName}? This will remove their current MFA setup and require them to set it up again on their next login.`,
      action: () => {
        message.success("MFA reset successfully!");
        console.log("AUDIT: Super Admin reset MFA for user", user.id);
      },
    };
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

  // Simulate loading data
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setFilteredData(mockUsers);
      setLoading(false);
    }, 500);
  }, []); // Load user data

  // Apply search and filters
  useEffect(() => {
    let filtered = [...mockUsers];

    // Search filter
    if (searchText) {
      filtered = filtered.filter((user) =>
        user.lastName.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Verification filter
    if (filters.verified.length > 0) {
      filtered = filtered.filter((user) =>
        filters.verified.includes(user.verified)
      );
    }

    // MFA filter
    if (filters.mfa.length > 0) {
      filtered = filtered.filter((user) =>
        filters.mfa.includes(user.mfaEnabled || false)
      );
    }

    // Access filter
    if (filters.access.length > 0) {
      filtered = filtered.filter((user) =>
        filters.access.includes(user.active)
      );
    }

    // Role filter
    if (filters.role.length > 0) {
      filtered = filtered.filter((user) => filters.role.includes(user.role));
    }

    setFilteredData(filtered);
  }, [searchText, filters]);

  const handleFilterChange = (filterType, value, checked) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      if (checked) {
        newFilters[filterType] = [...prev[filterType], value];
      } else {
        newFilters[filterType] = prev[filterType].filter((v) => v !== value);
      }
      return newFilters;
    });
  };

  const clearFilters = () => {
    setFilters({
      verified: [],
      mfa: [],
      access: [],
      role: [],
    });
  };

  const hasActiveFilters = Object.values(filters).some((f) => f.length > 0);

  const columns = [
    {
      title: "User",
      key: "user",
      fixed: "left",
      width: 280,
      render: (_, record) => {
        const avatarUrl = localStorage.getItem(`avatar_${record.id}`);
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Avatar
              size={40}
              src={avatarUrl}
              style={{
                backgroundColor: "#4013be",
                fontSize: "16px",
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              {!avatarUrl && getUserInitials(record.firstName, record.lastName)}
            </Avatar>
            <div
              style={{
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              <div style={{ fontWeight: 500 }}>
                {record.firstName} {record.lastName}
              </div>
              <div style={{ fontSize: "13px", color: "#8c8c8c" }}>
                {record.email}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Role & Access",
      key: "role",
      width: 160,
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontWeight: 500 }}>{getRoleLabel(record.role)}</span>
          {record.testModeOnly && (
            <Tooltip title="Test Mode Only - Cannot access live mode">
              <ExperimentOutlined
                style={{ color: "#722ed1", fontSize: "16px" }}
              />
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      title: "Last Login",
      key: "lastLogin",
      width: 150,
      render: (_, record) => {
        if (record.lastLogin) {
          return new Date(record.lastLogin).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
        }
        return <span style={{ color: "#8c8c8c" }}>Never</span>;
      },
    },
    {
      title: "Status",
      key: "access",
      width: 160,
      render: (_, record) => {
        // If active is false, always show Inactive
        if (!record.active) {
          return <Tag color="red">Inactive</Tag>;
        }

        // If active is true but not verified, show Invited
        if (record.active && !record.verified) {
          return <Tag color="orange">Invited</Tag>;
        }

        // If active is true and verified is true, show Active
        return <Tag color="green">Active</Tag>;
      },
    },
    {
      title: "MFA",
      key: "mfa",
      width: 100,
      render: (_, record) => {
        if (record.mfaEnabled) {
          return (
            <SafetyCertificateFilled
              style={{ color: "#52c41a", fontSize: "18px" }}
            />
          );
        }
        return (
          <CloseCircleFilled style={{ color: "#d9d9d9", fontSize: "18px" }} />
        );
      },
    },
    {
      title: "Alerts",
      key: "alerts",
      width: 100,
      render: (_, record) => {
        const alerts = [];

        // Critical: Security Lock Out
        if (record.locked) {
          alerts.push(
            <Tooltip key="locked" title="Security Lock Out">
              <ExclamationCircleFilled
                style={{ color: "#ff4d4f", fontSize: "18px" }}
              />
            </Tooltip>
          );
        }

        // Critical: Expired Password
        if (record.passwordExpiration) {
          const expirationDate = new Date(record.passwordExpiration);
          const today = new Date();
          if (expirationDate < today) {
            alerts.push(
              <Tooltip key="expired" title="Password Expired">
                <ExclamationCircleFilled
                  style={{ color: "#ff4d4f", fontSize: "18px" }}
                />
              </Tooltip>
            );
          }
        }

        if (alerts.length === 0) {
          return <span style={{ color: "#d9d9d9" }}>—</span>;
        }

        return (
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {alerts}
          </div>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 120,
      render: (_, record) => {
        const menuItems = [
          ...(!record.verified
            ? [
                {
                  key: "resend",
                  icon: <MailOutlined />,
                  label: "Resend Verification Email",
                  onClick: () => handleResendVerification(record),
                },
              ]
            : []),
          {
            key: "access",
            icon: record.active ? <StopOutlined /> : <CheckCircleOutlined />,
            label: record.active
              ? "Disable Dashboard Access"
              : "Enable Dashboard Access",
            onClick: () => handleAccessToggle(record),
          },
          ...(record.locked
            ? [
                {
                  key: "unlock",
                  icon: <UnlockOutlined />,
                  label: "Reset User Lockout",
                  onClick: () => handleLockToggle(record),
                },
              ]
            : []),
          ...(isSuperAdmin && record.mfaEnabled
            ? [
                {
                  key: "resetMFA",
                  icon: <SafetyOutlined />,
                  label: "Reset MFA",
                  danger: true,
                  onClick: () => handleResetMFA(record),
                },
              ]
            : []),
          {
            key: "delete",
            icon: <DeleteOutlined />,
            label: "Delete User",
            danger: true,
            onClick: () => handleDeleteUser(record),
          },
        ];

        return (
          <Dropdown.Button
            size="small"
            type="primary"
            icon={<span className="vertical-dots">⋮</span>}
            menu={{ items: menuItems }}
            onClick={() => handleEditUser(record)}
          >
            <EditOutlined /> Edit
          </Dropdown.Button>
        );
      },
    },
  ];

  const filterContent = (
    <div style={{ width: 280 }}>
      <div style={{ marginBottom: 16 }}>
        <strong>Role</strong>
        <div style={{ marginTop: 8 }}>
          <Checkbox
            checked={filters.role.includes(1)}
            onChange={(e) => handleFilterChange("role", 1, e.target.checked)}
          >
            Super Admin
          </Checkbox>
          <br />
          <Checkbox
            checked={filters.role.includes(2)}
            onChange={(e) => handleFilterChange("role", 2, e.target.checked)}
          >
            Admin
          </Checkbox>
          <br />
          <Checkbox
            checked={filters.role.includes(3)}
            onChange={(e) => handleFilterChange("role", 3, e.target.checked)}
          >
            Manager
          </Checkbox>
          <br />
          <Checkbox
            checked={filters.role.includes(4)}
            onChange={(e) => handleFilterChange("role", 4, e.target.checked)}
          >
            User
          </Checkbox>
          <br />
          <Checkbox
            checked={filters.role.includes(5)}
            onChange={(e) => handleFilterChange("role", 5, e.target.checked)}
          >
            Viewer
          </Checkbox>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <strong>Verification</strong>
        <div style={{ marginTop: 8 }}>
          <Checkbox
            checked={filters.verified.includes(true)}
            onChange={(e) =>
              handleFilterChange("verified", true, e.target.checked)
            }
          >
            Verified
          </Checkbox>
          <br />
          <Checkbox
            checked={filters.verified.includes(false)}
            onChange={(e) =>
              handleFilterChange("verified", false, e.target.checked)
            }
          >
            Pending
          </Checkbox>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <strong>MFA</strong>
        <div style={{ marginTop: 8 }}>
          <Checkbox
            checked={filters.mfa.includes(true)}
            onChange={(e) => handleFilterChange("mfa", true, e.target.checked)}
          >
            Enabled
          </Checkbox>
          <br />
          <Checkbox
            checked={filters.mfa.includes(false)}
            onChange={(e) => handleFilterChange("mfa", false, e.target.checked)}
          >
            Disabled
          </Checkbox>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <strong>Dashboard Access</strong>
        <div style={{ marginTop: 8 }}>
          <Checkbox
            checked={filters.access.includes(true)}
            onChange={(e) =>
              handleFilterChange("access", true, e.target.checked)
            }
          >
            Enabled
          </Checkbox>
          <br />
          <Checkbox
            checked={filters.access.includes(false)}
            onChange={(e) =>
              handleFilterChange("access", false, e.target.checked)
            }
          >
            Disabled
          </Checkbox>
        </div>
      </div>

      {hasActiveFilters && (
        <Button size="small" onClick={clearFilters} block>
          Clear All Filters
        </Button>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <Skeleton.Input style={{ width: 200 }} active />
          <Skeleton.Button active />
        </div>
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>User Management</h1>
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          onClick={handleAddUser}
        >
          Add User
        </Button>
      </div>

      <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
        <Input
          placeholder="Search by last name..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ flex: 1, maxWidth: 400 }}
          allowClear
        />
        <Popover
          content={filterContent}
          title="Filters"
          trigger="click"
          placement="bottomLeft"
        >
          <Button icon={<FilterOutlined />}>
            Filters{" "}
            {hasActiveFilters && `(${Object.values(filters).flat().length})`}
          </Button>
        </Popover>
      </div>

      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} users`,
        }}
        scroll={{ x: "max-content" }}
        className="no-wrap-table"
      />

      <Modal
        title="Add New User"
        open={isAddModalOpen}
        onOk={handleAddUserSubmit}
        onCancel={handleAddModalCancel}
        okText="Add User"
        cancelText="Cancel"
        width={500}
      >
        <Form form={addUserForm} layout="vertical" style={{ marginTop: 24 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="firstName"
                label="First Name"
                rules={[
                  { required: true, message: "Please enter first name" },
                  {
                    max: 50,
                    message: "First name must be less than 50 characters",
                  },
                ]}
              >
                <Input placeholder="Enter first name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastName"
                label="Last Name"
                rules={[
                  { required: true, message: "Please enter last name" },
                  {
                    max: 50,
                    message: "Last name must be less than 50 characters",
                  },
                ]}
              >
                <Input placeholder="Enter last name" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please enter email address" },
              { type: "email", message: "Please enter a valid email address" },
            ]}
          >
            <Input placeholder="Enter email address" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: "Please select a role" }]}
          >
            <Select placeholder="Select role">
              <Select.Option value={1}>Super Admin</Select.Option>
              <Select.Option value={2}>Admin</Select.Option>
              <Select.Option value={3}>Manager</Select.Option>
              <Select.Option value={4}>User</Select.Option>
              <Select.Option value={5}>Viewer</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="testModeOnly"
            label="Mode Access"
            valuePropName="checked"
            initialValue={false}
          >
            <Switch
              checkedChildren="Test Only"
              unCheckedChildren="Test and Live"
              onChange={(checked) => setTestModeOnly(checked)}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        title={modalConfig.title}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Confirm"
        cancelText="Cancel"
        icon={<ExclamationCircleFilled />}
      >
        <p>{modalConfig.content}</p>
      </Modal>
    </div>
  );
};

export default Users;
