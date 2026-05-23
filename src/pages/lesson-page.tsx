import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Paper,
  TextField,
  Typography
} from '@mui/material';
import { EditOutlined, PeopleOutlined } from '@mui/icons-material';
import { useSchoolClassStore } from '@/stores/school-class-store';
import type { AssignmentRow } from '@/types/lesson';
import type { ClassSubject } from '@/types/class-subject';
import { fetchClassSubjectsByClassAPI } from '@/api/class-subject.api';
import AssignmentStatusBadge from '@/components/ui/assignment-status-badge';
import AssignmentPanel from '@/components/ui/assignment-panel';
import TeacherWorkloadDialog from '@/components/ui/teacher-workload-dialog';
import { fetchLessonsByClassSubjectAPI } from '@/api/lesson.api';

// ─── lessonMap: lưu tổng tiết đã phân công theo classSubjectId ───────────────

type LessonMap = Record<string, AssignmentRow[]>;

// ─── Component ────────────────────────────────────────────────────────────────

const LessonPage = () => {
  const schoolClasses = useSchoolClassStore((state) => state.schoolClasses);

  const [selectedClassId, setSelectedClassId] = useState('');
  const [classSubjects, setClassSubjects] = useState<ClassSubject[]>([]);
  const [lessonMap, setLessonMap] = useState<LessonMap>({});
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [activeSubject, setActiveSubject] = useState<ClassSubject | null>(null);
  const [workloadDialogOpen, setWorkloadDialogOpen] = useState(false);

  // Load ClassSubject khi chọn lớp
  useEffect(() => {
    const load = async () => {
      if (!selectedClassId) {
        setClassSubjects([]);
        setLessonMap({});
        setActiveSubject(null);
        return;
      }

      setLoadingSubjects(true);
      setActiveSubject(null);
      try {
        const res = await fetchClassSubjectsByClassAPI(selectedClassId);
        setClassSubjects(res?.data ?? []);

        // Load trạng thái phân công của tất cả môn
        const entries = await Promise.all(
          res.data.map(async (cs: ClassSubject) => {
            const res = await fetchLessonsByClassSubjectAPI(cs.id);
            return [cs.id, res.data?.assignments] as const;
          })
        );
        setLessonMap(Object.fromEntries(entries));
      } finally {
        setLoadingSubjects(false);
      }
    };
    load();
  }, [selectedClassId]);

  // Callback từ AssignmentPanel khi lưu thành công
  // → cập nhật lessonMap để AssignmentStatusBadge re-render đúng
  const handleSaveSuccess = (
    classSubjectId: string,
    assignments: AssignmentRow[]
  ) => {
    setLessonMap((prev) => ({ ...prev, [classSubjectId]: assignments }));
  };

  const getAssignedLessons = (csId: string): number => {
    const assignments = lessonMap[csId];
    if (!assignments) return 0;
    return assignments.reduce((sum, a) => sum + a.lessonCount, 0);
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <main className="flex-1 overflow-y-auto px-8 py-6">
        {/* Page header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            mb: 4
          }}
        >
          <Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, color: 'text.primary' }}
            >
              Phân công tiết học
            </Typography>
            <Typography
              variant="body2"
              sx={{ mt: 0.5, color: 'text.secondary' }}
            >
              Phân công giáo viên giảng dạy theo môn học của từng lớp
            </Typography>
          </Box>

          {/* Nút xem tình trạng giáo viên */}
          <Button
            variant="outlined"
            startIcon={<PeopleOutlined />}
            onClick={() => setWorkloadDialogOpen(true)}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Tình trạng giáo viên
          </Button>
        </Box>

        {/* Chọn lớp */}
        <TextField
          select
          size="small"
          label="Chọn lớp học"
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
          sx={{
            minWidth: 260,
            mb: 4,
            '& .MuiOutlinedInput-root': { borderRadius: 2 }
          }}
        >
          {schoolClasses.map((sc) => (
            <MenuItem key={sc.id} value={sc.id}>
              {sc.name}
            </MenuItem>
          ))}
        </TextField>

        {/* Chưa chọn lớp */}
        {!selectedClassId && (
          <Box sx={{ py: 10, textAlign: 'center' }}>
            <Typography sx={{ color: 'text.disabled' }}>
              Chọn lớp học để bắt đầu phân công tiết học
            </Typography>
          </Box>
        )}

        {/* Loading */}
        {selectedClassId && loadingSubjects && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress size={32} />
          </Box>
        )}

        {/* Layout 2 cột */}
        {selectedClassId && !loadingSubjects && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '260px 1fr',
              gap: 3,
              alignItems: 'start'
            }}
          >
            {/* Cột trái — danh sách môn học */}
            <Paper
              variant="outlined"
              sx={{ borderRadius: 2, overflow: 'hidden' }}
            >
              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  bgcolor: 'grey.50',
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 700, color: 'text.secondary' }}
                >
                  DANH SÁCH MÔN HỌC
                </Typography>
              </Box>

              {classSubjects.length === 0 ? (
                <Box sx={{ py: 5, textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                    Lớp này chưa có môn học nào
                  </Typography>
                </Box>
              ) : (
                classSubjects.map((cs) => {
                  const assigned = getAssignedLessons(cs.id);
                  const isActive = activeSubject?.id === cs.id;

                  return (
                    <Box
                      key={cs.id}
                      onClick={() => setActiveSubject(cs)}
                      sx={{
                        px: 2,
                        py: 1.5,
                        cursor: 'pointer',
                        bgcolor: isActive ? 'primary.50' : 'transparent',
                        borderLeft: '3px solid',
                        borderColor: isActive ? 'primary.main' : 'transparent',
                        borderBottom: '1px solid',
                        borderBottomColor: 'divider',
                        transition: 'all 150ms',
                        '&:hover': {
                          bgcolor: isActive ? 'primary.50' : 'grey.50'
                        },
                        '&:last-child': { borderBottom: 'none' }
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 0.75
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: isActive ? 700 : 500 }}
                        >
                          {cs.subjectName}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary' }}
                        >
                          {cs.lessonsPerWeek} tiết
                        </Typography>
                      </Box>

                      {/* Badge cập nhật theo lessonMap */}
                      <AssignmentStatusBadge
                        assignedLessons={assigned}
                        totalLessons={cs.lessonsPerWeek}
                      />
                    </Box>
                  );
                })
              )}
            </Paper>

            {/* Cột phải — panel phân công */}
            <Paper
              variant="outlined"
              sx={{ borderRadius: 2, p: 3, minHeight: 300 }}
            >
              {activeSubject ? (
                <AssignmentPanel
                  key={activeSubject.id} // reset panel khi đổi môn
                  classSubject={activeSubject}
                  onBack={() => setActiveSubject(null)}
                  onSaveSuccess={handleSaveSuccess}
                />
              ) : (
                <Box sx={{ py: 8, textAlign: 'center' }}>
                  <EditOutlined
                    sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }}
                  />
                  <Typography sx={{ color: 'text.disabled' }}>
                    Chọn một môn học để phân công giáo viên
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>
        )}
      </main>

      {/* Dialog tình trạng giáo viên */}
      <TeacherWorkloadDialog
        open={workloadDialogOpen}
        onClose={() => setWorkloadDialogOpen(false)}
      />
    </div>
  );
};

export default LessonPage;
