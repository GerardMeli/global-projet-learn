import React, { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  TextField,
  Box,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Typography
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material'; 
import adminService from '../../service/admin.service';
import type { AdminUserResponse, UserStatusUpdateRequest, UserRoleUpdateRequest } from '../../type/admin.types';
import { UserRole, UserStatus } from '../../type/user.types';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUserResponse | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState<UserStatusUpdateRequest>({
    status: UserStatus.ACTIVE,
    reason: ''
  });
  const [roleUpdate, setRoleUpdate] = useState<UserRoleUpdateRequest>({
    role: UserRole.USER,
    reason: ''
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, [page, rowsPerPage]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllUsers(page, rowsPerPage);
      setUsers(data.content);
      setTotalElements(data.totalElements);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const data = await adminService.searchUsers(
        { email: searchTerm, firstName: searchTerm, lastName: searchTerm },
        page,
        rowsPerPage
      );
      setUsers(data.content);
      setTotalElements(data.totalElements);
    } catch (err) {
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedUser) return;
    try {
      await adminService.updateUserStatus(selectedUser.id, statusUpdate);
      loadUsers();
      setStatusDialogOpen(false);
    } catch (err) {
      setError('Failed to update status');
    }
  };

  const handleRoleUpdate = async () => {
    if (!selectedUser) return;
    try {
      await adminService.updateUserRole(selectedUser.id, roleUpdate);
      loadUsers();
      setRoleDialogOpen(false);
    } catch (err) {
      setError('Failed to update role');
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      await adminService.deleteUser(selectedUser.id);
      loadUsers();
      setDeleteDialogOpen(false);
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case UserStatus.ACTIVE:
        return 'success';
      case UserStatus.INACTIVE:
        return 'warning';
      case UserStatus.SUSPENDED:
      case UserStatus.BLOCKED:
        return 'error';
      case UserStatus.PENDING_VERIFICATION:
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ p: 2, display: 'flex', gap: 2 }}>
        <TextField
          size="small"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button variant="contained" onClick={handleSearch}>
          Search
        </Button>
      </Box>

      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Verified</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {user.firstName} {user.lastName}
                </TableCell>
                <TableCell>
                  <Chip label={user.role} size="small" />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={user.status} 
                    color={getStatusColor(user.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {user.emailVerified ? 'Yes' : 'No'}
                </TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <IconButton 
                    size="small" 
                    onClick={() => {
                      setSelectedUser(user);
                      setStatusDialogOpen(true);
                    }}
                  >
                    <BlockIcon />
                  </IconButton>
                  <IconButton 
                    size="small"
                    onClick={() => {
                      setSelectedUser(user);
                      setRoleDialogOpen(true);
                    }}
                  >
                    <AdminIcon />
                  </IconButton>
                  <IconButton 
                    size="small"
                    onClick={() => {
                      setSelectedUser(user);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={totalElements}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
      />

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)}>
        <DialogTitle>Update User Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select
              value={statusUpdate.status}
              onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value as UserStatus })}
            >
              {Object.values(UserStatus).map((status) => (
                <MenuItem key={status} value={status}>{status}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            margin="normal"
            label="Reason"
            multiline
            rows={3}
            value={statusUpdate.reason}
            onChange={(e) => setStatusUpdate({ ...statusUpdate, reason: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleStatusUpdate} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>

      {/* Role Update Dialog */}
      <Dialog open={roleDialogOpen} onClose={() => setRoleDialogOpen(false)}>
        <DialogTitle>Update User Role</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select
              value={roleUpdate.role}
              onChange={(e) => setRoleUpdate({ ...roleUpdate, role: e.target.value as UserRole })}
            >
              {Object.values(UserRole).map((role) => (
                <MenuItem key={role} value={role}>{role}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            margin="normal"
            label="Reason"
            multiline
            rows={3}
            value={roleUpdate.reason}
            onChange={(e) => setRoleUpdate({ ...roleUpdate, reason: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRoleUpdate} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete user {selectedUser?.email}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default UserManagement;