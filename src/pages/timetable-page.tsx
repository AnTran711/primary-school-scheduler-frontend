import { useEffect, useMemo, useState } from 'react';
import { DragDropProvider, DragOverlay } from '@dnd-kit/react';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  MenuItem,
  Paper,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { FileDownloadOutlined } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useSchoolClassStore } from '@/stores/school-class-store';
import type {
  GridState,
  LessonCardData,
  TimetableConfig
} from '@/types/timetable';
import {
  extractPinnedItems,
  generateLessonCards,
  generateTimeslots,
  getCellId
} from '@/utils/timetable.util';
import TimetableConfigPanel from '@/components/ui/timetable-config-panel';
import UnplacedCardsPanel from '@/components/ui/unplaced-cards-panel';
import TimetableGrid from '@/components/ui/timetable-grid';
import LessonCard from '@/components/ui/lesson-card';
import { useTimetableDnd } from '@/hooks/use-timetable-dnd';
import { useTimetableExcel } from '@/hooks/use-timetable-excel';
import { fetchLessonsOverviewBySchoolClassAPI } from '@/api/lesson.api';
import { useTimetableSolving } from '@/hooks/use-timetable-solving';

// ─── Default config ───────────────────────────────────────────────────────────

const DEFAULT_CONFIG: TimetableConfig = {
  numberOfDays: 5,
  morningPeriods: 5,
  hasAfternoon: false,
  afternoonPeriods: 3
};

// ─── Component ────────────────────────────────────────────────────────────────

const TimetablePage = () => {
  const schoolClasses = useSchoolClassStore((state) => state.schoolClasses);

  const { isSolving, solve } = useTimetableSolving();

  const [config, setConfig] = useState<TimetableConfig>(DEFAULT_CONFIG);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [allCards, setAllCards] = useState<LessonCardData[]>([]);
  const [gridState, setGridState] = useState<GridState>({});
  const [hasSolution, setHasSolution] = useState(false);
  const [isLoadingLessons, setIsLoadingLessons] = useState(false);

  // ── Fix lỗi useEffect cascading renders ──────────────────────────────────
  // Dùng useMemo để derive effectiveClassId thay vì setState trong effect
  const effectiveClassId = useMemo(
    () => selectedClassId || schoolClasses[0]?.id || '',
    [selectedClassId, schoolClasses]
  );

  // Sync effectiveClassId vào selectedClassId 1 lần khi schoolClasses load xong
  useEffect(() => {
    const init = async () => {
      if (schoolClasses.length > 0 && !selectedClassId) {
        setSelectedClassId(schoolClasses[0].id);
      }
    };
    init();
  }, [schoolClasses]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load lessons khi đổi lớp
  useEffect(() => {
    const load = async () => {
      if (!effectiveClassId) return;

      setIsLoadingLessons(true);
      try {
        const res =
          await fetchLessonsOverviewBySchoolClassAPI(effectiveClassId);
        const cards = generateLessonCards(res.data);
        setAllCards((prev) => {
          const others = prev.filter(
            (c) => c.schoolClassId !== effectiveClassId
          );
          return [...others, ...cards];
        });
      } finally {
        setIsLoadingLessons(false);
      }
    };
    load();
  }, [effectiveClassId]);

  // ── Toggle pin ─────────────────────────────────────────────────────────────

  const handleTogglePin = (cardId: string) => {
    setAllCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, isPinned: !c.isPinned } : c))
    );
    setGridState((prev) => {
      const next = { ...prev };
      for (const [k, v] of Object.entries(next)) {
        if (v?.id === cardId) next[k] = { ...v, isPinned: !v.isPinned };
      }
      return next;
    });
  };

  // ── DnD (hook tách riêng) ─────────────────────────────────────────────────

  const { handleDragEnd } = useTimetableDnd({
    gridState,
    setGridState
  });

  // ── Solve ──────────────────────────────────────────────────────────────────

  const handleSolve = () => {
    const timeslots = generateTimeslots(config);
    const pinnedItems = extractPinnedItems(gridState);

    solve({ timeslots, pinnedItems }, (result) => {
      // Cập nhật grid với kết quả trả về
      const newGrid: GridState = { ...gridState };
      for (const lesson of result.lessons) {
        if (!lesson.dayOfWeek || !lesson.shift || !lesson.period) continue;
        const cellId = getCellId(
          lesson.schoolClassId,
          lesson.dayOfWeek,
          lesson.shift,
          lesson.period
        );
        // Tìm card chưa được xếp vào ô nào
        const card = allCards.find(
          (c) =>
            c.classSubjectId === lesson.classSubjectId &&
            c.teacherId === lesson.teacherId &&
            !Object.values(newGrid).some((g) => g?.id === c.id)
        );
        if (card) newGrid[cellId] = { ...card, isPinned: lesson.isPinned };
      }
      setGridState(newGrid);
      setHasSolution(true);
      toast.success('Xếp thời khóa biểu thành công!');
    });
  };

  // ── Excel export (hook tách riêng) ────────────────────────────────────────

  const { handleExportExcel } = useTimetableExcel({
    schoolClasses,
    config,
    gridState
  });

  // ── Computed ──────────────────────────────────────────────────────────────

  const selectedClass = schoolClasses.find((sc) => sc.id === effectiveClassId);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar trái */}
        <Box
          sx={{
            width: 220,
            flexShrink: 0,
            borderRight: '1px solid',
            borderColor: 'divider',
            height: '100%',
            overflowY: 'auto',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            bgcolor: 'background.paper'
          }}
        >
          <TimetableConfigPanel
            config={config}
            onChange={setConfig}
            onSolve={handleSolve}
            onReSolve={handleSolve}
            isSolving={isSolving}
            hasSolution={hasSolution}
          />

          <Divider />

          <Tooltip title={!hasSolution ? 'Cần tạo thời khóa biểu trước' : ''}>
            <span>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FileDownloadOutlined />}
                onClick={handleExportExcel}
                disabled={!hasSolution}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
              >
                Xuất Excel
              </Button>
            </span>
          </Tooltip>
        </Box>

        {/* Main content */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Topbar chọn lớp */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              px: 3,
              py: 1.5,
              borderBottom: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              flexShrink: 0
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Thời khóa biểu
            </Typography>

            <TextField
              select
              size="small"
              label="Chọn lớp"
              value={effectiveClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              sx={{
                minWidth: 160,
                '& .MuiOutlinedInput-root': { borderRadius: 2 }
              }}
            >
              {schoolClasses.map((sc) => (
                <MenuItem key={sc.id} value={sc.id}>
                  {sc.name}
                </MenuItem>
              ))}
            </TextField>

            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Kéo thả tiết học vào ô, ghim vị trí cố định rồi bấm{' '}
              <strong>Tạo thời khóa biểu</strong>
            </Typography>
          </Box>

          {/* Body */}
          {isSolving ? (
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2
              }}
            >
              <CircularProgress size={48} />
              <Typography sx={{ color: 'text.secondary' }}>
                Đang xếp thời khóa biểu, vui lòng chờ...
              </Typography>
            </Box>
          ) : (
            <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
              {/* Danh sách tiết chưa xếp */}
              <Box
                sx={{
                  width: 170,
                  flexShrink: 0,
                  borderRight: '1px solid',
                  borderColor: 'divider',
                  p: 1.5,
                  bgcolor: 'grey.50',
                  overflowY: 'auto'
                }}
              >
                {isLoadingLessons ? (
                  <Box
                    sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}
                  >
                    <CircularProgress size={24} />
                  </Box>
                ) : (
                  <UnplacedCardsPanel
                    schoolClassId={effectiveClassId}
                    allCards={allCards}
                    gridState={gridState}
                    onTogglePin={handleTogglePin}
                  />
                )}
              </Box>

              {/* Grid */}
              <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
                {selectedClass && (
                  <Paper variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 700, mb: 1.5 }}
                    >
                      {selectedClass.name}
                    </Typography>
                    <TimetableGrid
                      schoolClassId={effectiveClassId}
                      config={config}
                      gridState={gridState}
                      onTogglePin={handleTogglePin}
                    />
                  </Paper>
                )}
              </Box>
            </Box>
          )}
        </Box>
      </div>

      <DragOverlay>
        {(source) => {
          const card = source?.data?.card as LessonCardData | undefined;
          if (!card) return null;
          return (
            <Box sx={{ width: 150, opacity: 0.9 }}>
              <LessonCard card={card} compact />
            </Box>
          );
        }}
      </DragOverlay>
    </DragDropProvider>
  );
};

export default TimetablePage;
