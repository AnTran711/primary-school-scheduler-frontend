import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Typography,
  Box
} from '@mui/material';
import { DeleteOutlined, WarningAmberOutlined } from '@mui/icons-material';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DeleteDialogProps {
  open: boolean;
  title?: string;
  description?: string; // mô tả item sắp xóa, VD: tên giáo viên
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const DeleteDialog = ({
  open,
  title = 'Xác nhận xóa',
  description,
  loading = false,
  onConfirm,
  onClose
}: DeleteDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose} // khóa đóng khi đang xóa
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3 } } }}
    >
      {/* Header */}
      <DialogTitle sx={{ px: 3, pt: 3, pb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: 2,
              bgcolor: 'rgba(239,68,68,0.1)',
              flexShrink: 0
            }}
          >
            <WarningAmberOutlined sx={{ fontSize: 20, color: '#ef4444' }} />
          </Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: 'text.primary' }}
          >
            {title}
          </Typography>
        </Box>
      </DialogTitle>

      <Divider />

      {/* Content */}
      <DialogContent sx={{ px: 3, py: 2.5 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Bạn có chắc chắn muốn xóa{' '}
          {description && (
            <Typography
              component="span"
              variant="body2"
              sx={{ fontWeight: 600, color: 'text.primary' }}
            >
              {description}
            </Typography>
          )}{' '}
          không? Hành động này không thể hoàn tác.
        </Typography>
      </DialogContent>

      <Divider />

      {/* Actions */}
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={onClose}
          disabled={loading}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
        >
          Hủy
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={onConfirm}
          disabled={loading}
          startIcon={<DeleteOutlined />}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
        >
          {loading ? 'Đang xóa...' : 'Xóa'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteDialog;
