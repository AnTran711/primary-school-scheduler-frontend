import { useMemo, useState } from 'react';
import { SearchOutlined, AddOutlined } from '@mui/icons-material';
import { Button, InputAdornment, MenuItem, TextField } from '@mui/material';
import type { ColumnDef } from '@/components/ui/data-table';
import DataTable from '@/components/ui/data-table';
import FormDialog, { type FieldDef } from '@/components/ui/form-dialog';
import { toast } from 'react-toastify';
import DeleteDialog from '@/components/ui/delete-dialog';
import {
  schoolClassSchema,
  type SchoolClassFormValues
} from '@/schemas/school-class.schema';
import type { SchoolClass } from '@/types/school-class';
import { useSchoolClassStore } from '@/stores/school-class-store';
import {
  createSchoolClassAPI,
  deleteSchoolClassAPI,
  updateSchoolClassAPI
} from '@/api/school-class.api';
import { useBranchSchoolStore } from '@/stores/branch-school-store';
import { useTeacherStore } from '@/stores/teacher-store';

// ─── Main School Class Page ─────────────────────────────────────────────────────────

const SchoolClassPage = () => {
  const [searchName, setSearchName] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editTarget, setEditTarget] = useState<
    SchoolClassFormValues | undefined
  >();
  const [editId, setEditId] = useState<string | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<SchoolClass | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const schoolClasses = useSchoolClassStore((state) => state.schoolClasses);
  const branchSchools = useBranchSchoolStore((state) => state.branchSchools);
  const teachers = useTeacherStore((state) => state.teachers);

  // State để lưu id điểm trường đang được chọn trong filter
  const [selectedBranchSchoolId, setSelectedBranchSchoolId] = useState('all');

  const branchSchoolOptions = useMemo(
    () => branchSchools.map((bs) => ({ label: bs.name, value: bs.id })),
    [branchSchools]
  );

  const teacherOptions = useMemo(
    () => teachers.map((t) => ({ label: t.name, value: t.id })),
    [teachers]
  );

  const schoolClassColumns: ColumnDef<SchoolClass>[] = [
    {
      key: 'name',
      label: 'Tên lớp học'
    },
    {
      key: 'branchSchoolName',
      label: 'Tên điểm trường'
    },
    {
      key: 'homeroomTeacherName',
      label: 'Tên giáo viên chủ nhiệm'
    }
  ];

  const schoolClassFields: FieldDef<SchoolClassFormValues>[] = [
    {
      key: 'name',
      label: 'Tên lớp học',
      type: 'text'
    },
    {
      key: 'branchSchoolId',
      label: 'Tên điểm trường',
      type: 'select',
      options: branchSchoolOptions
    },
    {
      key: 'homeroomTeacherId',
      label: 'Tên giáo viên chủ nhiệm',
      type: 'select',
      options: teacherOptions
    }
  ];

  // Bật form dialog để thêm mới (form rỗng)
  const handleAdd = () => {
    setEditTarget(undefined); // form rỗng
    setOpen(true);
  };

  // Bật form dialog để chỉnh sửa, điền sẵn data cũ vào form
  const handleEdit = (id: string) => {
    const schoolClass = schoolClasses.find((sc) => sc.id === id);
    if (!schoolClass) return;

    setEditTarget(schoolClass); // điền form sẵn dữ liệu cũ
    setEditId(id);

    setOpen(true);
  };

  // Mở dialog xác nhận xoá
  const handleDelete = (id: string) => {
    const schoolClass = schoolClasses.find((sc) => sc.id === id);

    if (!schoolClass) return;
    setDeleteTarget(schoolClass);
  };

  // Gọi API xoá, cập nhật lại state, đóng dialog
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      const res = await deleteSchoolClassAPI(deleteTarget.id);

      toast.success(res.message);

      const updatedSchoolClasses = schoolClasses.filter(
        (schoolClass) => schoolClass.id !== deleteTarget.id
      );
      useSchoolClassStore.getState().setSchoolClasses(updatedSchoolClasses);
    } catch (error) {
      console.error(error);
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  // Gọi API tạo mới hoặc cập nhật, cập nhật lại state, đóng dialog
  const handleSubmit = async (values: SchoolClassFormValues) => {
    try {
      let res;
      setLoading(true);
      if (editTarget && editId) {
        res = await updateSchoolClassAPI(editId, values);
        const updatedSchoolClass = res.data;

        const updatedSchoolClasses = schoolClasses.map((schoolClass) =>
          schoolClass.id === editId ? updatedSchoolClass : schoolClass
        );

        useSchoolClassStore.getState().setSchoolClasses(updatedSchoolClasses);
      } else {
        res = await createSchoolClassAPI(values);
        const newSchoolClass = res.data;

        const newSchoolClasses = [...schoolClasses, newSchoolClass];

        useSchoolClassStore.getState().setSchoolClasses(newSchoolClasses);
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

  // Tìm kiếm theo tên và filter theo điểm trường (client-side, filter trên state đã có)
  const filteredSchoolClasses = useMemo(() => {
    return schoolClasses.filter((schoolClass) => {
      const matchName = schoolClass.name
        .toLowerCase()
        .includes(searchName.toLowerCase());

      const matchBranchSchool =
        selectedBranchSchoolId === 'all' ||
        schoolClass.branchSchoolId === selectedBranchSchoolId;

      return matchName && matchBranchSchool;
    });
  }, [searchName, selectedBranchSchoolId, schoolClasses]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Page content */}
      <main className="flex-1 overflow-y-auto px-8 py-6">
        {/* Page title + toolbar */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Quản lý lớp học
            </h1>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {/* Filter */}
            <TextField
              size="small"
              label="Lọc theo điểm trường"
              select
              value={selectedBranchSchoolId}
              onChange={(e) => setSelectedBranchSchoolId(e.target.value)}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="all">Tất cả</MenuItem>
              {branchSchoolOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>

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
            <Button variant="contained" onClick={handleAdd}>
              <AddOutlined fontSize="small" />
              Thêm lớp học mới
            </Button>
          </div>
        </div>

        {/* Table */}
        <DataTable
          columns={schoolClassColumns}
          rows={filteredSchoolClasses}
          onEdit={handleEdit}
          onDelete={handleDelete}
        ></DataTable>
      </main>

      <FormDialog<SchoolClassFormValues>
        open={open}
        title={editTarget ? 'Chỉnh sửa lớp học' : 'Thêm lớp học mới'}
        fields={schoolClassFields}
        schema={schoolClassSchema}
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
    </div>
  );
};

export default SchoolClassPage;
