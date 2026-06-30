'use client';

import React, { useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import { Users, Search, Plus, Edit2, Trash2, CheckCircle, XCircle, ChevronLeft, Calendar, Mail, Phone, BookOpen, Landmark, Briefcase } from 'lucide-react';

const fetcher = (...args) => fetch(...args).then((res) => res.json());

export default function StaffDirectoryPage({ forceDisabled = false }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  // Form Field State
  const [formData, setFormData] = useState({
    employee_id: '',
    roleId: '',
    department: '',
    designation: '',
    qualification: '',
    work_exp: '',
    name: '',
    surname: '',
    father_name: '',
    mother_name: '',
    contact_no: '',
    emergency_contact_no: '',
    email: '',
    dob: '',
    marital_status: '',
    date_of_joining: '',
    local_address: '',
    permanent_address: '',
    note: '',
    gender: 'Male',
    account_title: '',
    bank_account_no: '',
    bank_name: '',
    ifsc_code: '',
    bank_branch: '',
    payscale: '',
    basic_salary: '',
    epf_no: '',
    contract_type: 'Permanent',
    shift: '',
    location: '',
    facebook: '',
    twitter: '',
    linkedin: '',
    instagram: '',
    is_active: 1
  });

  const [statusMessage, setStatusMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // SWR Fetches
  const activeParam = forceDisabled ? '0' : '1';
  const { data: staffRes, isLoading: isStaffLoading } = useSWR(
    `/api/staff?active=${activeParam}${searchQuery ? `&search=${searchQuery}` : ''}${selectedRole ? `&role_id=${selectedRole}` : ''}`,
    fetcher
  );
  const { data: rolesRes } = useSWR('/api/roles', fetcher);
  const { data: deptRes } = useSWR('/api/departments', fetcher);
  const { data: desigRes } = useSWR('/api/designations', fetcher);

  const staffList = staffRes?.data || [];
  const rolesList = rolesRes?.data || [];
  const departmentsList = deptRes?.data || [];
  const designationsList = desigRes?.data || [];

  const handleEdit = (staff) => {
    setSelectedStaff(staff);
    setFormData({
      id: staff.id,
      employee_id: staff.employee_id || '',
      roleId: staff.role_id || '',
      department: staff.department || '',
      designation: staff.designation || '',
      qualification: staff.qualification || '',
      work_exp: staff.work_exp || '',
      name: staff.name || '',
      surname: staff.surname || '',
      father_name: staff.father_name || '',
      mother_name: staff.mother_name || '',
      contact_no: staff.contact_no || '',
      emergency_contact_no: staff.emergency_contact_no || '',
      email: staff.email || '',
      dob: staff.dob || '',
      marital_status: staff.marital_status || '',
      date_of_joining: staff.date_of_joining || '',
      local_address: staff.local_address || '',
      permanent_address: staff.permanent_address || '',
      note: staff.note || '',
      gender: staff.gender || 'Male',
      account_title: staff.account_title || '',
      bank_account_no: staff.bank_account_no || '',
      bank_name: staff.bank_name || '',
      ifsc_code: staff.ifsc_code || '',
      bank_branch: staff.bank_branch || '',
      payscale: staff.payscale || '',
      basic_salary: staff.basic_salary || '',
      epf_no: staff.epf_no || '',
      contract_type: staff.contract_type || 'Permanent',
      shift: staff.shift || '',
      location: staff.location || '',
      facebook: staff.facebook || '',
      twitter: staff.twitter || '',
      linkedin: staff.linkedin || '',
      instagram: staff.instagram || '',
      is_active: staff.is_active !== undefined ? staff.is_active : 1
    });
    setShowForm(true);
  };

  const handleResetForm = () => {
    setSelectedStaff(null);
    setFormData({
      employee_id: '',
      roleId: '',
      department: '',
      designation: '',
      qualification: '',
      work_exp: '',
      name: '',
      surname: '',
      father_name: '',
      mother_name: '',
      contact_no: '',
      emergency_contact_no: '',
      email: '',
      dob: '',
      marital_status: '',
      date_of_joining: '',
      local_address: '',
      permanent_address: '',
      note: '',
      gender: 'Male',
      account_title: '',
      bank_account_no: '',
      bank_name: '',
      ifsc_code: '',
      bank_branch: '',
      payscale: '',
      basic_salary: '',
      epf_no: '',
      contract_type: 'Permanent',
      shift: '',
      location: '',
      facebook: '',
      twitter: '',
      linkedin: '',
      instagram: '',
      is_active: forceDisabled ? 0 : 1
    });
    setStatusMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.employee_id) {
      setStatusMessage({ type: 'error', text: 'Name, Email, and Employee ID are required.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    // Prepare clean payload (remove password if edit or set a default)
    const payload = {
      ...formData,
      password: formData.password || 'password123'
    };

    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setStatusMessage({ type: 'success', text: 'Staff record saved successfully!' });
        setTimeout(() => {
          setShowForm(false);
          handleResetForm();
          mutate((key) => typeof key === 'string' && key.startsWith('/api/staff'));
        }, 1500);
      } else {
        setStatusMessage({ type: 'error', text: data.error || data.message || 'Error occurred' });
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Failed to connect to server.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this staff record?')) {
      return;
    }
    try {
      const res = await fetch(`/api/staff/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        mutate((key) => typeof key === 'string' && key.startsWith('/api/staff'));
      } else {
        alert(data.message || 'Failed to delete');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete staff record');
    }
  };

  const handleToggleStatus = async (staff) => {
    const newStatus = staff.is_active === 1 ? 0 : 1;
    const confirmMsg = newStatus === 0 
      ? 'Are you sure you want to disable this staff member?' 
      : 'Are you sure you want to enable this staff member?';
    
    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...staff,
          is_active: newStatus
        })
      });
      const data = await res.json();
      if (data.success) {
        mutate((key) => typeof key === 'string' && key.startsWith('/api/staff'));
      } else {
        alert(data.message || 'Failed to update status');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-1 text-emerald-400 flex items-center gap-2">
            <Users size={28} /> {forceDisabled ? 'Disabled Staff Directory' : 'Staff Directory'}
          </h2>
          <p className="text-zinc-400 text-sm">
            {forceDisabled 
              ? 'Manage disabled staff profiles and restore their active state.' 
              : 'Add, edit, view, and manage school staff and administrative accounts.'}
          </p>
        </div>
        {!forceDisabled && !showForm && (
          <button onClick={() => { handleResetForm(); setShowForm(true); }} className="btn btn-primary bg-emerald-600 hover:bg-emerald-500 flex items-center gap-2 shadow-emerald-600/20">
            <Plus size={18} /> Add Staff
          </button>
        )}
      </div>

      {showForm ? (
        // Form View
        <div className="glass-card border-emerald-500/10 flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <h3 className="text-xl font-semibold text-white">
              {selectedStaff ? `Edit Staff: ${selectedStaff.name} ${selectedStaff.surname}` : 'Add New Staff Profile'}
            </h3>
            <button onClick={() => { setShowForm(false); handleResetForm(); }} className="btn btn-secondary flex items-center gap-2">
              <ChevronLeft size={16} /> Back to Directory
            </button>
          </div>

          {statusMessage && (
            <div className={`p-4 rounded-lg border ${
              statusMessage.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}>
              {statusMessage.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            {/* 1. Basic / Professional Information */}
            <div>
              <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
                <Briefcase size={16} /> 1. Professional & Basic Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400">Staff ID / Employee ID *</label>
                  <input type="text" className="input-field" placeholder="e.g. EMP101" value={formData.employee_id} onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })} required />
                </div>
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400">Role *</label>
                  <select className="input-field" value={formData.roleId} onChange={(e) => setFormData({ ...formData, roleId: e.target.value })} required>
                    <option value="">Select Role</option>
                    {rolesList.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400">Department</label>
                  <select className="input-field" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })}>
                    <option value="">Select Department</option>
                    {departmentsList.map(d => <option key={d.id} value={d.id}>{d.department_name}</option>)}
                  </select>
                </div>
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400">Designation</label>
                  <select className="input-field" value={formData.designation} onChange={(e) => setFormData({ ...formData, designation: e.target.value })}>
                    <option value="">Select Designation</option>
                    {designationsList.map(d => <option key={d.id} value={d.id}>{d.designation}</option>)}
                  </select>
                </div>
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400">First Name *</label>
                  <input type="text" className="input-field" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400">Last Name / Surname</label>
                  <input type="text" className="input-field" value={formData.surname} onChange={(e) => setFormData({ ...formData, surname: e.target.value })} />
                </div>
              </div>
            </div>

            {/* 2. Personal & Contact Information */}
            <div>
              <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
                <Mail size={16} /> 2. Personal & Contact Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400">Email Address *</label>
                  <input type="email" className="input-field" placeholder="e.g. name@school.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                </div>
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400">Contact Number</label>
                  <input type="text" className="input-field" value={formData.contact_no} onChange={(e) => setFormData({ ...formData, contact_no: e.target.value })} />
                </div>
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400">Emergency Phone</label>
                  <input type="text" className="input-field" value={formData.emergency_contact_no} onChange={(e) => setFormData({ ...formData, emergency_contact_no: e.target.value })} />
                </div>
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400">Date of Birth</label>
                  <input type="date" className="input-field" value={formData.dob} onChange={(e) => setFormData({ ...formData, dob: e.target.value })} />
                </div>
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400">Gender</label>
                  <select className="input-field" value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400">Marital Status</label>
                  <select className="input-field" value={formData.marital_status} onChange={(e) => setFormData({ ...formData, marital_status: e.target.value })}>
                    <option value="">Select Status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Divorced">Divorced</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 3. Education & Payscale */}
            <div>
              <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
                <BookOpen size={16} /> 3. Education, Experience & Pay Scale
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400">Qualifications</label>
                  <input type="text" className="input-field" placeholder="e.g. B.Ed, M.Sc" value={formData.qualification} onChange={(e) => setFormData({ ...formData, qualification: e.target.value })} />
                </div>
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400">Work Experience</label>
                  <input type="text" className="input-field" placeholder="e.g. 5 Years" value={formData.work_exp} onChange={(e) => setFormData({ ...formData, work_exp: e.target.value })} />
                </div>
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400">Basic Salary</label>
                  <input type="number" className="input-field" placeholder="e.g. 35000" value={formData.basic_salary} onChange={(e) => setFormData({ ...formData, basic_salary: e.target.value })} />
                </div>
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400">Pay Scale</label>
                  <input type="text" className="input-field" placeholder="e.g. Grade-A" value={formData.payscale} onChange={(e) => setFormData({ ...formData, payscale: e.target.value })} />
                </div>
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400">Contract Type</label>
                  <select className="input-field" value={formData.contract_type} onChange={(e) => setFormData({ ...formData, contract_type: e.target.value })}>
                    <option value="Permanent">Permanent</option>
                    <option value="Contract">Contract</option>
                    <option value="Part Time">Part Time</option>
                  </select>
                </div>
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400">Shift / Work Hours</label>
                  <input type="text" className="input-field" placeholder="e.g. Morning Shift" value={formData.shift} onChange={(e) => setFormData({ ...formData, shift: e.target.value })} />
                </div>
              </div>
            </div>

            {/* 4. Bank Information */}
            <div>
              <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
                <Landmark size={16} /> 4. Banking & Financial Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400">Bank Account Title</label>
                  <input type="text" className="input-field" placeholder="Account Holder Name" value={formData.account_title} onChange={(e) => setFormData({ ...formData, account_title: e.target.value })} />
                </div>
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400">Bank Account Number</label>
                  <input type="text" className="input-field" value={formData.bank_account_no} onChange={(e) => setFormData({ ...formData, bank_account_no: e.target.value })} />
                </div>
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400">Bank Name</label>
                  <input type="text" className="input-field" value={formData.bank_name} onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })} />
                </div>
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400">Bank Branch Name</label>
                  <input type="text" className="input-field" value={formData.bank_branch} onChange={(e) => setFormData({ ...formData, bank_branch: e.target.value })} />
                </div>
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400">IFSC Code / Routing Code</label>
                  <input type="text" className="input-field" value={formData.ifsc_code} onChange={(e) => setFormData({ ...formData, ifsc_code: e.target.value })} />
                </div>
              </div>
            </div>

            {/* 5. Address & Socials */}
            <div>
              <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
                <Landmark size={16} /> 5. Addresses & Social Links
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400">Local Address</label>
                  <textarea className="input-field h-24" value={formData.local_address} onChange={(e) => setFormData({ ...formData, local_address: e.target.value })} />
                </div>
                <div className="form-group flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400">Permanent Address</label>
                  <textarea className="input-field h-24" value={formData.permanent_address} onChange={(e) => setFormData({ ...formData, permanent_address: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="flex gap-4 border-t border-white/5 pt-6 justify-end">
              <button type="button" onClick={() => { setShowForm(false); handleResetForm(); }} className="btn btn-secondary px-6">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="btn btn-primary px-8 bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20">
                {isSubmitting ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        // Directory Grid & Search View
        <div className="flex flex-col gap-6">
          {/* Filters Panel */}
          <div className="glass-card border-white/5 flex flex-col md:flex-row gap-4 justify-between items-center p-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-3.5 text-zinc-500" size={18} />
              <input 
                type="text" 
                placeholder="Search staff by ID, Name, Contact, Email..." 
                className="input-field pl-10" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
              />
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <select className="input-field w-full md:w-56" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
                <option value="">Filter By Role</option>
                {rolesList.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
          </div>

          {/* Directory Listings */}
          {isStaffLoading ? (
            <div className="glass-card text-center p-12 text-zinc-400 animate-pulse">Loading staff records...</div>
          ) : staffList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {staffList.map((staff) => (
                <div key={staff.id} className="glass-card border-white/5 flex flex-col justify-between hover:border-emerald-500/20 hover:shadow-lg transition-all p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-2xl font-bold uppercase">
                      {staff.name ? staff.name.charAt(0) : '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono bg-white/5 border border-white/5 text-zinc-400 px-2 py-0.5 rounded">
                          {staff.employee_id}
                        </span>
                        {staff.is_active === 1 ? (
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 rounded-full font-semibold">Active</span>
                        ) : (
                          <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 rounded-full font-semibold">Disabled</span>
                        )}
                      </div>
                      <h4 className="font-semibold text-white text-lg mt-1 truncate">
                        {staff.name} {staff.surname}
                      </h4>
                      <p className="text-zinc-400 text-sm truncate flex items-center gap-1.5 mt-0.5">
                        <Briefcase size={14} className="text-zinc-500" />
                        {staff.designation_name || 'Staff Member'}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-white/5 mt-4 pt-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs text-zinc-400 truncate">
                      <Mail size={14} className="text-zinc-500" />
                      {staff.email}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <Phone size={14} className="text-zinc-500" />
                      {staff.contact_no || 'N/A'}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 border-t border-white/5 mt-4 pt-4">
                    <button onClick={() => handleEdit(staff)} className="p-2 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 border border-transparent rounded-lg transition-colors" title="Edit Profile">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleToggleStatus(staff)} className={`p-2 border border-transparent rounded-lg transition-colors ${
                      staff.is_active === 1 
                        ? 'text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10' 
                        : 'text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10'
                    }`} title={staff.is_active === 1 ? 'Disable Profile' : 'Restore / Enable Profile'}>
                      {staff.is_active === 1 ? <XCircle size={16} /> : <CheckCircle size={16} />}
                    </button>
                    <button onClick={() => handleDelete(staff.id)} className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent rounded-lg transition-colors" title="Delete Profile">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card text-center p-12 border-dashed border-white/5 text-zinc-500">No staff members found matching parameters.</div>
          )}
        </div>
      )}
    </div>
  );
}
