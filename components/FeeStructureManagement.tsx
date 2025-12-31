
import React, { useState } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  FilePlus, 
  Calculator,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ClassFeeStructure, FeeComponent } from '../types';

interface FeeStructureManagementProps {
  structures: ClassFeeStructure[];
  onAddStructure: (structure: ClassFeeStructure) => void;
  onUpdateStructure: (structure: ClassFeeStructure) => void;
  onDeleteStructure: (structureId: string) => void;
  isAdmin: boolean;
}

const FeeStructureManagement: React.FC<FeeStructureManagementProps> = ({ 
  structures, 
  onAddStructure, 
  onUpdateStructure, 
  onDeleteStructure,
  isAdmin 
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingStructure, setEditingStructure] = useState<ClassFeeStructure | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<{
    className: string;
    academicYear: string;
    components: FeeComponent[];
  }>({
    className: '',
    academicYear: '2024-25',
    components: [{ name: 'Tuition Fee', amount: 0 }]
  });

  const handleOpenModal = (struct?: ClassFeeStructure) => {
    if (struct) {
      setEditingStructure(struct);
      setFormData({
        className: struct.className,
        academicYear: struct.academicYear,
        components: [...struct.components]
      });
    } else {
      setEditingStructure(null);
      setFormData({
        className: '',
        academicYear: '2024-25',
        components: [{ name: 'Tuition Fee', amount: 0 }]
      });
    }
    setShowModal(true);
  };

  const addComponent = () => {
    setFormData(prev => ({
      ...prev,
      components: [...prev.components, { name: '', amount: 0 }]
    }));
  };

  const removeComponent = (index: number) => {
    setFormData(prev => ({
      ...prev,
      components: prev.components.filter((_, i) => i !== index)
    }));
  };

  const updateComponent = (index: number, field: keyof FeeComponent, value: string | number) => {
    const newComponents = [...formData.components];
    newComponents[index] = { ...newComponents[index], [field]: value };
    setFormData(prev => ({ ...prev, components: newComponents }));
  };

  const calculateTotal = () => {
    return formData.components.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const total = calculateTotal();
    
    if (editingStructure) {
      onUpdateStructure({
        ...editingStructure,
        ...formData,
        total
      });
    } else {
      onAddStructure({
        id: `fs-${Date.now()}`,
        ...formData,
        total
      });
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Fee Structures</h2>
          <p className="text-slate-500">Define and manage annual fee breakdowns per class.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold transition-all shadow-md shadow-indigo-100"
          >
            <FilePlus className="w-4 h-4" />
            Create New Structure
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {structures.map(struct => (
          <div key={struct.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group hover:border-indigo-300 transition-all">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900">{struct.className}</h3>
                <p className="text-xs font-medium text-slate-500 tracking-wider uppercase">{struct.academicYear}</p>
              </div>
              {isAdmin && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleOpenModal(struct)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => { if(confirm('Delete this structure?')) onDeleteStructure(struct.id); }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            
            <div className="p-5 space-y-3">
              {struct.components.map((comp, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">{comp.name}</span>
                  <span className="font-semibold text-slate-700">₹{comp.amount.toLocaleString('en-IN')}</span>
                </div>
              ))}
              <div className="pt-3 border-t border-slate-100 mt-2 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Annual</span>
                <span className="text-xl font-black text-indigo-900">₹{struct.total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-in slide-in-from-bottom-4 duration-300 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {editingStructure ? 'Edit Fee Structure' : 'New Fee Structure'}
                </h3>
                <p className="text-sm text-slate-500">Configure annual billing components for a specific class.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Class / Grade</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-50 outline-none focus:border-indigo-500 transition-all font-medium"
                    placeholder="e.g. Class 10"
                    value={formData.className}
                    onChange={e => setFormData({...formData, className: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Academic Year</label>
                  <select 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-50 outline-none focus:border-indigo-500 transition-all font-medium"
                    value={formData.academicYear}
                    onChange={e => setFormData({...formData, academicYear: e.target.value})}
                  >
                    <option value="2023-24">2023-24</option>
                    <option value="2024-25">2024-25</option>
                    <option value="2025-26">2025-26</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fee Components</label>
                  <button 
                    type="button" 
                    onClick={addComponent}
                    className="text-indigo-600 text-xs font-bold hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Item
                  </button>
                </div>
                
                <div className="space-y-3">
                  {formData.components.map((comp, idx) => (
                    <div key={idx} className="flex gap-3 items-start animate-in fade-in slide-in-from-left-2 duration-200">
                      <div className="flex-1">
                        <input 
                          type="text" 
                          required
                          placeholder="Component Name (e.g. Lab Fee)"
                          className="w-full px-4 py-2 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                          value={comp.name}
                          onChange={e => updateComponent(idx, 'name', e.target.value)}
                        />
                      </div>
                      <div className="w-32">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                          <input 
                            type="number" 
                            required
                            placeholder="0"
                            className="w-full pl-7 pr-4 py-2 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-bold"
                            value={comp.amount}
                            onChange={e => updateComponent(idx, 'amount', Number(e.target.value))}
                          />
                        </div>
                      </div>
                      {formData.components.length > 1 && (
                        <button 
                          type="button"
                          onClick={() => removeComponent(idx)}
                          className="p-2.5 text-slate-300 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-indigo-900 rounded-2xl text-white flex justify-between items-center shadow-xl shadow-indigo-100 relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">Total Calculated Fee</p>
                  <p className="text-3xl font-black">₹{calculateTotal().toLocaleString('en-IN')}</p>
                </div>
                <Calculator className="w-12 h-12 text-white/10 absolute right-4 top-1/2 -translate-y-1/2" />
              </div>
            </form>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button 
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {editingStructure ? 'Update Structure' : 'Publish Fee Structure'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeStructureManagement;
