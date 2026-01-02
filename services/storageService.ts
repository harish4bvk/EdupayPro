
import { Student, PaymentRecord, ClassFeeStructure, User, ActivityLog, UserRole } from '../types';
import { MOCK_USERS, MOCK_STUDENTS, MOCK_STRUCTURES } from './mockData';

type Listener = () => void;

class StorageService {
  private listeners: Set<Listener> = new Set();
  
  // State
  private users: User[] = [];
  private students: Student[] = [];
  private payments: PaymentRecord[] = [];
  private structures: ClassFeeStructure[] = [];
  private logs: ActivityLog[] = [];

  constructor() {
    this.initialize();
  }

  private initialize() {
    this.users = JSON.parse(localStorage.getItem('edupay_users') || JSON.stringify(MOCK_USERS));
    this.students = JSON.parse(localStorage.getItem('edupay_students') || JSON.stringify(MOCK_STUDENTS));
    this.payments = JSON.parse(localStorage.getItem('edupay_payments') || '[]');
    this.structures = JSON.parse(localStorage.getItem('edupay_structures') || JSON.stringify(MOCK_STRUCTURES));
    this.logs = JSON.parse(localStorage.getItem('edupay_logs') || '[]');
  }

  private persist() {
    localStorage.setItem('edupay_users', JSON.stringify(this.users));
    localStorage.setItem('edupay_students', JSON.stringify(this.students));
    localStorage.setItem('edupay_payments', JSON.stringify(this.payments));
    localStorage.setItem('edupay_structures', JSON.stringify(this.structures));
    localStorage.setItem('edupay_logs', JSON.stringify(this.logs));
    this.notify();
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  // Fixed: Ensure the cleanup function returns void instead of boolean (Set.delete returns boolean)
  // to avoid type errors in React's useEffect destructor.
  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Getters
  getUsers() { return this.users; }
  getStudents() { return this.students; }
  getPayments() { return this.payments; }
  getStructures() { return this.structures; }
  getLogs() { return this.logs; }

  // Simulated Backend Methods
  async addPayment(payment: PaymentRecord, currentUser: User) {
    this.payments = [...this.payments, payment];
    
    // Update student balance in "real-time"
    this.students = this.students.map(s => {
      if (s.id === payment.studentId) {
        const newPaid = s.totalPaid + payment.amount;
        const struct = this.structures.find(st => st.className === s.className);
        const totalPayable = (struct?.total || 0) + s.previousYearDues - s.discount;
        
        let status: Student['status'] = 'UNPAID';
        if (newPaid >= totalPayable) status = 'PAID';
        else if (newPaid > 0) status = 'PARTIAL';
        
        return { ...s, totalPaid: newPaid, status };
      }
      return s;
    });

    this.addLog(currentUser.id, currentUser.name, 'PAYMENT_COLLECTED', `Collected ₹${payment.amount.toLocaleString()} for transaction ${payment.id}`);
    this.persist();
    return true;
  }

  async addStudents(newStudents: Student[], currentUser: User) {
    this.students = [...this.students, ...newStudents];
    this.addLog(currentUser.id, currentUser.name, 'STUDENT_ADDED', `Enrolled ${newStudents.length} new students.`);
    this.persist();
  }

  async applyDiscount(studentId: string, discount: number, currentUser: User) {
    this.students = this.students.map(s => s.id === studentId ? { ...s, discount } : s);
    this.addLog(currentUser.id, currentUser.name, 'STRUCTURE_UPDATED', `Applied discount of ₹${discount} to student ID: ${studentId}`);
    this.persist();
  }

  private addLog(userId: string, userName: string, action: ActivityLog['action'], details: string) {
    const log: ActivityLog = {
      id: `log-${Date.now()}`,
      userId,
      userName,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    this.logs = [log, ...this.logs].slice(0, 100); // Keep last 100 logs
  }
}

export const storageService = new StorageService();
