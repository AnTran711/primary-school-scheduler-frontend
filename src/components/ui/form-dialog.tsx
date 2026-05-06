import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  IconButton,
  Box,
  Typography,
  Divider
} from '@mui/material';
import { CloseOutlined } from '@mui/icons-material';
import { useState, useEffect, useRef } from 'react';
import type { ZodType } from 'zod';

// ─── Types ────────────────────────────────────────────────────────────────────

export type FieldType = 'text' | 'number' | 'email' | 'select';

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface FieldDef<T> {
  key: keyof T;
  label: string;
  type?: FieldType; // mặc định 'text'
  placeholder?: string;
  required?: boolean;
  options?: SelectOption[]; // chỉ dùng khi type === 'select'
  disabled?: boolean;
}

interface FormDialogProps<T extends Record<string, unknown>> {
  open: boolean;
  title: string; // VD: 'Thêm giáo viên', 'Chỉnh sửa môn học'
  fields: FieldDef<T>[];
  schema?: ZodType<T>;
  initialValues?: Partial<T>; // truyền khi edit, để trống khi add
  onSubmit: (values: T) => void;
  onClose: () => void;
  submitLabel?: string; // mặc định 'Lưu'
  loading?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const buildInitialState = <T extends Record<string, unknown>>(
  fields: FieldDef<T>[],
  initialValues?: Partial<T>
): Record<string, unknown> => {
  const state: Record<string, unknown> = {};
  for (const field of fields) {
    const key = field.key as string;
    state[key] = initialValues?.[field.key] ?? '';
  }
  return state;
};

const buildErrors = <T extends Record<string, unknown>>(
  fields: FieldDef<T>[]
): Record<string, string> => {
  const errors: Record<string, string> = {};
  for (const field of fields) {
    errors[field.key as string] = '';
  }
  return errors;
};

// ─── Component ────────────────────────────────────────────────────────────────

const FormDialog = <T extends Record<string, unknown>>({
  open,
  title,
  fields,
  schema,
  initialValues,
  onSubmit,
  onClose,
  submitLabel = 'Lưu',
  loading = false
}: FormDialogProps<T>) => {
  const [values, setValues] = useState<Record<string, unknown>>(() =>
    buildInitialState(fields, initialValues)
  );
  const [errors, setErrors] = useState<Record<string, string>>(() =>
    buildErrors(fields)
  );

  // Reset form khi dialog mở lại với data mới
  const fieldsRef = useRef(fields);
  const initialValuesRef = useRef(initialValues);

  // Luôn cập nhật ref khi prop thay đổi
  useEffect(() => {
    fieldsRef.current = fields;
    initialValuesRef.current = initialValues;
  });

  // Chỉ reset khi open === true, đọc giá trị qua ref
  useEffect(() => {
    if (open) {
      setValues(buildInitialState(fieldsRef.current, initialValuesRef.current));
      setErrors(buildErrors(fieldsRef.current));
    }
  }, [open]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleChange = (key: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    // Xoá lỗi khi user bắt đầu nhập lại
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: '' }));
    }
  };

  const validate = (): boolean => {
    if (!schema) {
      const newErrors: Record<string, string> = {};
      let isValid = true;

      for (const field of fields) {
        const key = field.key as string;
        const value = values[key];

        if (
          field.required &&
          (value === '' || value === null || value === undefined)
        ) {
          newErrors[key] = `${field.label} không được để trống`;
          isValid = false;
        } else {
          newErrors[key] = '';
        }
      }

      setErrors(newErrors);
      return isValid;
    }

    // Có schema → dùng Zod
    const result = schema.safeParse(values);

    if (result.success) {
      setErrors(buildErrors(fields)); // Clear errors
      return true;
    }

    // Map lỗi Zod về đúng field
    const newErrors = buildErrors(fields);
    for (const issue of result.error.issues) {
      const key = issue.path[0] as string;
      if (key in newErrors) {
        newErrors[key] = issue.message;
      }
    }
    setErrors(newErrors);
    return false;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit(values as T);
  };

  // ── Render fields ────────────────────────────────────────────────────────────

  const renderField = (field: FieldDef<T>) => {
    const key = field.key as string;
    const value = values[key] ?? '';
    const error = errors[key];
    const hasError = Boolean(error);

    const commonProps = {
      fullWidth: true,
      size: 'small' as const,
      label: field.label,
      placeholder: field.placeholder,
      disabled: field.disabled || loading,
      error: hasError,
      helperText: hasError ? error : ' ', // ' ' giữ chiều cao cố định, tránh layout shift
      required: field.required
    };

    if (field.type === 'select') {
      return (
        <TextField
          {...commonProps}
          select
          value={value}
          onChange={(e) => handleChange(key, e.target.value)}
        >
          {field.options?.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>
      );
    }

    return (
      <TextField
        {...commonProps}
        type={field.type ?? 'text'}
        value={value}
        onChange={(e) => {
          const raw = e.target.value;
          const val = field.type === 'number' && raw !== '' ? Number(raw) : raw;
          handleChange(key, val);
        }}
      />
    );
  };

  // ── JSX ─────────────────────────────────────────────────────────────────────

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      sx={{ borderRadius: 3 }}
    >
      {/* Header */}
      <DialogTitle sx={{ px: 3, pt: 3, pb: 1.5 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Typography
            sx={{ variant: 'h6', fontWeight: 700, color: 'text.primary' }}
          >
            {title}
          </Typography>
          <IconButton size="small" onClick={onClose} disabled={loading}>
            <CloseOutlined fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider />

      {/* Fields */}
      <DialogContent sx={{ px: 3, py: 2.5 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {fields.map((field) => (
            <Box key={field.key as string}>{renderField(field)}</Box>
          ))}
        </Box>
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
          onClick={handleSubmit}
          disabled={loading}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
        >
          {loading ? 'Đang lưu...' : submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FormDialog;
