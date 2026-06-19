'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Image as ImageIcon, Eye } from 'lucide-react';

export default function DesignAdmitCardPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Form State
  const [form, setForm] = useState({
    id: null,
    template: '',
    heading: '',
    title: '',
    exam_name: '',
    school_name: '',
    left_logo: '',
    right_logo: '',
    sign: '',
    is_name: 1,
    is_father_name: 1,
    is_mother_name: 1,
    is_dob: 1,
    is_admission_no: 1,
    is_roll_no: 1,
    is_class: 1,
    is_section: 1,
    is_gender: 1,
    is_photo: 1
  });

  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [toast, setToast] = useState(null);

  const showNotification = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/exams/templates/admit-card');
      const json = await res.json();
      setTemplates(json.data || []);
    } catch (e) {
      showNotification('Failed to load templates', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Base64 file reader helper
  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(prev => ({ ...prev, [field]: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.template.trim()) return;
    setFormSubmitting(true);
    try {
      const res = await fetch('/api/exams/templates/admit-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const json = await res.json();
      if (json.success) {
        showNotification(form.id ? 'Template updated' : 'Template created');
        resetForm();
        loadTemplates();
      }
    } catch (err) {
      showNotification('Server error', 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
      const res = await fetch(`/api/exams/templates/admit-card/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        showNotification('Template deleted');
        loadTemplates();
      }
    } catch (e) {
      showNotification('Failed to delete template', 'error');
    }
  };

  const resetForm = () => {
    setForm({
      id: null,
      template: '',
      heading: '',
      title: '',
      exam_name: '',
      school_name: '',
      left_logo: '',
      right_logo: '',
      sign: '',
      is_name: 1,
      is_father_name: 1,
      is_mother_name: 1,
      is_dob: 1,
      is_admission_no: 1,
      is_roll_no: 1,
      is_class: 1,
      is_section: 1,
      is_gender: 1,
      is_photo: 1
    });
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-1 text-white">Admit Card Layout Designer</h2>
        <p className="text-zinc-400 text-sm">Design templates, logos, background heading metadata, signature placements, and togglable student parameters.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Designer Form */}
        <div className="glass-card h-fit flex flex-col gap-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Plus size={18} className="text-indigo-400" />
            {form.id ? 'Modify Template' : 'Create Template'}
          </h3>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block mb-1.5">Template Title *</label>
              <input 
                type="text" 
                placeholder="e.g. Annual Final Exam 2026"
                className="input-field w-full"
                value={form.template}
                onChange={e => setForm({ ...form, template: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block mb-1.5">School Name</label>
              <input 
                type="text" 
                placeholder="e.g. Prajna International Academy"
                className="input-field w-full"
                value={form.school_name}
                onChange={e => setForm({ ...form, school_name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block mb-1.5">Heading</label>
                <input 
                  type="text" 
                  placeholder="e.g. ADMIT CARD"
                  className="input-field w-full"
                  value={form.heading}
                  onChange={e => setForm({ ...form, heading: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block mb-1.5">Title / Term</label>
                <input 
                  type="text" 
                  placeholder="e.g. CLASS VIII TERM I"
                  className="input-field w-full"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center gap-2 border border-white/5 bg-white/5 p-2 rounded-xl">
                <span className="text-[9px] text-zinc-400 font-bold uppercase">Left Logo</span>
                {form.left_logo ? (
                  <img src={form.left_logo} className="w-12 h-12 object-contain rounded border border-white/10" />
                ) : (
                  <ImageIcon className="text-zinc-600 w-12 h-12" />
                )}
                <input type="file" accept="image/*" className="hidden" id="left-logo-input" onChange={e => handleFileChange(e, 'left_logo')} />
                <label htmlFor="left-logo-input" className="text-[10px] text-indigo-400 hover:underline cursor-pointer">Choose</label>
              </div>

              <div className="flex flex-col items-center gap-2 border border-white/5 bg-white/5 p-2 rounded-xl">
                <span className="text-[9px] text-zinc-400 font-bold uppercase">Right Logo</span>
                {form.right_logo ? (
                  <img src={form.right_logo} className="w-12 h-12 object-contain rounded border border-white/10" />
                ) : (
                  <ImageIcon className="text-zinc-600 w-12 h-12" />
                )}
                <input type="file" accept="image/*" className="hidden" id="right-logo-input" onChange={e => handleFileChange(e, 'right_logo')} />
                <label htmlFor="right-logo-input" className="text-[10px] text-indigo-400 hover:underline cursor-pointer">Choose</label>
              </div>

              <div className="flex flex-col items-center gap-2 border border-white/5 bg-white/5 p-2 rounded-xl">
                <span className="text-[9px] text-zinc-400 font-bold uppercase">Sign Placement</span>
                {form.sign ? (
                  <img src={form.sign} className="w-12 h-12 object-contain rounded border border-white/10" />
                ) : (
                  <ImageIcon className="text-zinc-600 w-12 h-12" />
                )}
                <input type="file" accept="image/*" className="hidden" id="sign-input" onChange={e => handleFileChange(e, 'sign')} />
                <label htmlFor="sign-input" className="text-[10px] text-indigo-400 hover:underline cursor-pointer">Choose</label>
              </div>
            </div>

            <div className="border-t border-white/5 pt-4">
              <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block mb-3">Togglable Student Parameters</span>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'is_name', label: 'Student Name' },
                  { key: 'is_father_name', label: 'Father Name' },
                  { key: 'is_mother_name', label: 'Mother Name' },
                  { key: 'is_dob', label: 'Date of Birth' },
                  { key: 'is_admission_no', label: 'Admission No' },
                  { key: 'is_roll_no', label: 'Roll Number' },
                  { key: 'is_class', label: 'Class' },
                  { key: 'is_section', label: 'Section' },
                  { key: 'is_gender', label: 'Gender' },
                  { key: 'is_photo', label: 'Student Photo' }
                ].map(item => (
                  <label key={item.key} className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={form[item.key] === 1}
                      onChange={e => setForm({ ...form, [item.key]: e.target.checked ? 1 : 0 })}
                      className="rounded border-zinc-700 bg-zinc-800 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2 border-t border-white/5 pt-4">
              <button 
                type="submit" 
                disabled={formSubmitting}
                className="flex-grow btn-primary flex items-center justify-center gap-2"
              >
                <Save size={16} />
                Save Design
              </button>
              <button 
                type="button" 
                onClick={resetForm}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-300 transition-all text-sm font-semibold"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Templates Ledger */}
        <div className="glass-card xl:col-span-2 flex flex-col gap-6">
          <h3 className="text-lg font-semibold text-white">Admit Card Templates</h3>
          
          {loading ? (
            <div className="text-center py-12 text-zinc-500">Loading templates ledger...</div>
          ) : templates.length === 0 ? (
            <div className="text-center py-16 text-zinc-500 border border-dashed border-white/5 rounded-2xl">
              No layouts designed yet.
            </div>
          ) : (
            <div className="table-container !mt-0 !border-none">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Template Name</th>
                    <th>Heading</th>
                    <th>School Name</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map(t => (
                    <tr key={t.id}>
                      <td className="font-semibold text-white">{t.template}</td>
                      <td>{t.heading || 'ADMIT CARD'}</td>
                      <td>{t.school_name || 'N/A'}</td>
                      <td>
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => setPreviewTemplate(t)}
                            className="p-2 bg-indigo-500/10 text-indigo-400 hover:text-white hover:bg-indigo-500 rounded-lg transition-all"
                            title="Preview Layout"
                          >
                            <Eye size={14} />
                          </button>
                          <button 
                            onClick={() => setForm(t)}
                            className="p-2 bg-white/5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10 transition-all"
                          >
                            <Edit size={14} />
                          </button>
                          <button 
                            onClick={() => handleDelete(t.id)}
                            className="p-2 bg-rose-500/10 text-rose-400 hover:text-white hover:bg-rose-500 rounded-lg transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-black w-full max-w-2xl rounded-2xl p-8 flex flex-col gap-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-zinc-200 pb-3">
              <span className="text-xs font-bold text-zinc-500 uppercase">Layout Preview</span>
              <button onClick={() => setPreviewTemplate(null)} className="p-1 hover:bg-zinc-100 rounded text-zinc-500">
                <X size={18} />
              </button>
            </div>

            {/* Standard Admit Card UI Card */}
            <div className="border-[3px] border-zinc-900 p-6 rounded-xl relative flex flex-col gap-4">
              <div className="flex items-center justify-between border-b-2 border-zinc-200 pb-3">
                {previewTemplate.left_logo && <img src={previewTemplate.left_logo} className="w-16 h-16 object-contain" />}
                <div className="text-center flex-grow">
                  <h2 className="text-lg font-bold uppercase tracking-tight">{previewTemplate.school_name || 'SCHOOL NAME'}</h2>
                  <h3 className="text-sm font-semibold uppercase">{previewTemplate.heading || 'ADMIT CARD'}</h3>
                  <h4 className="text-xs font-medium text-zinc-600">{previewTemplate.title || 'TERM / EXAM TITLE'}</h4>
                </div>
                {previewTemplate.right_logo && <img src={previewTemplate.right_logo} className="w-16 h-16 object-contain" />}
              </div>

              <div className="grid grid-cols-3 gap-4 text-xs font-semibold text-zinc-700">
                <div className="col-span-2 flex flex-col gap-2.5">
                  {previewTemplate.is_name === 1 && <div>Student Name: <span className="text-zinc-900 font-bold">John Doe</span></div>}
                  {previewTemplate.is_admission_no === 1 && <div>Admission No: <span className="text-zinc-900">10283</span></div>}
                  {previewTemplate.is_roll_no === 1 && <div>Roll Number: <span className="text-zinc-900">23</span></div>}
                  {previewTemplate.is_class === 1 && <div>Class: <span className="text-zinc-900">VIII (A)</span></div>}
                  {previewTemplate.is_father_name === 1 && <div>Father Name: <span className="text-zinc-900">Robert Doe</span></div>}
                  {previewTemplate.is_dob === 1 && <div>Date of Birth: <span className="text-zinc-900">12/04/2012</span></div>}
                </div>
                {previewTemplate.is_photo === 1 && (
                  <div className="w-24 h-28 border border-zinc-400 flex items-center justify-center text-[10px] text-zinc-400 bg-zinc-50 ml-auto rounded">
                    Student Photo
                  </div>
                )}
              </div>

              <div className="flex justify-between items-end mt-4 pt-3 border-t border-dashed border-zinc-200">
                <div className="text-[10px] text-zinc-500 font-medium">Generated via PrajnaERP</div>
                {previewTemplate.sign && (
                  <div className="text-center flex flex-col items-center gap-1">
                    <img src={previewTemplate.sign} className="w-20 h-10 object-contain" />
                    <span className="text-[9px] font-bold border-t border-zinc-300 pt-1 text-zinc-700 uppercase">Authorized Signature</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 glass-card !p-4 border-l-4 border-l-indigo-500 shadow-2xl min-w-[300px]">
          <span className="text-sm font-medium text-white">{toast.msg}</span>
        </div>
      )}
    </div>
  );
}
