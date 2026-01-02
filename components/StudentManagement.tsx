
import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Search, 
  UserPlus, 
  Filter, 
  Download, 
  X, 
  Save, 
  User as UserIcon, 
  Hash, 
  Briefcase, 
  Calculator, 
  Tag, 
  FileSpreadsheet, 
  AlertCircle,
  ArrowRight,
  Wallet,
  CheckCircle2,
  FileText,
  Loader2
} from 'lucide-react';
import { Student, ClassFeeStructure } from '../types';

interface StudentManagementProps {
  students: Student[];
  structures: ClassFeeStructure[];
  onAddStudents: (newStudents: Student[]) => void;
  onApplyDiscount: (studentId: string, discount: number) => void;
  onCollectFee: (studentId: string) => void;
  isAdmin: boolean;
  currentSession: string;
}

const StudentManagement: React.FC<StudentManagementProps> = ({ 
  students, 
  structures, 
  onAddStudents, 
  onApplyDiscount,
  onCollectFee,
  isAdmin,
  currentSession
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [selectedStudentForDiscount, setSelectedStudentForDiscount] = useState<Student | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  // Bulk Upload States
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedStudents, setParsedStudents] = useState<Student[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Student>>({
    name: '',
    rollNo: '',
    className: '',
    parentName: '',
    contact: '',
    gender: 'Male',
    previousYearDues: 0,
    discount: 0
  });

  const uniqueClasses = Array.from(new Set(students.map(s => s.className))).sort();
  const filteredStudents = students.filter(s => {
    const matchesClass = selectedClass === 'All' || s.className === selectedClass;
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.rollNo.includes(searchTerm);
    return matchesClass && matchesSearch;
  });

  const downloadTemplate = () => {
    const headers = "Roll No,Name,Class,Parent Name,Contact,Gender(Male/Female),Previous Dues,Discount\n";
    const example = "1005,John Doe,Class 10,Mark Doe,555-0199,Male,0,0";
    const blob = new Blob([headers + example], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EduPay_Student_Template_${currentSession}.csv`;
    a.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setUploadError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/);
        const results: Student[] = [];

        // Skip header
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const values = line.split(',');
          if (values.length < 3) continue;

          results.push({
            id: `bulk-${Date.now()}-${i}`,
            rollNo: values[0]?.trim() || '',
            name: values[1]?.trim() || '',
            className: values[2]?.trim() || '',
            academicYear: currentSession,
            parentName: values[3]?.trim() || '',
            contact: values[4]?.trim() || '',
            gender: (values[5]?.trim() as 'Male' | 'Female') || 'Male',
            previousYearDues: Number(values[6]) || 0,
            discount: Number(values[7]) || 0,
            totalPaid: 0,
            status: 'UNPAID'
          });
        }

        if (results.length === 0) {
          setUploadError("No valid student data found in CSV.");
        } else {
          setParsedStudents(results);
        }
      } catch (err) {
        setUploadError("Failed to parse CSV file. Please check the template.");
      } finally {
        setIsParsing(false);
      }
    };
    reader.readAsText(file);
  };

  const confirmBulkUpload = () => {
    onAddStudents(parsedStudents);
    setParsedStudents([]);
    setShowUploadModal(false);
  };

  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newStudent: Student = {
      id: `st-${Date.now()}`,
      rollNo: formData.rollNo || '',
      name: formData.name || '',
      className: formData.className || '',
      academicYear: currentSession,
      parentName: formData.parentName || '',
      contact: formData.contact || '',
      gender: (formData.gender as 'Male' | 'Female') || 'Male',
      previousYearDues: Number(formData.previousYearDues) || 0,
      discount: Number(formData.discount) || 0,
      totalPaid: 0,
      status: 'UNPAID'
    };
    onAddStudents([newStudent]);
    setShowAddModal(false);
    setFormData({ name: '', rollNo: '', className: '', parentName: '', contact: '', gender: 'Male', previousYearDues: 0, discount: 0 });
  };

  const handleSaveDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudentForDiscount) {
      onApplyDiscount(selectedStudentForDiscount.id, discountAmount);
      setShowDiscountModal(false);
    }
  };

  const getCurrentYearFee = (className: string) => {
    return structures.find(s => s.className === className)?.total || 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Student Directory</h2>
          <p className="text-slate-500 font-medium">Manage student profiles and billing records for <span className="text-indigo-600 font-bold">{currentSession}</span>.</p>
        </div>
        {isAdmin && (
          <div className="flex gap-3">
            <button onClick={() => setShowUploadModal(true)} className="flex items-center gap-2 px-6 py-3 border border-slate-200 bg-white rounded-2xl hover:bg-slate-50 font-bold transition-all shadow-sm"><Upload className="w-5 h-5 text-indigo-600" />Bulk Upload</button>
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 font-bold transition-all shadow-lg shadow-indigo-100"><UserPlus className="w-5 h-5" />Add Student</button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name or roll..." 
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-black focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none font-medium transition-all shadow-sm" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select className="px-4 py-3 rounded-xl border border-slate-200 font-bold min-w-[160px] outline-none focus:ring-4 focus:ring-indigo-50 appearance-none bg-white text-black" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
              <option value="All">All Classes</option>
              {uniqueClasses.map(cls => <option key={cls} value={cls}>{cls}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
              <tr><th className="px-8 py-5">Student Details</th><th className="px-8 py-5">Roll No</th><th className="px-8 py-5 text-right">Paid Amount</th><th className="px-8 py-5 text-right bg-rose-50/50 text-rose-700">Remaining</th><th className="px-8 py-5 text-center">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length > 0 ? filteredStudents.map((student) => {
                const remaining = (getCurrentYearFee(student.className) + student.previousYearDues) - student.discount - student.totalPaid;
                return (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black border border-indigo-100 group-hover:scale-110 transition-transform">{student.name.charAt(0)}</div>
                        <div>
                          <div className="font-bold text-slate-900">{student.name}</div>
                          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{student.className}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 font-bold text-slate-600">{student.rollNo}</td>
                    <td className="px-8 py-5 text-right text-emerald-600 font-black">₹{student.totalPaid.toLocaleString('en-IN')}</td>
                    <td className="px-8 py-5 text-right bg-rose-50/20"><span className={`font-black text-lg ${remaining > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>₹{Math.max(0, remaining).toLocaleString('en-IN')}</span></td>
                    <td className="px-8 py-5">
                      <div className="flex items-center justify-center gap-2">
                        {isAdmin && (
                          <button onClick={() => {setSelectedStudentForDiscount(student); setDiscountAmount(student.discount); setShowDiscountModal(true);}} title="Apply Discount" className="p-2.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"><Tag className="w-4 h-4" /></button>
                        )}
                        <button onClick={() => onCollectFee(student.id)} title="Collect Fee" className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Wallet className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-30">
                      <Users className="w-16 h-16" />
                      <p className="font-bold">No students found for this session.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl animate-in zoom-in duration-200 flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-indigo-50/30">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Bulk Student Import</h3>
                <p className="text-sm font-medium text-slate-500">Upload CSV to enroll multiple students to <span className="text-indigo-600 font-bold">{currentSession}</span></p>
              </div>
              <button onClick={() => { setShowUploadModal(false); setParsedStudents([]); }} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8">
              {parsedStudents.length === 0 ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-4">
                      <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-600"><FileText className="w-6 h-6" /></div>
                      <h4 className="font-bold text-slate-900">Step 1: Get Template</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">Download our standardized CSV format. Fill in student details like Roll No, Name, and Parent details.</p>
                      <button onClick={downloadTemplate} className="flex items-center gap-2 text-indigo-600 font-bold text-sm hover:underline"><Download className="w-4 h-4" /> Download Template CSV</button>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-4">
                      <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-600"><Upload className="w-6 h-6" /></div>
                      <h4 className="font-bold text-slate-900">Step 2: Upload File</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">Select your populated CSV file. The system will automatically parse and assign them to the active session.</p>
                      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" className="hidden" />
                      <button onClick={() => fileInputRef.current?.click()} className="w-full py-3 bg-white border border-indigo-200 text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2">
                        {isParsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        Choose File
                      </button>
                    </div>
                  </div>
                  {uploadError && <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-bold"><AlertCircle className="w-5 h-5" />{uploadError}</div>}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-slate-900 flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Preview {parsedStudents.length} Students</h4>
                    <button onClick={() => setParsedStudents([])} className="text-rose-600 text-xs font-bold hover:underline">Clear Selection</button>
                  </div>
                  <div className="border border-slate-200 rounded-2xl overflow-hidden">
                    <div className="max-h-[400px] overflow-y-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 sticky top-0">
                          <tr><th className="px-4 py-3 font-black uppercase text-slate-400">Roll</th><th className="px-4 py-3 font-black uppercase text-slate-400">Name</th><th className="px-4 py-3 font-black uppercase text-slate-400">Class</th><th className="px-4 py-3 font-black uppercase text-slate-400">Parent</th><th className="px-4 py-3 font-black uppercase text-slate-400 text-right">Dues</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {parsedStudents.map((s, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-3 font-bold">{s.rollNo}</td>
                              <td className="px-4 py-3 font-bold text-slate-900">{s.name}</td>
                              <td className="px-4 py-3 text-slate-500">{s.className}</td>
                              <td className="px-4 py-3 text-slate-500">{s.parentName}</td>
                              <td className="px-4 py-3 text-right font-bold text-rose-600">₹{s.previousYearDues}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
               <button onClick={() => { setShowUploadModal(false); setParsedStudents([]); }} className="flex-1 py-4 text-slate-600 font-bold hover:bg-slate-100 rounded-2xl transition-colors">Cancel</button>
               <button onClick={confirmBulkUpload} disabled={parsedStudents.length === 0} className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 disabled:opacity-30 disabled:grayscale hover:bg-indigo-700 transition-all">Enroll All Students</button>
            </div>
          </div>
        </div>
      )}

      {/* Existing Discount and Add Student Modals */}
      {showDiscountModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl p-8 space-y-6">
            <div className="flex justify-between items-center"><h3 className="text-xl font-black">Apply Discount</h3><button onClick={() => setShowDiscountModal(false)}><X className="w-5 h-5 text-slate-400" /></button></div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Amount (₹)</label>
              <input 
                type="number" 
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-black outline-none focus:ring-4 focus:ring-indigo-50 font-bold" 
                value={discountAmount} 
                onChange={(e) => setDiscountAmount(Number(e.target.value))} 
              />
            </div>
            <button onClick={handleSaveDiscount} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black">Save Discount</button>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-indigo-50/30">
              <div>
                <h3 className="text-2xl font-black text-slate-900">Add New Student</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Enrollment for {currentSession}</p>
              </div>
              <button onClick={() => setShowAddModal(false)}><X className="w-6 h-6 text-slate-400" /></button>
            </div>
            <form onSubmit={handleAddStudentSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                <input 
                  type="text" 
                  required 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-black outline-none font-bold focus:ring-4 focus:ring-indigo-50" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Roll Number</label>
                <input 
                  type="text" 
                  required 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-black outline-none font-bold focus:ring-4 focus:ring-indigo-50" 
                  value={formData.rollNo} 
                  onChange={e => setFormData({...formData, rollNo: e.target.value})} 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Class</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none font-bold focus:ring-4 focus:ring-indigo-50 bg-white text-black" 
                  value={formData.className} 
                  onChange={e => setFormData({...formData, className: e.target.value})} 
                  required
                >
                  <option value="">Select Class</option>
                  {uniqueClasses.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prev. Dues (₹)</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-black outline-none font-bold focus:ring-4 focus:ring-indigo-50" 
                  value={formData.previousYearDues} 
                  onChange={e => setFormData({...formData, previousYearDues: Number(e.target.value)})} 
                />
              </div>
              <button type="submit" className="md:col-span-2 py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg mt-4 shadow-xl shadow-indigo-100">Save Student</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Internal icon helper
const Users = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

export default StudentManagement;
