import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  InputAdornment,
  MenuItem,
  TextField,
  Typography
} from '@mui/material';
import {
  AddOutlined,
  BookOutlined,
  SearchOutlined,
  WarningAmberOutlined
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useSchoolClassStore } from '@/stores/school-class-store';
import DeleteDialog from '@/components/ui/delete-dialog';
import type { ClassSubjectFormValues } from '@/schemas/class-subject.schema';
import ClassSubjectCard from '@/components/ui/class-subject-card';
import ClassSubjectFormDialog from '@/components/ui/class-subject-form-dialog';
import type { ClassSubject } from '@/types/class-subject';
import {
  createClassSubjectAPI,
  deleteClassSubjectAPI,
  fetchClassSubjectsByClassAPI,
  updateClassSubjectAPI
} from '@/api/class-subject.api';

const ClassSubjectPage = () => {
  const schoolClasses = useSchoolClassStore((state) => state.schoolClasses);

  const [selectedClassId, setSelectedClassId] = useState('');
  const [classSubjects, setClassSubjects] = useState<ClassSubject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [searchName, setSearchName] = useState('');

  // Form dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editTarget, setEditTarget] = useState<ClassSubject | undefined>();

  // Delete dialog state
  const [deleteTarget, setDeleteTarget] = useState<ClassSubject | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Load ClassSubject khi chọn lớp
  useEffect(() => {
    const load = async () => {
      if (!selectedClassId) {
        setClassSubjects([]);
        return;
      }

      setLoadingSubjects(true);
      try {
        const res = await fetchClassSubjectsByClassAPI(selectedClassId);

        setClassSubjects(res.data);
      } finally {
        setLoadingSubjects(false);
      }
    };
    load();
  }, [selectedClassId]);

  const assignedSubjectIds = useMemo(
    () => classSubjects.map((cs) => cs.subjectId),
    [classSubjects]
  );

  const filteredClassSubjects = useMemo(() => {
    if (!searchName.trim()) return classSubjects;
    return classSubjects.filter((cs) =>
      cs.subjectName.toLowerCase().includes(searchName.toLowerCase())
    );
  }, [searchName, classSubjects]);

  const selectedClass = schoolClasses.find((sc) => sc.id === selectedClassId);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleAdd = () => {
    setEditTarget(undefined);
    setFormOpen(true);
  };

  const handleEdit = (cs: ClassSubject) => {
    setEditTarget(cs);
    setFormOpen(true);
  };

  const handleFormSubmit = async (values: ClassSubjectFormValues) => {
    try {
      setFormLoading(true);
      if (editTarget) {
        const res = await updateClassSubjectAPI(editTarget.id, {
          lessonsPerWeek: values.lessonsPerWeek
        });
        setClassSubjects((prev) =>
          prev.map((cs) => (cs.id === editTarget.id ? res.data : cs))
        );
        toast.success(res.message);
      } else {
        const res = await createClassSubjectAPI({
          lessonsPerWeek: values.lessonsPerWeek,
          schoolClassId: selectedClassId,
          subjectId: values.subjectId
        });
        setClassSubjects((prev) => [...prev, res.data]);
        toast.success(res.message);
      }
      setFormOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      const res = await deleteClassSubjectAPI(deleteTarget.id);
      setClassSubjects((prev) =>
        prev.filter((cs) => cs.id !== deleteTarget.id)
      );
      toast.success(res.message);
    } catch (error) {
      console.error(error);
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <main className="flex-1 overflow-y-auto px-8 py-6">
        {/* Page title */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            sx={{ fontWeight: 700 }}
            color="text.primary"
          >
            Quản lý môn học theo lớp
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Phân công môn học và số tiết mỗi tuần cho từng lớp học
          </Typography>
        </Box>

        {/* Toolbar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 4,
            flexWrap: 'wrap'
          }}
        >
          {/* Chọn lớp */}
          <TextField
            select
            size="small"
            label="Chọn lớp học"
            value={selectedClassId}
            onChange={(e) => {
              setSelectedClassId(e.target.value);
              setSearchName('');
            }}
            sx={{
              minWidth: 200
            }}
          >
            {schoolClasses.map((sc) => (
              <MenuItem key={sc.id} value={sc.id}>
                {sc.name}
              </MenuItem>
            ))}
          </TextField>

          {/* Search — chỉ hiện khi đã chọn lớp */}
          {selectedClassId && (
            <TextField
              size="small"
              placeholder="Tìm môn học..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              sx={{
                width: 200
              }}
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
          )}

          {/* Add button — chỉ hiện khi đã chọn lớp */}
          {selectedClassId && (
            <Button
              variant="contained"
              startIcon={<AddOutlined />}
              onClick={handleAdd}
              sx={{
                ml: 'auto',
                fontWeight: 600
              }}
            >
              Thêm môn học
            </Button>
          )}
        </Box>

        {/* Chưa chọn lớp */}
        {!selectedClassId && (
          <Box sx={{ py: 10, textAlign: 'center' }}>
            <BookOutlined
              sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }}
            />
            <Typography color="text.disabled">
              Chọn lớp học để xem và quản lý môn học
            </Typography>
          </Box>
        )}

        {/* Loading */}
        {selectedClassId && loadingSubjects && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress size={32} />
          </Box>
        )}

        {/* Content */}
        {selectedClassId && !loadingSubjects && (
          <>
            {/* Summary bar */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2.5
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>{selectedClass?.name}</strong> —{' '}
                  {classSubjects.length} môn học,{' '}
                  {classSubjects.reduce(
                    (sum, cs) => sum + cs.lessonsPerWeek,
                    0
                  )}{' '}
                  tiết/tuần
                </Typography>

                {/* Cảnh báo nếu lớp chưa có môn nào */}
                {classSubjects.length === 0 && (
                  <Chip
                    icon={<WarningAmberOutlined sx={{ fontSize: 14 }} />}
                    label="Chưa có môn học nào"
                    size="small"
                    color="warning"
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>

            {/* Grid cards */}
            {filteredClassSubjects.length === 0 && searchName ? (
              <Box sx={{ py: 8, textAlign: 'center' }}>
                <Typography color="text.disabled">
                  Không tìm thấy môn học nào khớp với "{searchName}"
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: 2
                }}
              >
                {filteredClassSubjects.map((cs) => (
                  <ClassSubjectCard
                    key={cs.id}
                    classSubject={cs}
                    onEdit={handleEdit}
                    onDelete={setDeleteTarget}
                  />
                ))}
              </Box>
            )}
          </>
        )}
      </main>

      {/* Form dialog */}
      <ClassSubjectFormDialog
        open={formOpen}
        editTarget={editTarget}
        assignedSubjectIds={assignedSubjectIds}
        loading={formLoading}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      {/* Delete dialog */}
      <DeleteDialog
        open={!!deleteTarget}
        description={
          deleteTarget ? `môn ${deleteTarget.subjectName}` : undefined
        }
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default ClassSubjectPage;
