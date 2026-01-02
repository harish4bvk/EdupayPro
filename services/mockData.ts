
import { Student, ClassFeeStructure, User, UserRole } from '../types';

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'John Admin', email: 'admin@school.com', role: UserRole.ADMIN, password: 'admin123' },
  { id: 'u3', name: 'Mike Staff', email: 'staff@school.com', role: UserRole.STAFF, password: 'staff123' },
];

export const MOCK_STRUCTURES: ClassFeeStructure[] = [
  {
    id: 's1',
    className: 'Class 10',
    academicYear: '2024-25',
    total: 25000,
    components: [
      { name: 'Tuition Fee', amount: 15000 },
      { name: 'Lab Fee', amount: 5000 },
      { name: 'Library Fee', amount: 2000 },
      { name: 'Sports Fee', amount: 3000 },
    ]
  },
  {
    id: 's2',
    className: 'Class 9',
    academicYear: '2024-25',
    total: 22000,
    components: [
      { name: 'Tuition Fee', amount: 12000 },
      { name: 'Lab Fee', amount: 4000 },
      { name: 'Library Fee', amount: 2000 },
      { name: 'Sports Fee', amount: 4000 },
    ]
  }
];

export const MOCK_STUDENTS: Student[] = [
  {
    id: 'st1',
    rollNo: '1001',
    name: 'Alice Johnson',
    className: 'Class 10',
    academicYear: '2024-25',
    parentName: 'Robert Johnson',
    contact: '555-0101',
    gender: 'Female',
    previousYearDues: 2500,
    discount: 500,
    totalPaid: 10000,
    status: 'PARTIAL'
  },
  {
    id: 'st2',
    rollNo: '1002',
    name: 'Bob Smith',
    className: 'Class 10',
    academicYear: '2024-25',
    parentName: 'Linda Smith',
    contact: '555-0102',
    gender: 'Male',
    previousYearDues: 0,
    discount: 0,
    totalPaid: 25000,
    status: 'PAID'
  },
  {
    id: 'st3',
    rollNo: '9001',
    name: 'Charlie Brown',
    className: 'Class 9',
    academicYear: '2024-25',
    parentName: 'Lucy Brown',
    contact: '555-0103',
    gender: 'Male',
    previousYearDues: 1200,
    discount: 0,
    totalPaid: 0,
    status: 'UNPAID'
  }
];
