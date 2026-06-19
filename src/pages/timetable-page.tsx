import { useEffect, useMemo, useState } from 'react';
import { DragDropProvider, DragOverlay } from '@dnd-kit/react';
import {
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Paper,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import {
  FileDownloadOutlined,
  TuneOutlined,
  RefreshOutlined
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useSchoolClassStore } from '@/stores/school-class-store';
import { useTimetableStore } from '@/stores/timetable-store';
import type {
  GridState,
  LessonCardData
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
import { fetchLessonsOverviewAPI } from '@/api/lesson.api';
import { useTimetableSolving } from '@/hooks/use-timetable-solving';

// ─── Component ────────────────────────────────────────────────────────────────

const TimetablePage = () => {
  const schoolClasses = useSchoolClassStore((state) => state.schoolClasses);

  const { isSolving, solve } = useTimetableSolving();

  // ── State từ store ──────────────────────────────────────────────────────────
  const config = useTimetableStore((s) => s.config);
  const setConfig = useTimetableStore((s) => s.setConfig);
  const allCards = useTimetableStore((s) => s.allCards);
  const setAllCards = useTimetableStore((s) => s.setAllCards);
  const gridState = useTimetableStore((s) => s.gridState);
  const setGridState = useTimetableStore((s) => s.setGridState);
  const updateGridState = useTimetableStore((s) => s.updateGridState);
  const hasSolution = useTimetableStore((s) => s.hasSolution);
  const setHasSolution = useTimetableStore((s) => s.setHasSolution);
  const togglePin = useTimetableStore((s) => s.togglePin);

  // ── Local UI state ──────────────────────────────────────────────────────────
  const [selectedClassId, setSelectedClassId] = useState('');
  const [isLoadingLessons, setIsLoadingLessons] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

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

  // Load tất cả lessons một lần khi mount
  useEffect(() => {
    const load = async () => {
      setIsLoadingLessons(true);
      try {
        const res = await fetchLessonsOverviewAPI();
        const cards = generateLessonCards(res.data);
        setAllCards(cards);
      } finally {
        setIsLoadingLessons(false);
      }
    };
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── DnD (hook tách riêng) ─────────────────────────────────────────────────

  const { handleDragEnd } = useTimetableDnd({
    gridState,
    setGridState,
    updateGridState
  });

  // ── Solve ──────────────────────────────────────────────────────────────────

  const handleSolve = () => {
    const timeslots = generateTimeslots(config);
    const pinnedItems = extractPinnedItems(gridState);

    solve({ timeslots, pinnedItems }, (result) => {
      // Bắt đầu từ grid trống — API result là source of truth
      const newGrid: GridState = {};
      const usedCardIds = new Set<string>();

      for (const lesson of result.lessons) {
        if (!lesson.dayOfWeek || !lesson.shift || !lesson.period) continue;
        const cellId = getCellId(
          lesson.schoolClassId,
          lesson.dayOfWeek,
          lesson.shift,
          lesson.period
        );

        // Tìm card chưa được dùng ứng với lesson
        const card = allCards.find(
          (c) =>
            c.classSubjectId === lesson.classSubjectId &&
            c.teacherId === lesson.teacherId &&
            !usedCardIds.has(c.id)
        );
        if (card) {
          usedCardIds.add(card.id);
          newGrid[cellId] = { ...card, isPinned: lesson.pinned };
        }
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
      <Box
        sx={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* ── Header bar ─────────────────────────────────────────────── */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 4,
            py: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            flexShrink: 0
          }}
        >
          <Typography variant="h5" sx={{ color: 'text.primary' }}>
            Thời khóa biểu
          </Typography>

          <TextField
            select
            size="small"
            label="Chọn lớp"
            value={effectiveClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            sx={{ minWidth: 160 }}
          >
            {schoolClasses.map((sc) => (
              <MenuItem key={sc.id} value={sc.id}>
                {sc.name}
              </MenuItem>
            ))}
          </TextField>

          {/* Spacer */}
          <Box sx={{ flex: 1 }} />

          {/* Nút cấu hình */}
          <Tooltip title="Cấu hình khung thời khóa biểu">
            <Button
              variant="outlined"
              size="small"
              startIcon={<TuneOutlined />}
              onClick={() => setIsConfigOpen(true)}
              sx={{
                borderColor: 'divider',
                color: 'text.secondary',
                '&:hover': {
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  bgcolor: 'primary.50'
                }
              }}
            >
              Cấu hình
            </Button>
          </Tooltip>

          {/* Nút tạo / xếp lại thời khóa biểu */}
          {!hasSolution ? (
            <Button
              variant="contained"
              size="small"
              onClick={handleSolve}
              disabled={isSolving}
              sx={{ px: 2.5 }}
            >
              {isSolving ? 'Đang xếp lịch...' : 'Tạo thời khóa biểu'}
            </Button>
          ) : (
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshOutlined />}
              onClick={handleSolve}
              disabled={isSolving}
              sx={{ px: 2.5 }}
            >
              {isSolving ? 'Đang xếp lại...' : 'Xếp lại thời khóa biểu'}
            </Button>
          )}

          {/* Nút xuất Excel */}
          <Tooltip title={!hasSolution ? 'Cần tạo thời khóa biểu trước' : ''}>
            <span>
              <Button
                variant="outlined"
                size="small"
                startIcon={<FileDownloadOutlined />}
                onClick={handleExportExcel}
                disabled={!hasSolution}
                sx={{ px: 2.5 }}
              >
                Xuất Excel
              </Button>
            </span>
          </Tooltip>
        </Box>

        {/* ── Body ───────────────────────────────────────────────────── */}
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
                width: 210,
                flexShrink: 0,
                borderRight: '1px solid',
                borderColor: 'divider',
                p: 1.5,
                bgcolor: 'grey.50',
                overflowY: 'auto'
              }}
            >
              {isLoadingLessons ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <UnplacedCardsPanel
                  schoolClassId={effectiveClassId}
                  allCards={allCards}
                  gridState={gridState}
                />
              )}
            </Box>

            {/* Grid */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              {selectedClass && (
                <Paper variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
                  <Typography variant="body1" sx={{ fontWeight: 700, mb: 1.5 }}>
                    {selectedClass.name}
                  </Typography>
                  <TimetableGrid
                    schoolClassId={effectiveClassId}
                    config={config}
                    gridState={gridState}
                    onTogglePin={togglePin}
                  />
                </Paper>
              )}
            </Box>
          </Box>
        )}
      </Box>

      {/* ── Config Modal ───────────────────────────────────────────── */}
      <TimetableConfigPanel
        config={config}
        onChange={setConfig}
        isSolving={isSolving}
        open={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
      />

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
