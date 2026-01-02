
import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Search, 
  Receipt, 
  Calendar,
  CheckCircle,
  User,
  AlertCircle,
  Calculator,
  Fingerprint,
  Filter,
  Users,
  ChevronDown,
  Smartphone,
  Banknote,
  Tag,
  ArrowDownCircle,
  Zap,
  CalendarDays,
  Layers,
  Star,
  PieChart
} from 'lucide-react';
import { Student, PaymentRecord, ClassFeeStructure } from '../types';

interface PaymentModuleProps {
  students: Student[];
  structures: ClassFeeStructure[];
  onAddPayment: (payment: PaymentRecord) => void;
  currentUser: any;
  initialStudentId?: string;
  currentSession?: string;
}

const PaymentModule: React.FC<PaymentModuleProps> = ({ 
  students, 
  structures, 
  onAddPayment, 
  currentUser,
  initialStudentId,
  currentSession
}) => {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentType, setPaymentType] = useState<PaymentRecord['paymentType']>('MONTHLY');
  const [paymentMethod, setPaymentMethod] = useState<PaymentRecord['method']>('CASH');
  const [transactionId, setTransactionId] = useState('');

  // Get unique classes from students list
  const classes = Array.from(new Set(students.map(s => s.className))).sort();

  useEffect(() => {
    if (initialStudentId) {
      const student = students.find(s => s.id === initialStudentId);
      if (student) {
        setSelectedClass(student.className);
        setSelectedStudentId(initialStudentId);
      }
    }
  }, [initialStudentId, students]);

  // Filter students based on selected class and search query
  const filteredStudents = students.filter(s => {
    const matchesClass = !selectedClass || s.className === selectedClass;
    const matchesSearch = s.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) || 
                          s.rollNo.toLowerCase().includes(studentSearchQuery.toLowerCase());
    return matchesClass && matchesSearch;
  });

  const selectedStudent = students.find(s => s.id === selectedStudentId);
  const structure = selectedStudent ? structures.find(st => st.className === selectedStudent.className) : null;
  
  // Financial Calculations
  const grossTotal = selectedStudent && structure ? (structure.total + selectedStudent.previousYearDues) : 0;
  const netTotalPayable = selectedStudent ? (grossTotal - selectedStudent.discount) : 0;
  const balanceAmount = selectedStudent ? (netTotalPayable - selectedStudent.totalPaid) : 0;

  const amountValue = parseFloat(paymentAmount);
  const isExceeded = !isNaN(amountValue) && amountValue > balanceAmount;
  const isNegative = !isNaN(amountValue) && amountValue < 0;
  const isZero = !isNaN(amountValue) && amountValue === 0 && paymentAmount !== '';

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedClass(e.target.value);
    setSelectedStudentId(''); // Reset student when class changes
  };

  const handlePayFull = () => {
    if (balanceAmount > 0) {
      setPaymentAmount(balanceAmount.toString());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !paymentAmount) return;
    const amount = parseFloat(paymentAmount);
    
    if (amount > balanceAmount) {
      alert(`Invalid Amount: You cannot collect ₹${amount.toLocaleString('en-IN')} as the remaining due is only ₹${balanceAmount.toLocaleString('en-IN')}.`);
      return;
    }

    if (amount <= 0) {
      alert("Invalid Amount: Please enter a value greater than zero.");
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
      transactionId: paymentMethod === 'ONLINE' ? transactionId : undefined,
    };
    onAddPayment(newPayment);
    setPaymentAmount('');
    setTransactionId('');
    setPaymentType('MONTHLY');
    alert(`Success: Payment of ₹${amount.toLocaleString('en-IN')} recorded for ${selectedStudent?.name}.`);
  };

  const collectionTypes: { id: PaymentRecord['paymentType'], label: string, icon: any }[] = [
    { id: 'MONTHLY', label: 'Monthly', icon: CalendarDays },
    { id: 'TERM', label: 'Term-wise', icon: Layers },
    { id: 'YEARLY', label: 'Yearly', icon: Star },
    { id: 'PART', label: 'Part-Payment', icon: PieChart },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Receipt className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Fee Collection Terminal</h2>
            </div>
            {currentSession && (
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-black rounded-lg uppercase tracking-widest border border-indigo-200">
                Session {currentSession}
              </span>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Hierarchical Student Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Filter className="w-3 h-3" />
                  Step 1: Select Class
                </label>
                <div className="relative">
                  <select 
                    className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold outline-none focus:ring-4 focus:ring-indigo-50 transition-all appearance-none"
                    value={selectedClass}
                    onChange={handleClassChange}
                    required
                  >
                    <option value="">Choose Class...</option>
                    {classes.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Users className="w-3 h-3" />
                  Step 2: Select Student
                </label>
                <div className="relative">
                  <select 
                    className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold outline-none focus:ring-4 focus:ring-indigo-50 transition-all appearance-none disabled:opacity-50 disabled:bg-slate-100"
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    disabled={!selectedClass}
                    required
                  >
                    <option value="">{selectedClass ? 'Choose Student...' : 'Select a class first'}</option>
                    {filteredStudents.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.rollNo})
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <Search className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {selectedClass && (
                <div className="md:col-span-2 space-y-2 pt-2 animate-in slide-in-from-top-2 duration-300">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text"
                      placeholder="Filter student list by name or roll..."
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-100 bg-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={studentSearchQuery}
                      onChange={(e) => setStudentSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Collection Frequency */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">
                Step 3: Collection Frequency
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {collectionTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => {
                      setPaymentType(type.id);
                      if (type.id === 'YEARLY') handlePayFull();
                    }}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all gap-2 group ${
                      paymentType === type.id 
                      ? 'bg-indigo-900 border-indigo-900 text-white shadow-xl shadow-indigo-100 scale-[1.02]' 
                      : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300 hover:bg-slate-50'
                    }`}
                  >
                    <type.icon className={`w-5 h-5 ${paymentType === type.id ? 'text-indigo-200' : 'text-slate-400 group-hover:text-indigo-500'}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* In-form Financial Context */}
            {selectedStudent && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 animate-in fade-in zoom-in-95 duration-300">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Total Payable</p>
                  <p className="text-lg font-black text-indigo-900">₹{netTotalPayable.toLocaleString('en-IN')}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Remaining Due</p>
                  <p className="text-lg font-black text-rose-600">₹{balanceAmount.toLocaleString('en-IN')}</p>
                </div>
              </div>
            )}

            {/* Payment Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Amount to Collect (₹)</label>
                  {selectedStudent && balanceAmount > 0 && (
                    <button 
                      type="button" 
                      onClick={handlePayFull}
                      className="text-[10px] font-black text-indigo-600 uppercase hover:underline flex items-center gap-1"
                    >
                      <Zap className="w-3 h-3 fill-indigo-600" />
                      Pay Full Due
                    </button>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input 
                    type="number" 
                    step="0.01" 
                    min="0.01"
                    className={`w-full pl-10 pr-4 py-4 rounded-2xl border ${isExceeded || isNegative || isZero ? 'border-rose-500 bg-rose-50 ring-4 ring-rose-100' : 'border-slate-200 bg-white focus:ring-4 focus:ring-indigo-50'} text-slate-900 font-black text-2xl outline-none transition-all`} 
                    placeholder="0.00" 
                    value={paymentAmount} 
                    onChange={(e) => {
                        const val = e.target.value;
                        if (val === '' || parseFloat(val) >= 0) {
                          setPaymentAmount(val);
                        }
                    }} 
                    required 
                  />
                </div>
                {isExceeded && (
                  <p className="text-xs font-bold text-rose-600 flex items-center gap-1 mt-1 animate-pulse">
                    <AlertCircle className="w-3 h-3" />
                    Amount exceeds student's remaining due (₹{balanceAmount.toLocaleString('en-IN')})
                  </p>
                )}
                {isNegative && (
                  <p className="text-xs font-bold text-rose-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    Amount cannot be negative.
                  </p>
                )}
                {isZero && (
                  <p className="text-xs font-bold text-rose-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    Amount must be greater than zero.
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Payment Method</label>
                <div className="grid grid-cols-2 gap-3 h-[68px]">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CASH')}
                    className={`flex items-center justify-center gap-2 rounded-2xl border transition-all font-bold ${
                      paymentMethod === 'CASH' 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                      : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                    }`}
                  >
                    <Banknote className="w-5 h-5" />
                    Cash
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('ONLINE')}
                    className={`flex items-center justify-center gap-2 rounded-2xl border transition-all font-bold ${
                      paymentMethod === 'ONLINE' 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                      : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                    }`}
                  >
                    <Smartphone className="w-5 h-5" />
                    UPI / Online
                  </button>
                </div>
              </div>

              {paymentMethod === 'ONLINE' && (
                <div className="md:col-span-2 space-y-2 animate-in zoom-in-95 duration-200">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Transaction Reference / UPI ID</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-900 font-bold outline-none" 
                    placeholder="Enter Reference Number" 
                    value={transactionId} 
                    onChange={(e) => setTransactionId(e.target.value)} 
                    required 
                  />
                </div>
              )}
            </div>

            <button 
              type="submit" 
              disabled={!selectedStudentId || !paymentAmount || isExceeded || isNegative || isZero} 
              className="w-full py-5 bg-indigo-900 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-indigo-200 hover:bg-black transition-all active:scale-[0.98] disabled:opacity-20 disabled:grayscale"
            >
              Confirm Payment
            </button>
          </form>
        </div>
      </div>

      {/* Audit Sidebar */}
      <div className="space-y-6">
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center text-indigo-600 mb-6 border border-indigo-100">
            <User className="w-10 h-10" />
          </div>
          
          {selectedStudent ? (
            <div className="space-y-6 w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{selectedStudent.name}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">{selectedStudent.className} • Roll {selectedStudent.rollNo}</p>
              </div>
              
              <div className="space-y-3">
                {/* Total Payable Card */}
                <div className="p-5 bg-slate-900 rounded-[2rem] text-white text-left overflow-hidden relative group">
                  <div className="relative z-10">
                    <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">Total Amount (Payable)</p>
                    <p className="text-4xl font-black">
                      ₹{netTotalPayable.toLocaleString('en-IN')}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-[10px] text-indigo-200/60 font-medium">
                      <span className="flex items-center gap-1"><ArrowDownCircle className="w-3 h-3" /> Structure: ₹{grossTotal.toLocaleString('en-IN')}</span>
                      {selectedStudent.discount > 0 && <span className="flex items-center gap-1 text-emerald-400"><Tag className="w-3 h-3" /> Disc: ₹{selectedStudent.discount.toLocaleString('en-IN')}</span>}
                    </div>
                  </div>
                  <Calculator className="w-20 h-20 text-white/5 absolute -right-4 -bottom-4 group-hover:scale-110 transition-transform" />
                </div>

                {/* Balance Amount Card */}
                <div className="p-6 bg-rose-50 rounded-[2rem] border border-rose-100 text-left relative overflow-hidden">
                  <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"></div>
                    Balance Amount (Due)
                  </p>
                  <p className="text-3xl font-black text-rose-900">₹{balanceAmount.toLocaleString('en-IN')}</p>
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <AlertCircle className="w-12 h-12 text-rose-600" />
                  </div>
                </div>

                {/* Paid Summary */}
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-left flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Total Paid</p>
                    <p className="text-xl font-black text-emerald-900">₹{selectedStudent.totalPaid.toLocaleString('en-IN')}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-emerald-600 opacity-20" />
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
                <span className="flex items-center gap-2">
                  <Fingerprint className="w-4 h-4" />
                  Operator
                </span>
                <span className="text-slate-900">{currentUser?.name}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-8">
              <div className="bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-200">
                <p className="text-slate-400 text-sm font-medium">Select a class and student to view their current balance and financial audit.</p>
              </div>
              <div className="flex justify-center gap-2">
                <div className="w-2 h-2 bg-slate-200 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-200 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-slate-200 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModule;
