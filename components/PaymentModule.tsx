
import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Search, 
  Receipt, 
  Calendar,
  CheckCircle,
  AlertTriangle,
  User,
  AlertCircle,
  Calculator
} from 'lucide-react';
import { Student, PaymentRecord, ClassFeeStructure, UserRole } from '../types';

interface PaymentModuleProps {
  students: Student[];
  structures: ClassFeeStructure[];
  onAddPayment: (payment: PaymentRecord) => void;
  currentUser: any;
  initialStudentId?: string;
}

const PaymentModule: React.FC<PaymentModuleProps> = ({ 
  students, 
  structures, 
  onAddPayment, 
  currentUser,
  initialStudentId 
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState(initialStudentId || '');
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentType, setPaymentType] = useState<PaymentRecord['paymentType']>('MONTHLY');
  const [paymentMethod, setPaymentMethod] = useState<PaymentRecord['method']>('CASH');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  // Update selected student if prop changes
  useEffect(() => {
    if (initialStudentId) {
      setSelectedStudentId(initialStudentId);
      setError('');
    }
  }, [initialStudentId]);

  const selectedStudent = students.find(s => s.id === selectedStudentId);
  const structure = selectedStudent ? structures.find(st => st.className === selectedStudent.className) : null;
  
  // Total Fee = Current Year + Previous Year
  // Total Due = Total Fee - Paid - Discount
  const totalFee = selectedStudent && structure ? (structure.total + selectedStudent.previousYearDues) : 0;
  const totalDue = selectedStudent && structure 
    ? (totalFee - selectedStudent.discount - selectedStudent.totalPaid)
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedStudentId || !paymentAmount) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid payment amount.');
      return;
    }

    // Constraint: Collected fee amount not exceeding of total outstanding fee
    if (amount > totalDue) {
      setError(`Payment amount (₹${amount}) exceeds the total remaining balance (₹${totalDue.toLocaleString('en-IN')}).`);
      return;
    }

    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      studentId: selectedStudentId,
      amount,
      date: new Date().toISOString(),
      paymentType,
      method: paymentMethod,
      receivedBy: currentUser?.name || 'Unknown',
      note
    };

    onAddPayment(newPayment);
    
    // Reset form
    setPaymentAmount('');
    setNote('');
    alert('Payment recorded successfully!');
  };

  const handleAmountChange = (val: string) => {
    setPaymentAmount(val);
    setError('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left: Form */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-xl font-bold text-slate-900">Collect Fee</h2>
            <p className="text-slate-500 text-sm">Record a payment within the student's total outstanding balance.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Select Student</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select 
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-white font-medium"
                  value={selectedStudentId}
                  onChange={(e) => { setSelectedStudentId(e.target.value); setError(''); }}
                  required
                >
                  <option value="">Choose a student...</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.rollNo} - {s.className})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Amount to Pay (₹)</label>
                <input 
                  type="number" 
                  step="0.01"
                  className={`w-full px-4 py-2 rounded-lg border outline-none font-bold ${error ? 'border-rose-300 bg-rose-50 text-rose-700' : 'border-slate-200 focus:ring-2 focus:ring-indigo-500 text-slate-900'}`}
                  placeholder="0.00"
                  value={paymentAmount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  required
                />
                {selectedStudent && !error && (
                  <p className="text-[10px] text-indigo-600 font-bold uppercase mt-1">Remaining balance: ₹{totalDue.toLocaleString('en-IN')}</p>
                )}
                {error && (
                  <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {error}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Payment Type</label>
                <select 
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value as any)}
                >
                  <option value="MONTHLY">Monthly Fee</option>
                  <option value="TERM">Term-wise Fee</option>
                  <option value="YEARLY">Yearly Fee</option>
                  <option value="PART">Part Payment</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Payment Method</label>
                <select 
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                >
                  <option value="CASH">Cash</option>
                  <option value="CARD">Debit/Credit Card</option>
                  <option value="ONLINE">Online Transfer</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Date of Payment</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="date" 
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                    defaultValue={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={!selectedStudentId || !paymentAmount || !!error}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
            >
              <Receipt className="w-5 h-5" />
              Confirm Payment & Generate Receipt
            </button>
          </form>
        </div>
      </div>

      {/* Right: Summary/Details */}
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-500" />
            Fee Summary
          </h3>
          
          {selectedStudent ? (
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-500 text-sm">Full Name</span>
                <span className="font-semibold text-slate-900">{selectedStudent.name}</span>
              </div>
              
              <div className="mt-6 pt-4 border-t-2 border-dashed border-slate-100 space-y-3">
                <div className="flex justify-between items-center text-slate-600">
                  <span className="text-sm font-medium">Current Year Fee</span>
                  <span className="font-bold">₹{structure?.total.toLocaleString('en-IN') || 0}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span className="text-sm font-medium">Prev. Year Dues</span>
                  <span className="font-bold">₹{selectedStudent.previousYearDues.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center bg-indigo-50 p-2 rounded-lg text-indigo-900 border border-indigo-100">
                  <span className="text-xs font-black uppercase tracking-widest">Total Gross Fee</span>
                  <span className="font-black text-lg">₹{totalFee.toLocaleString('en-IN')}</span>
                </div>
                
                <div className="h-4"></div>
                
                {selectedStudent.discount > 0 && (
                  <div className="flex justify-between items-center text-emerald-600">
                    <span className="text-sm font-medium">Concession/Discount</span>
                    <span className="font-bold">- ₹{selectedStudent.discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-indigo-600">
                  <span className="text-sm font-medium">Already Paid</span>
                  <span className="font-bold">- ₹{selectedStudent.totalPaid.toLocaleString('en-IN')}</span>
                </div>
                
                <div className="mt-4 p-4 bg-slate-900 rounded-xl flex justify-between items-center text-white">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Net Outstanding</span>
                    <p className="text-2xl font-black">₹{totalDue.toLocaleString('en-IN')}</p>
                  </div>
                  <Calculator className="w-8 h-8 opacity-20" />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-slate-50 p-4 rounded-full mb-4">
                <CreditCard className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-500 text-sm">Select a student to view balance details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModule;
