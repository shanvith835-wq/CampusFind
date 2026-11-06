'use client';

import React, { useState, useEffect } from 'react';
import { useItems } from '../context/ItemContext';
import { User, Mail, Phone, GraduationCap, CreditCard, X, Check, Sparkles } from 'lucide-react';
import Button from './Button';

export default function EditProfileModal({ isOpen, onClose }) {
  const { currentUser, updateUserProfile } = useItems();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    studentId: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (currentUser && isOpen) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        department: currentUser.department || '',
        studentId: currentUser.studentId || '',
      });
      setErrors({});
    }
  }, [currentUser, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required.';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Campus email is required.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Please enter a valid email address.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    updateUserProfile({
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      department: formData.department.trim(),
      studentId: formData.studentId.trim(),
    });

    onClose();
  };

  const getInitials = (name) => {
    if (!name) return 'ST';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-slate-100 animate-in zoom-in-95 duration-200">
          <form onSubmit={handleSubmit}>
            <div className="p-6 sm:p-8 space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-secondary to-primary text-white flex items-center justify-center font-bold text-base shadow-md">
                    {getInitials(formData.name || currentUser.name)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Edit Student Profile
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Update your contact details for lost & found reports.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  aria-label="Close dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label
                    htmlFor="edit-name"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                  >
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      id="edit-name"
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g. Alex Johnson"
                      className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${errors.name
                        ? 'border-red-300 focus:ring-red-200'
                        : 'border-slate-200 focus:ring-primary/20 focus:border-primary'
                        }`}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-xs text-red-600 font-medium mt-1">
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Campus Email */}
                <div>
                  <label
                    htmlFor="edit-email"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                  >
                    Campus Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      id="edit-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="e.g. alex.johnson@campus.edu"
                      className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${errors.email
                        ? 'border-red-300 focus:ring-red-200'
                        : 'border-slate-200 focus:ring-primary/20 focus:border-primary'
                        }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-600 font-medium mt-1">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label
                    htmlFor="edit-phone"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                  >
                    Phone Number{' '}
                    <span className="text-slate-400 text-[10px] lowercase font-normal">
                      (for calls / SMS)
                    </span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      id="edit-phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="e.g. +1 (555) 019-2834"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                </div>

                {/* Department & Student ID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label
                      htmlFor="edit-dept"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                    >
                      Department
                    </label>
                    <div className="relative">
                      <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        id="edit-dept"
                        type="text"
                        value={formData.department}
                        onChange={(e) =>
                          setFormData({ ...formData, department: e.target.value })
                        }
                        placeholder="e.g. Computer Science"
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="edit-id"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                    >
                      Student ID
                    </label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        id="edit-id"
                        type="text"
                        value={formData.studentId}
                        onChange={(e) =>
                          setFormData({ ...formData, studentId: e.target.value })
                        }
                        placeholder="e.g. STU-2026-8942"
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Informational tip */}
              <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-100 flex items-start gap-2.5 text-xs text-blue-900">
                <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p>
                  Changes will sync across the entire app, updating your active listings and contact links immediately.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  icon={Check}
                >
                  Save Profile
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

