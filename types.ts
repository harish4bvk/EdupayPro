
export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  ACCOUNTS = 'ACCOUNTS'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  lastLogin?: string;
  isOnline?: boolean;
}

export interface FeeComponent {
  name: string;
  amount: number;
}

export interface ClassFeeStructure {
  id: string;
  className: string;
  academicYear: string;
  components: FeeComponent[];
  total: number;
}

export interface Student {
  id: string;
  rollNo: string;
  name: string;
  className: string;
  academicYear: string;
  parentName: string;
  contact: string;
  gender: 'Male' | 'Female';
  previousYearDues: number;
  discount: number;
  totalPaid: number;
  status: 'PAID' | 'PARTIAL' | 'UNPAID';
}

export interface PaymentRecord {
  id: string;
  studentId: string;
  amount: number;
  date: string;
  paymentType: 'MONTHLY' | 'TERM' | 'YEARLY' | 'PART';
  method: 'CASH' | 'CARD' | 'ONLINE' | 'CHEQUE';
  receivedBy: string;
  note?: string;
}

export type AppView = 'DASHBOARD' | 'STUDENTS' | 'FEE_STRUCTURE' | 'COLLECTION' | 'REPORTS' | 'USERS';
