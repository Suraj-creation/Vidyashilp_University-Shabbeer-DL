import React, { useState, useEffect } from 'react';
import { taAPI, courseAPI } from '../../services/api';
import { useToast, useConfirm } from '../../context/ToastContext';
import './ManagerPage.css';

const TAManager = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const [tas, setTas] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    courseId: '', firstName: '', lastName: '', email: '', lab: '', officeHours: '',
    availableDays: [], responsibilities: [''], photoUrl: '', contactPreference: 'Email', isActive: true, order: 0
  });

  useEffect(() => { loadCourses(); }, []);
  useEffect(() => {
    if (selectedCourse) loadTAs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourse]);

  const loadCourses = async () => {
    try {
      const response = await courseAPI.getAll();
      setCourses(response.data.data || []);
    } catch (error) { console.error('Error loading courses:', error); }
  };

  const loadTAs = async () => {
    if (!selectedCourse) return;
    try {
      const response = await taAPI.getByCourse(selectedCourse);
      setTas(response.data.data || []);
    } catch (error) { console.error('Error loading TAs:', error); }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day]
    }));
  };

  const handleArrayChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      responsibilities: prev.responsibilities.map((item, i) => i === index ? value : item)
    }));
  };

  const addResponsibility = () => {
    setFormData(prev => ({ ...prev, responsibilities: [...prev.responsibilities, ''] }));
  };

  const removeResponsibility = (index) => {
    setFormData(prev => ({ ...prev, responsibilities: prev.responsibilities.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSubmit = { ...formData, courseId: selectedCourse, responsibilities: formData.responsibilities.filter(r => r.trim()) };
      if (editingId) {
        await taAPI.update(editingId, dataToSubmit);
        toast.success('TA updated successfully!');
      } else {
        await taAPI.create(dataToSubmit);
        toast.success('TA created successfully!');
      }
      resetForm();
      loadTAs();
    } catch (error) { console.error('Error saving TA:', error); toast.error('Failed to save TA'); }
  };

  const handleEdit = (ta) => {
    setFormData({
      courseId: ta.courseId?._id || ta.courseId || '', firstName: ta.firstName || '', lastName: ta.lastName || '',
      email: ta.email || '', lab: ta.lab || '', officeHours: ta.officeHours || '',
      availableDays: ta.availableDays || [], responsibilities: ta.responsibilities?.length ? ta.responsibilities : [''],
      photoUrl: ta.photoUrl || '', contactPreference: ta.contactPreference || 'Email',
      isActive: ta.isActive !== undefined ? ta.isActive : true, order: ta.order || 0
    });
    setEditingId(ta._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const ok = await confirm('Are you sure you want to delete this TA?');
    if (ok) {
      try {
        await taAPI.delete(id);
        toast.success('TA deleted successfully!');
        loadTAs();
      } catch (error) { console.error('Error deleting TA:', error); toast.error('Failed to delete TA'); }
    }
  };

  const resetForm = () => {
    setFormData({
      courseId: '', firstName: '', lastName: '', email: '', lab: '', officeHours: '',
      availableDays: [], responsibilities: [''], photoUrl: '', contactPreference: 'Email', isActive: true, order: 0
    });
    setEditingId(null);
    setShowForm(false);
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="manager-page">
      <div className="page-header">
        <h2>👥 Teaching Assistant Manager</h2>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)} disabled={!selectedCourse}>
          {showForm ? '✕ Cancel' : '➕ Add New TA'}
        </button>
      </div>

      <div className="course-selector">
        <label>Select Course:</label>
        <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
          <option value="">-- Choose a course --</option>
          {courses.map(course => (
            <option key={course._id} value={course._id}>{course.courseCode} - {course.courseTitle}</option>
          ))}
        </select>
      </div>

      {showForm && (
        <div className="form-card">
          <h3>{editingId ? 'Edit TA' : 'Create New TA'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>First Name *</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Last Name *</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email *</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Lab</label>
                <input type="text" name="lab" value={formData.lab} onChange={handleInputChange} placeholder="e.g., Lab A" />
              </div>
            </div>

            <div className="form-group">
              <label>Office Hours</label>
              <input type="text" name="officeHours" value={formData.officeHours} onChange={handleInputChange} placeholder="e.g., Mon/Wed 2:00-3:00 PM" />
            </div>

            <div className="form-group">
              <label>Available Days</label>
              <div className="checkbox-group">
                {days.map(day => (
                  <label key={day} className="checkbox-label">
                    <input type="checkbox" checked={formData.availableDays.includes(day)} onChange={() => handleDayToggle(day)} />
                    {day}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Responsibilities</label>
              {formData.responsibilities.map((resp, index) => (
                <div key={index} className="array-item">
                  <input type="text" value={resp} onChange={(e) => handleArrayChange(index, e.target.value)} placeholder={`Responsibility ${index + 1}`} />
                  {formData.responsibilities.length > 1 && (
                    <button type="button" onClick={() => removeResponsibility(index)} className="btn-remove">✕</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addResponsibility} className="btn-secondary">+ Add Responsibility</button>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Photo URL</label>
                <input type="url" name="photoUrl" value={formData.photoUrl} onChange={handleInputChange} placeholder="https://..." />
              </div>
              <div className="form-group">
                <label>Contact Preference</label>
                <select name="contactPreference" value={formData.contactPreference} onChange={handleInputChange}>
                  <option value="Email">Email</option>
                  <option value="Office Hours">Office Hours</option>
                  <option value="Slack">Slack</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Display Order</label>
                <input type="number" name="order" value={formData.order} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} />
                  Active
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">{editingId ? 'Update TA' : 'Create TA'}</button>
              <button type="button" className="btn-secondary" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {selectedCourse && (
        <div className="list-card">
          <h3>Teaching Assistants ({tas.length})</h3>
          {tas.length === 0 ? (
            <p className="empty-message">No TAs yet. Create your first TA!</p>
          ) : (
            <table>
              <thead>
                <tr><th>Name</th><th>Email</th><th>Lab</th><th>Office Hours</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {tas.map(ta => (
                  <tr key={ta._id}>
                    <td><strong>{ta.firstName} {ta.lastName}</strong></td>
                    <td>{ta.email}</td>
                    <td>{ta.lab}</td>
                    <td>{ta.officeHours}</td>
                    <td><span className={`badge ${ta.isActive ? 'badge-success' : 'badge-danger'}`}>{ta.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <button className="btn-edit" onClick={() => handleEdit(ta)}>Edit</button>
                      <button className="btn-delete" onClick={() => handleDelete(ta._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default TAManager;