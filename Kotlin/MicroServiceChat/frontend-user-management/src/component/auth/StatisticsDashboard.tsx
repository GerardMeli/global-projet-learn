import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import statisticsService from '../../service/statistics.service';
import type { UserStatisticsResponse, UserActivityResponse } from '../../type/statistics.types';
import { UserStatus } from '../../type/user.types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const StatisticsDashboard: React.FC = () => {
  const [statistics, setStatistics] = useState<UserStatisticsResponse | null>(null);
  const [activities, setActivities] = useState<UserActivityResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const [statsData, activityData] = await Promise.all([
        statisticsService.getUserStatistics(),
        statisticsService.getUserActivity(0, 10)
      ]);
      setStatistics(statsData);
      setActivities(activityData.content);
    } catch (err) {
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !statistics) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error || 'No data available'}
      </Alert>
    );
  }

  // Prepare data for charts
  const roleData = Object.entries(statistics.usersByRole).map(([name, value]) => ({
    name,
    value
  }));

  const languageData = Object.entries(statistics.usersByLanguage).map(([name, value]) => ({
    name,
    value
  }));

  const statusData = [
    { name: 'Active', value: statistics.activeUsers },
    { name: 'Pending', value: statistics.pendingVerification },
    { name: 'Suspended', value: statistics.suspendedUsers },
    { name: 'Blocked', value: statistics.blockedUsers },
    { name: 'Deleted', value: statistics.deletedUsers }
  ];

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Statistics Dashboard
      </Typography>

      {/* Summary Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)'
          },
          gap: 3,
          mb: 4
        }}
      >
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Users
            </Typography>
            <Typography variant="h4">
              {statistics.totalUsers}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Active Users
            </Typography>
            <Typography variant="h4" color="success.main">
              {statistics.activeUsers}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              New Users (7 days)
            </Typography>
            <Typography variant="h4" color="info.main">
              {statistics.newUsersLast7Days}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              New Users (30 days)
            </Typography>
            <Typography variant="h4" color="primary.main">
              {statistics.newUsersLast30Days}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Charts */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(2, 1fr)'
          },
          gap: 3
        }}
      >
        {/* Users by Role */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Users by Role
          </Typography>
          <Box sx={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={roleData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Paper>

        {/* Users by Status */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Users by Status
          </Typography>
          <Box sx={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>

        {/* Users by Language */}
        <Paper sx={{ p: 2, gridColumn: { xs: 'span 1', md: 'span 2' } }}>
          <Typography variant="h6" gutterBottom>
            Users by Language
          </Typography>
          <Box sx={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={languageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>

        {/* Recent Activity */}
        <Paper sx={{ p: 2, gridColumn: { xs: 'span 1', md: 'span 2' } }}>
          <Typography variant="h6" gutterBottom>
            Recent User Activity
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User ID</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Failed Attempts</TableCell>
                  <TableCell>Last Login</TableCell>
                  <TableCell>Active</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activities.map((activity) => (
                  <TableRow key={activity.userId}>
                    <TableCell>{activity.userId}</TableCell>
                    <TableCell>{activity.email}</TableCell>
                    <TableCell>
                      <Chip 
                        label={activity.status}
                        color={activity.status === UserStatus.ACTIVE ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={activity.failedLoginAttempts}
                        color={activity.failedLoginAttempts > 3 ? 'error' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {activity.lastLoginAt 
                        ? new Date(activity.lastLoginAt).toLocaleString()
                        : 'Never'
                      }
                    </TableCell>
                    <TableCell>
                      {activity.isActive ? 'Yes' : 'No'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </Box>
  );
};

export default StatisticsDashboard;