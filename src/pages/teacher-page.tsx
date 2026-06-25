import { useMemo, useState } from 'react';
import { SearchOutlined, AddOutlined } from '@mui/icons-material';
import { Box, Button, InputAdornment, TextField } from '@mui/material';
import type { Teacher } from '@/types/teacher';
import type { ColumnDef } from '@/components/ui/data-table';
import DataTable from '@/components/ui/data-table';
import FormDialog, { type FieldDef } from '@/components/ui/form-dialog';
import {
  teacherSchema,
  type TeacherFormValues
} from '@/schemas/teacher.schema';
import { useTeacherStore } from '@/stores/teacher-store';
import {
  createTeacherAPI,
  deleteTeacherAPI,
  updateTeacherAPI
} from '@/api/teacher.api';
import { toast } from 'react-toastify';
import DeleteDialog from '@/components/ui/delete-dialog';
import PageHeader from '@/components/ui/page-header';
import { removeVietnameseDiacritics } from '@/utils/search.util';

// ─── Main Teacher Page ─────────────────────────────────────────────────────────

const TeacherPage = () => {
  const [searchName, setSearchName] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editTarget, setEditTarget] = useState<TeacherFormValues | undefined>();
  const [editId, setEditId] = useState<string | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Teacher | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const teachers = useTeacherStore((state) => state.teachers);

  const teacherColumns: ColumnDef<Teacher>[] = [
    {
      key: 'name',
      label: 'Tên giáo viên'
    },
    {
      key: 'numberOfLessonsPerWeek',
      label: 'Số tiết mỗi tuần',
      align: 'center'
    }
  ];

  const teacherFields: FieldDef<TeacherFormValues>[] = [
    {
      key: 'name',
      label: 'Tên giáo viên',
      type: 'text'
    },
    {
      key: 'numberOfLessonsPerWeek',
      label: 'Số tiết mỗi tuần',
      type: 'number'
    }
  ];

  // Bật form dialog để thêm mới (form rỗng)
  const handleAdd = () => {
    setEditTarget(undefined); // form rỗng
    setOpen(true);
  };

  // Bật form dialog để chỉnh sửa, điền sẵn data cũ vào form
  const handleEdit = (id: string) => {
    const teacher = teachers.find((t) => t.id === id);
    if (!teacher) return;

    setEditTarget(teacher); // điền form sẵn dữ liệu cũ
    setEditId(id);

    setOpen(true);
  };

  // Mở dialog xác nhận xoá
  const handleDelete = (id: string) => {
    const teacher = teachers.find((t) => t.id === id);

    if (!teacher) return;
    setDeleteTarget(teacher);
  };

  // Gọi API xoá, cập nhật lại state, đóng dialog
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      const res = await deleteTeacherAPI(deleteTarget.id);

      toast.success(res.message);

      const updatedTeachers = teachers.filter(
        (teacher) => teacher.id !== deleteTarget.id
      );
      useTeacherStore.getState().setTeachers(updatedTeachers);
    } catch (error) {
      console.error(error);
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  // Gọi API tạo mới hoặc cập nhật, cập nhật lại state, đóng dialog
  const handleSubmit = async (values: TeacherFormValues) => {
    try {
      let res;
      setLoading(true);
      if (editTarget && editId) {
        res = await updateTeacherAPI(editId, values);
        const updatedTeacher = res.data;

        const updatedTeachers = teachers.map((teacher) =>
          teacher.id === editId ? updatedTeacher : teacher
        );

        useTeacherStore.getState().setTeachers(updatedTeachers);
      } else {
        res = await createTeacherAPI(values);
        const newTeacher = res.data;

        const newTeachers = [...teachers, newTeacher];

        useTeacherStore.getState().setTeachers(newTeachers);
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

  // Tìm kiếm theo tên (client-side, filter trên state đã có, hỗ trợ không dấu)
  const filteredTeachers = useMemo(() => {
    if (searchName.trim() === '') return teachers;
    const normalizedSearch = removeVietnameseDiacritics(searchName.toLowerCase());
    return teachers.filter((teacher) =>
      removeVietnameseDiacritics(teacher.name.toLowerCase()).includes(normalizedSearch)
    );
  }, [searchName, teachers]);

  return (
    <Box sx={{ display: 'flex', flex: 1, flexDirection: 'column', overflow: 'hidden' }}>
      {/* Page content */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 4, py: 3 }}>
        <PageHeader
          title="Quản lý giáo viên"
          subtitle="Quản lý danh sách giáo viên và số tiết dạy mỗi tuần"
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
                Thêm giáo viên
              </Button>
            </>
          }
        />

        {/* Table */}
        <DataTable
          columns={teacherColumns}
          rows={filteredTeachers}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Box>

      <FormDialog<TeacherFormValues>
        open={open}
        title={editTarget ? 'Chỉnh sửa giáo viên' : 'Thêm giáo viên mới'}
        fields={teacherFields}
        schema={teacherSchema}
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

export default TeacherPage;
