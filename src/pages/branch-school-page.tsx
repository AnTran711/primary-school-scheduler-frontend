import { useMemo, useState } from 'react';
import { SearchOutlined, AddOutlined } from '@mui/icons-material';
import { Box, Button, InputAdornment, TextField } from '@mui/material';
import type { ColumnDef } from '@/components/ui/data-table';
import DataTable from '@/components/ui/data-table';
import FormDialog, { type FieldDef } from '@/components/ui/form-dialog';
import { toast } from 'react-toastify';
import DeleteDialog from '@/components/ui/delete-dialog';
import {
  branchSchoolSchema,
  type BranchSchoolFormValues
} from '@/schemas/branch-school.schema';
import type { BranchSchool } from '@/types/branch-school';
import { useBranchSchoolStore } from '@/stores/branch-school-store';
import {
  createBranchSchoolAPI,
  deleteBranchSchoolAPI,
  updateBranchSchoolAPI
} from '@/api/branch-school.api';
import PageHeader from '@/components/ui/page-header';
import { removeVietnameseDiacritics } from '@/utils/search.util';

// ─── Main Branch School Page ─────────────────────────────────────────────────────────

const BranchSchoolPage = () => {
  const [searchName, setSearchName] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editTarget, setEditTarget] = useState<
    BranchSchoolFormValues | undefined
  >();
  const [editId, setEditId] = useState<string | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<BranchSchool | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const branchSchools = useBranchSchoolStore((state) => state.branchSchools);

  const branchSchoolColumns: ColumnDef<BranchSchool>[] = [
    {
      key: 'name',
      label: 'Tên điểm trường'
    }
  ];

  const branchSchoolFields: FieldDef<BranchSchoolFormValues>[] = [
    {
      key: 'name',
      label: 'Tên điểm trường',
      type: 'text'
    }
  ];

  // Bật form dialog để thêm mới (form rỗng)
  const handleAdd = () => {
    setEditTarget(undefined); // form rỗng
    setOpen(true);
  };

  // Bật form dialog để chỉnh sửa, điền sẵn data cũ vào form
  const handleEdit = (id: string) => {
    const branchSchool = branchSchools.find((bs) => bs.id === id);
    if (!branchSchool) return;

    setEditTarget(branchSchool); // điền form sẵn dữ liệu cũ
    setEditId(id);

    setOpen(true);
  };

  // Mở dialog xác nhận xoá
  const handleDelete = (id: string) => {
    const branchSchool = branchSchools.find((bs) => bs.id === id);

    if (!branchSchool) return;
    setDeleteTarget(branchSchool);
  };

  // Gọi API xoá, cập nhật lại state, đóng dialog
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      const res = await deleteBranchSchoolAPI(deleteTarget.id);

      toast.success(res.message);

      const updatedBranchSchools = branchSchools.filter(
        (branchSchool) => branchSchool.id !== deleteTarget.id
      );
      useBranchSchoolStore.getState().setBranchSchools(updatedBranchSchools);
    } catch (error) {
      console.error(error);
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  // Gọi API tạo mới hoặc cập nhật, cập nhật lại state, đóng dialog
  const handleSubmit = async (values: BranchSchoolFormValues) => {
    try {
      let res;
      setLoading(true);
      if (editTarget && editId) {
        res = await updateBranchSchoolAPI(editId, values);
        const updatedBranchSchool = res.data;

        const updatedBranchSchools = branchSchools.map((branchSchool) =>
          branchSchool.id === editId ? updatedBranchSchool : branchSchool
        );

        useBranchSchoolStore.getState().setBranchSchools(updatedBranchSchools);
      } else {
        res = await createBranchSchoolAPI(values);
        const newBranchSchool = res.data;

        const newBranchSchools = [...branchSchools, newBranchSchool];

        useBranchSchoolStore.getState().setBranchSchools(newBranchSchools);
      }
      console.log('API response', res);
      toast.success(res.message);
      setOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Tìm kiếm theo tên (client-side, filter trên state đã có)
  const filteredBranchSchools = useMemo(() => {
    if (searchName.trim() === '') return branchSchools;
    const normalizedSearch = removeVietnameseDiacritics(searchName.toLowerCase());
    return branchSchools.filter((branchSchool) =>
      removeVietnameseDiacritics(branchSchool.name.toLowerCase()).includes(normalizedSearch)
    );
  }, [searchName, branchSchools]);

  return (
    <Box sx={{ display: 'flex', flex: 1, flexDirection: 'column', overflow: 'hidden' }}>
      {/* Page content */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 4, py: 3 }}>
        <PageHeader
          title="Quản lý điểm trường"
          subtitle="Quản lý danh sách các điểm trường trong hệ thống"
          actions={
            <>
              {/* Search by name */}
              <TextField
                size="small"
                placeholder="Tìm kiếm theo tên"
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
                Thêm điểm trường
              </Button>
            </>
          }
        />

        {/* Table */}
        <DataTable
          columns={branchSchoolColumns}
          rows={filteredBranchSchools}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Box>

      <FormDialog<BranchSchoolFormValues>
        open={open}
        title={editTarget ? 'Chỉnh sửa điểm trường' : 'Thêm điểm trường mới'}
        fields={branchSchoolFields}
        schema={branchSchoolSchema}
        initialValues={editTarget}
        onSubmit={handleSubmit}
        onClose={() => setOpen(false)}
        loading={loading}
      />

      <DeleteDialog
        open={!!deleteTarget}
        description={deleteTarget?.name}
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
      />
    </Box>
  );
};

export default BranchSchoolPage;
