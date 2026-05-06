import { useState } from 'react';
import { SearchOutlined, AddOutlined } from '@mui/icons-material';
import { Button, InputAdornment, TextField } from '@mui/material';
import type { Teacher } from '@/types/teacher';
import type { ColumnDef } from '@/components/ui/data-table';
import DataTable from '@/components/ui/data-table';
import FormDialog, { type FieldDef } from '@/components/ui/form-dialog';
import {
  teacherSchema,
  type TeacherFormValues
} from '@/schemas/teacher.schema';

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_TEACHERS: Teacher[] = [
  {
    id: '1',
    name: 'Hoàng Thị Thu Thủy',
    numberOfLessonsPerWeek: 20
  },
  {
    id: '2',
    name: 'Nguyễn Văn Minh',
    numberOfLessonsPerWeek: 18
  },
  {
    id: '3',
    name: 'Lê Thị Hoa',
    numberOfLessonsPerWeek: 16
  },
  {
    id: '4',
    name: 'Trần Đức Dũng',
    numberOfLessonsPerWeek: 14
  },
  {
    id: '5',
    name: 'Hoàng Thị Thu Thủy',
    numberOfLessonsPerWeek: 20
  },
  {
    id: '6',
    name: 'Nguyễn Văn Minh',
    numberOfLessonsPerWeek: 18
  },
  {
    id: '7',
    name: 'Lê Thị Hoa',
    numberOfLessonsPerWeek: 16
  },
  {
    id: '8',
    name: 'Trần Đức Dũng',
    numberOfLessonsPerWeek: 14
  },
  {
    id: '9',
    name: 'Hoàng Thị Thu Thủy',
    numberOfLessonsPerWeek: 20
  },
  {
    id: '10',
    name: 'Nguyễn Văn Minh',
    numberOfLessonsPerWeek: 18
  },
  {
    id: '11',
    name: 'Lê Thị Hoa',
    numberOfLessonsPerWeek: 16
  },
  {
    id: '12',
    name: 'Trần Đức Dũng',
    numberOfLessonsPerWeek: 14
  }
];

// ─── Main Teacher Page ─────────────────────────────────────────────────────────

const TeacherPage = () => {
  const [searchName, setSearchName] = useState('');
  const [open, setOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<TeacherFormValues | undefined>();

  const teacherColumns: ColumnDef<Teacher>[] = [
    {
      key: 'name',
      label: 'Họ tên'
    },
    {
      key: 'numberOfLessonsPerWeek',
      label: 'Số tiết mỗi tuần',
      align: 'center'
    }
  ];

  const teacherFields: FieldDef<TeacherFormValues>[] = [
    {
      key: 'name',
      label: 'Họ tên',
      type: 'text'
    },
    {
      key: 'numberOfLessonsPerWeek',
      label: 'Số tiết mỗi tuần',
      type: 'number'
    }
  ];

  const handleAdd = () => {
    setEditTarget(undefined); // form rỗng
    setOpen(true);
  };

  const handleEdit = (id: string) => {
    console.log('Edit teacher:', id);
  };

  const handleDelete = (id: string) => {
    console.log('Delete teacher:', id);
  };

  const handleSubmit = (values: TeacherFormValues) => {
    if (editTarget) {
      console.log('Update teacher');
    } else {
      console.log('Create teacher:', values);
    }

    setOpen(false);
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Page content */}
      <main className="flex-1 overflow-y-auto px-8 py-6">
        {/* Page title + toolbar */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Quản lý giáo viên
            </h1>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
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
              Thêm giáo viên mới
            </Button>
          </div>
        </div>

        {/* Table */}
        <DataTable
          columns={teacherColumns}
          rows={MOCK_TEACHERS}
          onEdit={handleEdit}
          onDelete={handleDelete}
        ></DataTable>
      </main>

      <FormDialog<TeacherFormValues>
        open={open}
        title={editTarget ? 'Chỉnh sửa giáo viên' : 'Thêm giáo viên mới'}
        fields={teacherFields}
        schema={teacherSchema}
        initialValues={editTarget}
        onSubmit={handleSubmit}
        onClose={() => setOpen(false)}
      />
    </div>
  );
};

export default TeacherPage;
