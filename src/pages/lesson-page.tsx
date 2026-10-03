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
import {
  BookOutlined,
  EditOutlined,
  PeopleOutlined
} from '@mui/icons-material';
import { useSchoolClassStore } from '@/stores/school-class-store';
import type { ClassSubject } from '@/types/class-subject';
import { fetchClassSubjectsByClassAPI } from '@/api/class-subject.api';
import AssignmentStatusBadge from '@/components/ui/assignment-status-badge';
import AssignmentPanel from '@/components/ui/assignment-panel';
import TeacherWorkloadDialog from '@/components/ui/teacher-workload-dialog';
import { fetchLessonsOverviewByClassAPI } from '@/api/lesson.api';
import PageHeader from '@/components/ui/page-header';

// ─── assignedCountMap: lưu tổng tiết đã phân công theo classSubjectId ────────

type AssignedCountMap = Record<string, number>;

// ─── Component ────────────────────────────────────────────────────────────────

const LessonPage = () => {
  const schoolClasses = useSchoolClassStore((state) => state.schoolClasses);

  const [selectedClassId, setSelectedClassId] = useState('');
  const [classSubjects, setClassSubjects] = useState<ClassSubject[]>([]);
  const [assignedCountMap, setAssignedCountMap] = useState<AssignedCountMap>({});
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [activeSubject, setActiveSubject] = useState<ClassSubject | null>(null);
  const [workloadDialogOpen, setWorkloadDialogOpen] = useState(false);

  // Load ClassSubject khi chọn lớp
  useEffect(() => {
    const load = async () => {
      if (!selectedClassId) {
        setClassSubjects([]);
        setAssignedCountMap({});
        setActiveSubject(null);
        return;
      }

      setLoadingSubjects(true);
      setActiveSubject(null);
      try {
        // Load danh sách môn + tổng tiết đã phân công song song
        const [subjectsRes, overviewRes] = await Promise.all([
          fetchClassSubjectsByClassAPI(selectedClassId),
          fetchLessonsOverviewByClassAPI(selectedClassId)
        ]);

        setClassSubjects(subjectsRes?.data ?? []);

        // Group overview theo classSubjectId và sum lessonCount
        const countMap: AssignedCountMap = {};
        for (const item of overviewRes?.data ?? []) {
          countMap[item.classSubjectId] =
            (countMap[item.classSubjectId] ?? 0) + item.lessonCount;
        }
        setAssignedCountMap(countMap);
      } finally {
        setLoadingSubjects(false);
      }
    };
    load();
  }, [selectedClassId]);

  // Callback từ AssignmentPanel khi lưu/xóa thành công
  // → cập nhật assignedCountMap để AssignmentStatusBadge re-render đúng
  const handleSaveSuccess = (
    classSubjectId: string,
    totalAssigned: number
  ) => {
    setAssignedCountMap((prev) => ({ ...prev, [classSubjectId]: totalAssigned }));
  };

  // ── Render ──────────────────────────────────────────────────────────────────

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
          title="Phân công tiết học"
          subtitle="Phân công giáo viên giảng dạy theo môn học của từng lớp"
          actions={
            <>
              {/* Chọn lớp */}
              <TextField
                select
                size="small"
                label="Chọn lớp học"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                sx={{ minWidth: 220 }}
              >
                {schoolClasses.map((sc) => (
                  <MenuItem key={sc.id} value={sc.id}>
                    {sc.name}
                  </MenuItem>
                ))}
              </TextField>

              {/* Nút xem tình trạng giáo viên */}
              <Button
                variant="outlined"
                startIcon={<PeopleOutlined />}
                onClick={() => setWorkloadDialogOpen(true)}
              >
                Tình trạng giáo viên
              </Button>
            </>
          }
        />

        {/* Chưa chọn lớp */}
        {!selectedClassId && (
          <Box sx={{ py: 10, textAlign: 'center' }}>
            <BookOutlined
              sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }}
            />
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
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
                maxHeight: 'calc(100vh - 200px)',
                overflowY: 'auto',
                position: 'sticky',
                top: 16
              }}
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
                  const assigned = assignedCountMap[cs.id] ?? 0;
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
      </Box>

      {/* Dialog tình trạng giáo viên */}
      <TeacherWorkloadDialog
        open={workloadDialogOpen}
        onClose={() => setWorkloadDialogOpen(false)}
      />
    </Box>
  );
};

export default LessonPage;
