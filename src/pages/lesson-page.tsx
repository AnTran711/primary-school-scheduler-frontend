import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  MenuItem,
  TextField,
  CircularProgress,
  Paper
} from '@mui/material';
import { EditOutlined } from '@mui/icons-material';
import { useSchoolClassStore } from '@/stores/school-class-store';
import AssignmentStatusBadge from '@/components/ui/assignment-status-badge';
import AssignmentPanel from '@/components/ui/assignment-panel';
import type { ClassSubject } from '@/types/class-subject';
import type { ClassSubjectLesson } from '@/types/lesson';
import { fetchClassSubjectsByClassAPI } from '@/api/class-subject.api';
import { fetchLessonByClassSubjectAPI } from '@/api/lesson.api';

const LessonPage = () => {
  const schoolClasses = useSchoolClassStore((state) => state.schoolClasses);

  const [selectedClassId, setSelectedClassId] = useState('');
  const [classSubjects, setClassSubjects] = useState<ClassSubject[]>([]);
  const [lessonMap, setLessonMap] = useState<
    Record<string, ClassSubjectLesson | null>
  >({});
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [activeSubject, setActiveSubject] = useState<ClassSubject | null>(null);

  // Load ClassSubject khi chọn lớp
  useEffect(() => {
    const load = async () => {
      if (!selectedClassId) {
        setClassSubjects([]);
        setActiveSubject(null);
        return;
      }

      setLoadingSubjects(true);
      setActiveSubject(null);
      try {
        const res = await fetchClassSubjectsByClassAPI(selectedClassId);
        setClassSubjects(res.data);

        // Load trạng thái phân công của tất cả môn
        const entries = await Promise.all(
          res.data.map(async (cs: ClassSubject) => {
            const res = await fetchLessonByClassSubjectAPI(cs.id);
            return [cs.id, res.data] as const;
          })
        );
        setLessonMap(Object.fromEntries(entries));
      } finally {
        setLoadingSubjects(false);
      }
    };
    load();
  }, [selectedClassId]);

  const getAssignedCount = (csId: string) => {
    const lesson = lessonMap[csId];
    if (!lesson) return 0;
    return lesson.assignments.reduce((sum, a) => sum + a.lessonCount, 0);
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <main className="flex-1 overflow-y-auto px-8 py-6">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">
          Phân công tiết học
        </h1>

        {/* Chọn lớp */}
        <TextField
          select
          size="small"
          label="Chọn lớp học"
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
          sx={{
            minWidth: 280,
            mb: 4
          }}
        >
          {schoolClasses.map((sc) => (
            <MenuItem key={sc.id} value={sc.id}>
              {sc.name}
            </MenuItem>
          ))}
        </TextField>

        {!selectedClassId && (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <Typography color="text.disabled">
              Chọn lớp học để bắt đầu phân công tiết học
            </Typography>
          </Box>
        )}

        {selectedClassId && loadingSubjects && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={32} />
          </Box>
        )}

        {selectedClassId && !loadingSubjects && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '280px 1fr',
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
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontWeight: 600 }}
                >
                  DANH SÁCH MÔN HỌC
                </Typography>
              </Box>

              {classSubjects.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.disabled">
                    Lớp này chưa có môn học nào
                  </Typography>
                </Box>
              ) : (
                classSubjects.map((cs) => {
                  const assigned = getAssignedCount(cs.id);
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
                          alignItems: 'flex-start',
                          mb: 0.75
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: isActive ? 700 : 500 }}
                        >
                          {cs.subjectName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {cs.lessonsPerWeek} tiết
                        </Typography>
                      </Box>
                      <AssignmentStatusBadge
                        assigned={assigned}
                        total={cs.lessonsPerWeek}
                      />
                    </Box>
                  );
                })
              )}
            </Paper>

            {/* Cột phải — panel phân công */}
            <Paper variant="outlined" sx={{ borderRadius: 2, p: 3 }}>
              {activeSubject ? (
                <AssignmentPanel
                  classSubject={activeSubject}
                  onBack={() => setActiveSubject(null)}
                />
              ) : (
                <Box sx={{ py: 8, textAlign: 'center' }}>
                  <EditOutlined
                    sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }}
                  />
                  <Typography color="text.disabled">
                    Chọn một môn học để phân công giáo viên
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>
        )}
      </main>
    </div>
  );
};

export default LessonPage;
