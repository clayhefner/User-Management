import { Row, Col, Card, Statistic } from 'antd';
import { UserOutlined, TeamOutlined, CheckCircleOutlined, LockOutlined } from '@ant-design/icons';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const Dashboard = () => {
  // Sample data for user activity over time
  const activityData = [
    { month: 'Jan', active: 45, inactive: 8 },
    { month: 'Feb', active: 52, inactive: 12 },
    { month: 'Mar', active: 61, inactive: 9 },
    { month: 'Apr', active: 58, inactive: 15 },
    { month: 'May', active: 70, inactive: 10 },
    { month: 'Jun', active: 75, inactive: 8 },
    { month: 'Jul', active: 82, inactive: 11 },
  ];

  // Sample data for users by role
  const roleData = [
    { role: 'Super Admin', count: 2 },
    { role: 'Admin', count: 5 },
    { role: 'Manager', count: 8 },
    { role: 'User', count: 45 },
    { role: 'Viewer', count: 12 },
  ];

  // Sample data for pie chart
  const statusData = [
    { name: 'Active', value: 82 },
    { name: 'Inactive', value: 11 },
    { name: 'Locked', value: 7 },
  ];

  const COLORS = ['#52c41a', '#ff4d4f', '#faad14'];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Total Users"
              value={100}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#4013be' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Active Users"
              value={82}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Verified"
              value={93}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
              suffix="%"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Locked Out"
              value={7}
              prefix={<LockOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts Row 1 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card title="User Activity Trend" bordered>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="active"
                  stroke="#4013be"
                  strokeWidth={2}
                  name="Active Users"
                />
                <Line
                  type="monotone"
                  dataKey="inactive"
                  stroke="#ff4d4f"
                  strokeWidth={2}
                  name="Inactive Users"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="User Status Distribution" bordered>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Charts Row 2 */}
      <Row gutter={16}>
        <Col xs={24}>
          <Card title="Users by Role" bordered>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={roleData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="role" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#4013be" name="User Count" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
