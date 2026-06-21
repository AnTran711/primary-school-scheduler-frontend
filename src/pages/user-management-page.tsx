import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  InputAdornment,
  TextField,
  Typography
} from '@mui/material';
import { AddOutlined, SearchOutlined } from '@mui/icons-material';
import { toast } from 'react-toastify';
import type { UserRecord } from '@/types/user';
import type { UserRole } from '@/types/auth';
import type { ColumnDef } from '@/components/ui/data-table';
import DataTable from '@/components/ui/data-table';
import DeleteDialog from '@/components/ui/delete-dialog';
import PageHeader from '@/components/ui/page-header';
import UserFormDialog from '@/components/ui/user-form-dialog';
import {
  createUserAPI,
  deleteUserAPI,
  fetchUsersAPI,
  updateUserAPI
} from '@/api/user.api';
import type { UserFormValues } from '@/schemas/user.schema';

// ─── Role helpers ─────────────────────────────────────────────────────────────
const roleLabelMap: Record<
  UserRole,
  { label: string; color: 'primary' | 'default' }
> = {
  ADMIN: { label: 'Admin', color: 'primary' },
  USER: { label: 'Người dùng', color: 'default' }
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const UserManagementPage = () => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchName, setSearchName] = useState('');

  // Form dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editTarget, setEditTarget] = useState<UserRecord | undefined>();

  // Delete dialog state
  const [deleteTarget, setDeleteTarget] = useState<UserRecord | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Columns
  const userColumns: ColumnDef<UserRecord>[] = [
    {
      key: 'username',
      label: 'Tên đăng nhập'
    },
    {
      key: 'roles',
      label: 'Vai trò',
      render: (row) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {row.roles.map((role) => (
            <Chip
              key={role}
              label={roleLabelMap[role]?.label ?? role}
              color={roleLabelMap[role]?.color ?? 'default'}
              size="small"
              variant="outlined"
            />
          ))}
        </Box>
      )
    }
  ];

  // Load users
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchUsersAPI();
        setUsers(res.data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // Filtered users
  const filteredUsers = useMemo(() => {
    if (!searchName.trim()) return users;
    return users.filter((u) =>
      u.username.toLowerCase().includes(searchName.toLowerCase())
    );
  }, [searchName, users]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleAdd = () => {
    setEditTarget(undefined);
    setFormOpen(true);
  };

  const handleEdit = (id: string) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;
    setEditTarget(user);
    setFormOpen(true);
  };

  const handleFormSubmit = async (values: UserFormValues) => {
    try {
      setFormLoading(true);
      if (editTarget) {
        const payload: {
          password: string;
        } = {
          password: values.password.trim()
        };
        const res = await updateUserAPI(editTarget.id, payload);
        setUsers((prev) =>
          prev.map((u) => (u.id === editTarget.id ? res.data : u))
        );
        toast.success(res.message || 'Cập nhật thành công');
      } else {
        // Create — password bắt buộc
        const res = await createUserAPI(values);
        setUsers((prev) => [...prev, res.data]);
        toast.success(res.message || 'Tạo tài khoản thành công');
      }
      setFormOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;
    setDeleteTarget(user);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      const res = await deleteUserAPI(deleteTarget.id);
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      toast.success(res.message || 'Xóa tài khoản thành công');
    } catch (error) {
      console.error(error);
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Typography sx={{ color: 'text.secondary' }}>
          Đang tải danh sách người dùng...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      <Box sx={{ flex: 1, overflowY: 'auto', px: 4, py: 3 }}>
        <PageHeader
          title="Quản lý người dùng"
          subtitle="Quản lý tài khoản người dùng của hệ thống"
          actions={
            <>
              {/* Search */}
              <TextField
                size="small"
                placeholder="Tìm theo tên đăng nhập"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchOutlined fontSize="small" />
                      </InputAdornment>
                    )
                  }
                }}
              />

              {/* Add button */}
              <Button
                variant="contained"
                startIcon={<AddOutlined />}
                onClick={handleAdd}
              >
                Thêm người dùng
              </Button>
            </>
          }
        />

        {/* Table */}
        <DataTable
          columns={userColumns}
          rows={filteredUsers}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Box>

      {/* User form dialog */}
      <UserFormDialog
        open={formOpen}
        editTarget={editTarget}
        loading={formLoading}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      {/* Delete dialog */}
      <DeleteDialog
        open={!!deleteTarget}
        description={
          deleteTarget ? `tài khoản "${deleteTarget.username}"` : undefined
        }
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
      />
    </Box>
  );
};

export default UserManagementPage;
