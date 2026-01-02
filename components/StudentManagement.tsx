
import React, { useState } from 'react';
import { 
  Upload, 
  Search, 
  UserPlus, 
  Filter, 
  Download, 
  Info, 
  X, 
  Save, 
  User as UserIcon, 
  Phone, 
  Hash, 
  Briefcase, 
  Calculator, 
  Wallet, 
  Tag, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { Student, ClassFeeStructure } from '../types';

interface StudentManagementProps {
  students: Student[];
  structures: ClassFeeStructure[];
  onAddStudents: (newStudents: Student[]) => void;
  onApplyDiscount: (studentId: string, discount: number) => void;
  onCollectFee: (studentId: string) => void;
  isAdmin: boolean;
}

const StudentManagement: React.FC<StudentManagementProps> = ({ 
  students, 
  structures, 
  onAddStudents, 
  onApplyDiscount,
  onCollectFee,
  isAdmin 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Discount Modal state
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [selectedStudentForDiscount, setSelectedStudentForDiscount] = useState<Student | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  // Form state for new student
  const [formData, setFormData] = useState<Partial<Student>>({
    name: '',
    rollNo: '',
    className: '',
    academicYear: '2024-25',
    parentName: '',
    contact: '',
    gender: 'Male',
    previousYearDues: 0,
    discount: 0
  });

  const mandatoryFields = [
    { name: 'rollNo', description: 'Unique ID', example: '1001' },
    { name: 'name', description: 'Full Name', example: 'Rahul Sharma' },
    { name: 'className', description: 'Grade', example: 'Class 10' },
    { name: 'gender', description: 'M/F', example: 'Male' },
    { name: 'parentName', description: 'Guardian', example: 'Sanjay Sharma' },
    { name: 'contact', description: 'Phone', example: '9876543210' },
    { name: 'previousYearDues', description: 'Prev. Balance', example: '0' },
    { name: 'discount', description: 'Waiver', example: '0' },
  ];

  // Get unique classes for the filter dropdown
  const uniqueClasses = Array.from(new Set(students.map(s => s.className))).sort();

  const filteredStudents = students.filter(s => {
    const matchesClass = selectedClass === 'All' || s.className === selectedClass;
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         s.rollNo.includes(searchTerm);
    return matchesClass && matchesSearch;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      alert(`File "${file.name}" received. Simulating bulk upload...`);
      const bulkData: Student[] = [
        {
          id: `new-${Date.now()}`,
          rollNo: `ST-${Math.floor(Math.random() * 10000)}`,
          name: 'Uploaded Student 1',
          className: 'Class 10',
          academicYear: '2024-25',
          parentName: 'Parent 1',
          contact: '123456789',
          gender: 'Male',
          previousYearDues: 0,
          discount: 0,
          totalPaid: 0,
          status: 'UNPAID'
        }
      ];
      onAddStudents(bulkData);
      setShowUploadModal(false);
    }
  };

  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newStudent: Student = {
      id: `st-${Date.now()}`,
      rollNo: formData.rollNo || '',
      name: formData.name || '',
      className: formData.className || '',
      academicYear: formData.academicYear || '2024-25',
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
    setFormData({
      name: '', rollNo: '', className: '', academicYear: '2024-25',
      parentName: '', contact: '', gender: 'Male', previousYearDues: 0, discount: 0
    });
  };

  const downloadTemplate = () => {
    const headers = mandatoryFields.map(f => f.name).join(",");
    const sampleRows = [
      "1004,Arjun Singh,Class 10,Male,Vijay Singh,9876543210,0,0",
      "1005,Priya Patel,Class 9,Female,Raj Patel,9876543211,1500,0"
    ].join("\n");
    
    const csvContent = headers + "\n" + sampleRows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "student_bulk_upload_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenDiscountModal = (student: Student) => {
    setSelectedStudentForDiscount(student);
    setDiscountAmount(student.discount);
    setShowDiscountModal(true);
  };

  const handleSaveDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudentForDiscount) {
      onApplyDiscount(selectedStudentForDiscount.id, discountAmount);
      setShowDiscountModal(false);
      setSelectedStudentForDiscount(null);
    }
  };

  const getCurrentYearFee = (className: string) => {
    const struct = structures.find(s => s.className === className);
    return struct?.total || 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Student Directory</h2>
          <p className="text-slate-500">Track paid amounts and remaining balances across all enrollments.</p>
        </div>
        {isAdmin && (
          <div className="flex gap-3">
            <button 
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
            >
              <Upload className="w-4 h-4" />
              Bulk Upload
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors shadow-md shadow-indigo-100"
            >
              <UserPlus className="w-4 h-4" />
              Add Student
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name or roll..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select 
              className="px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white text-slate-700 font-medium min-w-[160px]"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="All">All Students</option>
              {uniqueClasses.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Student Details</th>
                <th className="px-6 py-4">Roll No</th>
                <th className="px-6 py-4 text-right">Paid Amount</th>
                <th className="px-6 py-4 text-right bg-rose-50/50 text-rose-700">Remaining</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => {
                  const currentYearFee = getCurrentYearFee(student.className);
                  const totalFee = currentYearFee + student.previousYearDues;
                  const remaining = totalFee - student.discount - student.totalPaid;
                  
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{student.name}</div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold">{student.className}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium tracking-tight">{student.rollNo}</td>
                      <td className="px-6 py-4 text-right text-indigo-600 font-bold">
                        ₹{student.totalPaid.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-right bg-rose-50/20">
                        <span className={`font-black text-base ${remaining > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          ₹{Math.max(0, remaining).toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleOpenDiscountModal(student)}
                            title="Apply Discount"
                            className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors border border-amber-100"
                          >
                            <Tag className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => onCollectFee(student.id)}
                            title="Collect Fee"
                            className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-100"
                          >
                            <Wallet className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
                    No students found matching the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Discount Modal */}
      {showDiscountModal && selectedStudentForDiscount && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in duration-300 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50/30">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Apply Discount</h3>
                <p className="text-slate-500 text-sm mt-1">{selectedStudentForDiscount.name} ({selectedStudentForDiscount.rollNo})</p>
              </div>
              <button onClick={() => setShowDiscountModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveDiscount} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-indigo-500" /> Discount Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input 
                    type="number" 
                    autoFocus
                    className="w-full pl-8 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-bold text-lg"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(Number(e.target.value))}
                    min="0"
                  />
                </div>
                <p className="text-xs text-slate-400 italic">This will be subtracted from the total payable fee.</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowDiscountModal(false)}
                  className="flex-1 py-3 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors border border-slate-100"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Discount
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal - Reorganized into Vertical Steps */}
      {isAdmin && showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl animate-in zoom-in duration-300 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-900 text-white">
              <div>
                <h3 className="text-xl font-bold">Bulk Student Enrollment</h3>
                <p className="text-indigo-200 text-sm mt-0.5">Follow the steps below to import records.</p>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="text-indigo-200 hover:text-white transition-colors p-1">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/30">
              {/* Step 1: Template */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md">1</div>
                  <h4 className="font-bold text-slate-900">Download Official Excel Format</h4>
                </div>
                
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-6 group hover:border-indigo-300 transition-colors">
                  <div className="bg-indigo-50 p-4 rounded-2xl group-hover:bg-indigo-100 transition-colors">
                    <FileSpreadsheet className="w-10 h-10 text-indigo-600" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <p className="text-sm font-medium text-slate-700 mb-1">Standardized Enrollment Template</p>
                    <p className="text-xs text-slate-500 leading-relaxed">Contains pre-defined headers. Do not rename columns for successful processing.</p>
                  </div>
                  <button 
                    onClick={downloadTemplate}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95 whitespace-nowrap"
                  >
                    <Download className="w-4 h-4" />
                    Get Template
                  </button>
                </div>
              </div>

              <div className="flex justify-center">
                <ArrowRight className="w-6 h-6 text-slate-300 rotate-90" />
              </div>

              {/* Step 2: Upload */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md">2</div>
                  <h4 className="font-bold text-slate-900">Upload Populated Data File</h4>
                </div>
                
                <div className="relative border-2 border-dashed border-indigo-200 rounded-3xl p-10 flex flex-col items-center justify-center text-center hover:border-indigo-400 hover:bg-white transition-all group bg-white/50">
                  <input 
                    type="file" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                    id="student-file-bulk-final" 
                    accept=".csv, .xlsx, .xls" 
                    onChange={handleFileUpload}
                  />
                  <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-indigo-600" />
                  </div>
                  <p className="text-slate-900 font-bold mb-1">Click to select or drag and drop</p>
                  <p className="text-slate-500 text-[11px] mb-6">Supports CSV, XLSX, and XLS formats</p>
                  
                  <div className="px-8 py-3 bg-white border-2 border-indigo-100 text-indigo-600 rounded-xl text-sm font-black group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all">
                    Browse Files
                  </div>
                </div>
              </div>

              {/* Important Notes */}
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">Crucial Note</p>
                  <p className="text-[11px] text-amber-800 leading-normal">
                    The 'ClassName' field in your file must match exactly with the Class Names defined in your <strong>Fee Structures</strong> to calculate correct balances.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setShowUploadModal(false)}
                className="px-8 py-2.5 text-slate-500 font-bold hover:text-slate-900 transition-colors text-xs uppercase tracking-[0.15em]"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Student Form Modal */}
      {isAdmin && showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-in zoom-in duration-300 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Add New Student</h3>
                <p className="text-slate-500 text-sm mt-1">Enroll a single student into the current session.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddStudentSubmit} className="flex-1 overflow-y-auto p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 md:col-span-2">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2">
                    <UserIcon className="w-3 h-3" /> Basic Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-bold text-slate-700">Full Name</label>
                      <input 
                        type="text" 
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-50 outline-none focus:border-indigo-500 transition-all"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-bold text-slate-700">Roll Number</label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="text" 
                          required
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-50 outline-none focus:border-indigo-500 transition-all"
                          placeholder="e.g. 1005"
                          value={formData.rollNo}
                          onChange={e => setFormData({...formData, rollNo: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2">
                    <Briefcase className="w-3 h-3" /> Academic Placement
                  </h4>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-sm font-bold text-slate-700">Class</label>
                      <select 
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-50 outline-none focus:border-indigo-500 transition-all"
                        value={formData.className}
                        onChange={e => setFormData({...formData, className: e.target.value})}
                      >
                        <option value="">Select Class</option>
                        {uniqueClasses.map(cls => (
                          <option key={cls} value={cls}>{cls}</option>
                        ))}
                        {uniqueClasses.length === 0 && (
                          <>
                            <option value="Class 1">Class 1</option>
                            <option value="Class 9">Class 9</option>
                            <option value="Class 10">Class 10</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 md:col-span-2 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2">
                    <Calculator className="w-3 h-3" /> Opening Balances
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-bold text-slate-700">Previous Year Dues (₹)</label>
                      <input 
                        type="number" 
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-50 outline-none focus:border-indigo-500 transition-all font-bold"
                        value={formData.previousYearDues}
                        onChange={e => setFormData({...formData, previousYearDues: Number(e.target.value)})}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;
