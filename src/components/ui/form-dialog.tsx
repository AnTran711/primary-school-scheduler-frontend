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
import { useEffect, useRef } from 'react';
import {
  useForm,
  Controller,
  type FieldValues,
  type Resolver,
  type DefaultValues,
  type Path
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ZodObject } from 'zod';

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

interface FormDialogProps<T extends FieldValues> {
  open: boolean;
  title: string;
  fields: FieldDef<T>[];
  schema?: ZodObject;
  initialValues?: Partial<T>;
  onSubmit: (values: T) => void;
  onClose: () => void;
  submitLabel?: string;
  loading?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const buildDefaultValues = <T extends FieldValues>(
  fields: FieldDef<T>[],
  initialValues?: Partial<T>
): DefaultValues<T> => {
  const defaults: Record<string, unknown> = {};
  for (const field of fields) {
    defaults[field.key as string] = initialValues?.[field.key] ?? '';
  }
  return defaults as DefaultValues<T>;
};

// ─── Component ────────────────────────────────────────────────────────────────

const FormDialog = <T extends FieldValues>({
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
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<T>({
    resolver: schema ? (zodResolver(schema) as Resolver<T>) : undefined,
    defaultValues: buildDefaultValues(fields, initialValues)
  });

  // Reset form mỗi khi dialog mở — điền data cũ (edit) hoặc form rỗng (add)
  const fieldsRef = useRef(fields);
  const initialValuesRef = useRef(initialValues);

  useEffect(() => {
    fieldsRef.current = fields;
    initialValuesRef.current = initialValues;
  });

  useEffect(() => {
    if (open) {
      reset(buildDefaultValues(fieldsRef.current, initialValuesRef.current));
    }
  }, [open, reset]);

  const onSubmitForm = (values: T) => {
    onSubmit(values);
  };

  // ── Render fields ────────────────────────────────────────────────────────────

  const renderField = (field: FieldDef<T>) => {
    const key = field.key as string;
    const errorMessage = (errors[key]?.message as string) ?? '';

    const commonProps = {
      fullWidth: true,
      size: 'small' as const,
      label: field.label,
      placeholder: field.placeholder,
      disabled: field.disabled || loading,
      error: !!errorMessage,
      helperText: errorMessage || ' ', // ' ' giữ chiều cao cố định
      required: field.required
    };

    return (
      <Controller
        key={key}
        name={key as Path<T>}
        control={control}
        render={({ field: rhfField }) => {
          if (field.type === 'select') {
            return (
              <TextField
                {...commonProps}
                {...rhfField}
                select
                value={rhfField.value ?? ''}
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
              {...rhfField}
              type={field.type ?? 'text'}
              value={rhfField.value ?? ''}
              onChange={(e) => {
                const raw = e.target.value;
                const val =
                  field.type === 'number' && raw !== '' ? Number(raw) : raw;
                rhfField.onChange(val);
              }}
            />
          );
        }}
      />
    );
  };

  // ── JSX ─────────────────────────────────────────────────────────────────────

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmitForm)}
        sx={{ display: 'flex', flexDirection: 'column' }}
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
            <Typography variant="h6" sx={{ color: 'text.primary' }}>
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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {fields.map((field) => renderField(field))}
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
          >
            Hủy
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Đang lưu...' : submitLabel}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default FormDialog;
