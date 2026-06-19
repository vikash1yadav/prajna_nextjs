'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { User, BookOpen, CreditCard, Home } from 'lucide-react';

const fetcher = (...args) => fetch(...args).then((res) => res.json());

export const defaultFormValues = {
  admission_no: '',
  roll_no: '',
  class_id: '',
  section_id: '',
  firstname: '',
  middlename: '',
  lastname: '',
  gender: 'Male',
  dob: '',
  email: '',
  mobileno: '',
  admission_date: '',
  blood_group: '',
  father_name: '',
  father_phone: '',
  mother_name: '',
  guardian_name: '',
  guardian_relation: 'Father',
  guardian_phone: '',
  guardian_email: '',
  guardian_address: '',
  current_address: '',
  permanent_address: '',
  bank_name: '',
  bank_account_no: '',
  ifsc_code: '',
  adhar_no: '',
  samagra_id: ''
};

export default function StudentForm({ 
  mode = 'modal', // 'modal' or 'page'
  formMode = 'add', // 'add' or 'edit'
  initialData = defaultFormValues, 
  onSuccess, 
  onCancel 
}) {
  const [formValues, setFormValues] = useState(initialData);
  const [activeTab, setActiveTab] = useState('basic'); // 'basic', 'guardian', 'address', 'bank'
  const [isSubmitting, setIsSubmitting] = useState(false);

  // SWR Hooks for Select Options
  const { data: classesData } = useSWR('/api/classes', fetcher);
  const classes = classesData?.data || [];

  const { data: formSectionsData } = useSWR(formValues.class_id ? `/api/classes/${formValues.class_id}/sections` : null, fetcher);
  const formSections = formSectionsData?.data || [];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxSameAddress = (e) => {
    if (e.target.checked) {
      setFormValues(prev => ({
        ...prev,
        permanent_address: prev.current_address
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formValues.firstname || !formValues.admission_no || !formValues.class_id || !formValues.section_id) {
      alert('Please fill in all required fields (First Name, Admission No, Class, Section)');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formValues,
        session: {
          class_id: parseInt(formValues.class_id),
          section_id: parseInt(formValues.section_id),
          session_id: 21 // fallback default session
        }
      };

      const url = formMode === 'add' ? '/api/students' : `/api/students/${formValues.id}`;
      const method = formMode === 'add' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();

      if (json.success) {
        if (mode === 'modal') {
          alert(formMode === 'add' ? 'Student added successfully!' : 'Student updated successfully!');
        }
        if (onSuccess) onSuccess(json.data || formValues);
        if (mode === 'page' && formMode === 'add') {
          // Reset form on page mode success
          setFormValues(defaultFormValues);
          setActiveTab('basic');
        }
      } else {
        alert('Error saving student: ' + (json.error || json.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Submission error', err);
      alert('Failed to communicate with backend service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`flex flex-col ${mode === 'page' ? 'h-full' : ''}`}>
      {/* Form Tabs Nav */}
      <div className="flex flex-wrap border-b border-zinc-800 gap-1 mt-4">
        <button
          type="button"
          className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b-2 flex items-center gap-2 ${activeTab === 'basic' ? 'border-indigo-500 text-white bg-zinc-900/50' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
          onClick={() => setActiveTab('basic')}
        >
          <BookOpen size={14} /> Basic Info
        </button>
        <button
          type="button"
          className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b-2 flex items-center gap-2 ${activeTab === 'guardian' ? 'border-indigo-500 text-white bg-zinc-900/50' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
          onClick={() => setActiveTab('guardian')}
        >
          <User size={14} /> Parents & Guardian
        </button>
        <button
          type="button"
          className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b-2 flex items-center gap-2 ${activeTab === 'address' ? 'border-indigo-500 text-white bg-zinc-900/50' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
          onClick={() => setActiveTab('address')}
        >
          <Home size={14} /> Addresses
        </button>
        <button
          type="button"
          className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b-2 flex items-center gap-2 ${activeTab === 'bank' ? 'border-indigo-500 text-white bg-zinc-900/50' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
          onClick={() => setActiveTab('bank')}
        >
          <CreditCard size={14} /> Bank & ID
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-grow mt-4 overflow-y-auto pr-1 flex flex-col justify-between">
        <div className="mb-8">
          {/* TAB 1: BASIC DETAILS */}
          {activeTab === 'basic' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-zinc-400 font-medium">Admission No <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  name="admission_no"
                  value={formValues.admission_no}
                  onChange={handleInputChange}
                  className="input-field mt-1"
                  placeholder="e.g. AD-5032"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-medium">Roll Number</label>
                <input
                  type="text"
                  name="roll_no"
                  value={formValues.roll_no}
                  onChange={handleInputChange}
                  className="input-field mt-1"
                  placeholder="e.g. 15"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-medium">Admission Date</label>
                <input
                  type="date"
                  name="admission_date"
                  value={formValues.admission_date}
                  onChange={handleInputChange}
                  className="input-field mt-1"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-medium">Class <span className="text-rose-500">*</span></label>
                <select
                  name="class_id"
                  value={formValues.class_id}
                  onChange={handleInputChange}
                  className="input-field mt-1"
                  required
                >
                  <option value="">Select Class</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.class}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-medium">Section <span className="text-rose-500">*</span></label>
                <select
                  name="section_id"
                  value={formValues.section_id}
                  onChange={handleInputChange}
                  className="input-field mt-1"
                  disabled={!formValues.class_id}
                  required
                >
                  <option value="">Select Section</option>
                  {formSections.map(s => (
                    <option key={s.id} value={s.id}>{s.section}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-medium">Gender</label>
                <select
                  name="gender"
                  value={formValues.gender}
                  onChange={handleInputChange}
                  className="input-field mt-1"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-medium">First Name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  name="firstname"
                  value={formValues.firstname}
                  onChange={handleInputChange}
                  className="input-field mt-1"
                  placeholder="e.g. John"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-medium">Middle Name</label>
                <input
                  type="text"
                  name="middlename"
                  value={formValues.middlename}
                  onChange={handleInputChange}
                  className="input-field mt-1"
                  placeholder="e.g. M."
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-medium">Last Name</label>
                <input
                  type="text"
                  name="lastname"
                  value={formValues.lastname}
                  onChange={handleInputChange}
                  className="input-field mt-1"
                  placeholder="e.g. Doe"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-medium">Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={formValues.dob}
                  onChange={handleInputChange}
                  className="input-field mt-1"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-medium">Blood Group</label>
                <select
                  name="blood_group"
                  value={formValues.blood_group}
                  onChange={handleInputChange}
                  className="input-field mt-1"
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-medium">Student Mobile</label>
                <input
                  type="tel"
                  name="mobileno"
                  value={formValues.mobileno}
                  onChange={handleInputChange}
                  className="input-field mt-1"
                  placeholder="e.g. 9876543210"
                />
              </div>
              <div className="md:col-span-3">
                <label className="text-xs text-zinc-400 font-medium">Student Email</label>
                <input
                  type="email"
                  name="email"
                  value={formValues.email}
                  onChange={handleInputChange}
                  className="input-field mt-1"
                  placeholder="e.g. student@prajnaerp.com"
                />
              </div>
            </div>
          )}

          {/* TAB 2: PARENT & GUARDIAN */}
          {activeTab === 'guardian' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-400 font-medium">Father's Name</label>
                <input
                  type="text"
                  name="father_name"
                  value={formValues.father_name}
                  onChange={handleInputChange}
                  className="input-field mt-1"
                  placeholder="Father's full name"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-medium">Father's Phone</label>
                <input
                  type="tel"
                  name="father_phone"
                  value={formValues.father_phone}
                  onChange={handleInputChange}
                  className="input-field mt-1"
                  placeholder="Father's phone"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-medium">Mother's Name</label>
                <input
                  type="text"
                  name="mother_name"
                  value={formValues.mother_name}
                  onChange={handleInputChange}
                  className="input-field mt-1"
                  placeholder="Mother's full name"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-medium">Guardian Name</label>
                <input
                  type="text"
                  name="guardian_name"
                  value={formValues.guardian_name}
                  onChange={handleInputChange}
                  className="input-field mt-1"
                  placeholder="Guardian's name"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-medium">Guardian Relation</label>
                <select
                  name="guardian_relation"
                  value={formValues.guardian_relation}
                  onChange={handleInputChange}
                  className="input-field mt-1"
                >
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Brother">Brother</option>
                  <option value="Sister">Sister</option>
                  <option value="Uncle">Uncle</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-medium">Guardian Phone</label>
                <input
                  type="tel"
                  name="guardian_phone"
                  value={formValues.guardian_phone}
                  onChange={handleInputChange}
                  className="input-field mt-1"
                  placeholder="Guardian's phone"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs text-zinc-400 font-medium">Guardian Email</label>
                <input
                  type="email"
                  name="guardian_email"
                  value={formValues.guardian_email}
                  onChange={handleInputChange}
                  className="input-field mt-1"
                  placeholder="e.g. guardian@example.com"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs text-zinc-400 font-medium">Guardian Address</label>
                <textarea
                  name="guardian_address"
                  value={formValues.guardian_address}
                  onChange={handleInputChange}
                  className="input-field mt-1 min-h-[60px]"
                  placeholder="Complete residential address of guardian..."
                />
              </div>
            </div>
          )}

          {/* TAB 3: ADDRESSES */}
          {activeTab === 'address' && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-zinc-400 font-medium">Current Address</label>
                <textarea
                  name="current_address"
                  value={formValues.current_address}
                  onChange={handleInputChange}
                  className="input-field mt-1 min-h-[80px]"
                  placeholder="Enter current address..."
                />
              </div>

              <div className="flex items-center gap-2 my-2">
                <input
                  type="checkbox"
                  id="sameAddress"
                  onChange={handleCheckboxSameAddress}
                  className="w-4 h-4 rounded border-zinc-800 bg-zinc-900 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="sameAddress" className="text-xs text-zinc-400 select-none cursor-pointer">Permanent Address is same as Current Address</label>
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-medium">Permanent Address</label>
                <textarea
                  name="permanent_address"
                  value={formValues.permanent_address}
                  onChange={handleInputChange}
                  className="input-field mt-1 min-h-[80px]"
                  placeholder="Enter permanent address..."
                />
              </div>
            </div>
          )}

          {/* TAB 4: BANK & ID */}
          {activeTab === 'bank' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-400 font-medium">Bank Name</label>
                <input
                  type="text"
                  name="bank_name"
                  value={formValues.bank_name}
                  onChange={handleInputChange}
                  className="input-field mt-1"
                  placeholder="e.g. HDFC Bank"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-medium">Bank Account Number</label>
                <input
                  type="text"
                  name="bank_account_no"
                  value={formValues.bank_account_no}
                  onChange={handleInputChange}
                  className="input-field mt-1"
                  placeholder="e.g. 501002345678"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-medium">IFSC Code</label>
                <input
                  type="text"
                  name="ifsc_code"
                  value={formValues.ifsc_code}
                  onChange={handleInputChange}
                  className="input-field mt-1"
                  placeholder="e.g. HDFC0000240"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-medium">Aadhaar National ID</label>
                <input
                  type="text"
                  name="adhar_no"
                  value={formValues.adhar_no}
                  onChange={handleInputChange}
                  className="input-field mt-1"
                  placeholder="12 digit Aadhaar number"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs text-zinc-400 font-medium">Samagra ID</label>
                <input
                  type="text"
                  name="samagra_id"
                  value={formValues.samagra_id}
                  onChange={handleInputChange}
                  className="input-field mt-1"
                  placeholder="9 digit Samagra family ID"
                />
              </div>
            </div>
          )}
        </div>

        {/* Actions Footer */}
        <div className={`flex gap-3 pt-4 border-t border-zinc-800 ${mode === 'page' ? 'justify-start' : 'justify-end'}`}>
          {mode === 'modal' && onCancel && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : (formMode === 'add' ? 'Save Student' : 'Update Profile')}
          </button>
        </div>
      </form>
    </div>
  );
}
