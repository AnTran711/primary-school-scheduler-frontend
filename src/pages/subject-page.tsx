import { useMemo, useState } from 'react';
import { SearchOutlined, AddOutlined } from '@mui/icons-material';
import { Box, Button, InputAdornment, TextField } from '@mui/material';
import type { ColumnDef } from '@/components/ui/data-table';
import DataTable from '@/components/ui/data-table';
import FormDialog, { type FieldDef } from '@/components/ui/form-dialog';
import { toast } from 'react-toastify';
import DeleteDialog from '@/components/ui/delete-dialog';
import {
  subjectSchema,
  type SubjectFormValues
} from '@/schemas/subject.schema';
import type { Subject } from '@/types/subject';
import { useSubjectStore } from '@/stores/subject-store';
import {
  createSubjectAPI,
  deleteSubjectAPI,
  updateSubjectAPI
} from '@/api/subject.api';
import PageHeader from '@/components/ui/page-header';
import { removeVietnameseDiacritics } from '@/utils/search.util';

// ─── Main Subject Page ─────────────────────────────────────────────────────────

const SubjectPage = () => {
  const [searchName, setSearchName] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editTarget, setEditTarget] = useState<SubjectFormValues | undefined>();
  const [editId, setEditId] = useState<string | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Subject | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const subjects = useSubjectStore((state) => state.subjects);

  const subjectColumns: ColumnDef<Subject>[] = [
    {
      key: 'name',
      label: 'Tên môn học'
    }
  ];

  const subjectFields: FieldDef<SubjectFormValues>[] = [
    {
      key: 'name',
      label: 'Tên môn học',
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
    const subject = subjects.find((s) => s.id === id);
    if (!subject) return;

    setEditTarget(subject); // điền form sẵn dữ liệu cũ
    setEditId(id);

    setOpen(true);
  };

  // Mở dialog xác nhận xoá
  const handleDelete = (id: string) => {
    const subject = subjects.find((s) => s.id === id);

    if (!subject) return;
    setDeleteTarget(subject);
  };

  // Gọi API xoá, cập nhật lại state, đóng dialog
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      const res = await deleteSubjectAPI(deleteTarget.id);

      toast.success(res.message);

      const updatedSubjects = subjects.filter(
        (subject) => subject.id !== deleteTarget.id
      );
      useSubjectStore.getState().setSubjects(updatedSubjects);
    } catch (error) {
      console.error(error);
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  // Gọi API tạo mới hoặc cập nhật, cập nhật lại state, đóng dialog
  const handleSubmit = async (values: SubjectFormValues) => {
    try {
      let res;
      setLoading(true);
      if (editTarget && editId) {
        res = await updateSubjectAPI(editId, values);
        const updatedSubject = res.data;

        const updatedSubjects = subjects.map((subject) =>
          subject.id === editId ? updatedSubject : subject
        );

        useSubjectStore.getState().setSubjects(updatedSubjects);
      } else {
        res = await createSubjectAPI(values);
        const newSubject = res.data;

        const newSubjects = [...subjects, newSubject];

        useSubjectStore.getState().setSubjects(newSubjects);
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
  const filteredSubjects = useMemo(() => {
    if (searchName.trim() === '') return subjects;
    const normalizedSearch = removeVietnameseDiacritics(searchName.toLowerCase());
    return subjects.filter((subject) =>
      removeVietnameseDiacritics(subject.name.toLowerCase()).includes(normalizedSearch)
    );
  }, [searchName, subjects]);

  return (
    <Box sx={{ display: 'flex', flex: 1, flexDirection: 'column', overflow: 'hidden' }}>
      {/* Page content */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 4, py: 3 }}>
        <PageHeader
          title="Quản lý môn học"
          subtitle="Quản lý danh sách các môn học trong chương trình giảng dạy"
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
                Thêm môn học
              </Button>
            </>
          }
        />

        {/* Table */}
        <DataTable
          columns={subjectColumns}
          rows={filteredSubjects}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Box>

      <FormDialog<SubjectFormValues>
        open={open}
        title={editTarget ? 'Chỉnh sửa môn học' : 'Thêm môn học mới'}
        fields={subjectFields}
        schema={subjectSchema}
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

export default SubjectPage;
