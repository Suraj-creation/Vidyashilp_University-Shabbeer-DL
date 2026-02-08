import React, { useState, useEffect } from 'react';
import { prerequisiteAPI, courseAPI } from '../../services/api';
import { useToast, useConfirm } from '../../context/ToastContext';
import './ManagerPage.css';

const PrerequisiteManager = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const [prerequisites, setPrerequisites] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    course: '', title: '', courseCode: '', description: '', level: 'Beginner',
    estimatedDuration: '', resources: [{ title: '', url: '', type: 'Video' }]
  });

  useEffect(() => { loadCourses(); }, []);
  useEffect(() => {
    if (selectedCourse) loadPrerequisites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourse]);

  const loadCourses = async () => {
    try {
      const response = await courseAPI.getAll();
      setCourses(response.data.data || []);
    } catch (error) { console.error('Error loading courses:', error); }
  };

  const loadPrerequisites = async () => {
    if (!selectedCourse) return;
    try {
      const response = await prerequisiteAPI.getByCourse(selectedCourse);
      setPrerequisites(response.data.data || []);
    } catch (error) { console.error('Error loading prerequisites:', error); }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleResourceChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      resources: prev.resources.map((item, i) => i === index ? { ...item, [field]: value } : item)
    }));
  };

  const addResource = () => {
    setFormData(prev => ({ ...prev, resources: [...prev.resources, { title: '', url: '', type: 'Video' }] }));
  };

  const removeResource = (index) => {
    setFormData(prev => ({ ...prev, resources: prev.resources.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSubmit = { ...formData, courseId: selectedCourse, resources: formData.resources.filter(r => r.title.trim()) };
      if (editingId) {
        await prerequisiteAPI.update(editingId, dataToSubmit);
        toast.success('Prerequisite updated successfully!');
      } else {
        await prerequisiteAPI.create(dataToSubmit);
        toast.success('Prerequisite created successfully!');
      }
      resetForm();
      loadPrerequisites();
    } catch (error) { console.error('Error saving prerequisite:', error); toast.error('Failed to save prerequisite'); }
  };

  const handleEdit = (prereq) => {
    setFormData({
      course: prereq.course?._id || prereq.course || '', title: prereq.title || '', courseCode: prereq.courseCode || '',
      description: prereq.description || '', level: prereq.level || 'Beginner', estimatedDuration: prereq.estimatedDuration || '',
      resources: prereq.resources?.length ? prereq.resources : [{ title: '', url: '', type: 'Video' }]
    });
    setEditingId(prereq._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const ok = await confirm('Are you sure you want to delete this prerequisite?');
    if (ok) {
      try {
        await prerequisiteAPI.delete(id);
        toast.success('Prerequisite deleted successfully!');
        loadPrerequisites();
      } catch (error) { console.error('Error deleting prerequisite:', error); toast.error('Failed to delete prerequisite'); }
    }
  };

  const resetForm = () => {
    setFormData({ course: '', title: '', courseCode: '', description: '', level: 'Beginner',
      estimatedDuration: '', resources: [{ title: '', url: '', type: 'Video' }] });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="manager-page">
      <div className="page-header">
        <h1>📋 Prerequisite Manager</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)} disabled={!selectedCourse}>
          {showForm ? '✕ Cancel' : '+ Add New Prerequisite'}
        </button>
      </div>

      <div className="course-selector">
        <label>Select Course:</label>
        <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
          <option value="">Select a course...</option>
          {courses.map(course => (<option key={course._id} value={course._id}>{course.courseCode} - {course.courseTitle}</option>))}
        </select>
      </div>

      {showForm && (
        <div className="form-card">
          <h3>{editingId ? 'Edit Prerequisite' : 'Create New Prerequisite'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Title *</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Course Code</label>
                <input type="text" name="courseCode" value={formData.courseCode} onChange={handleInputChange} placeholder="e.g., CS101" />
              </div>
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Level</label>
                <select name="level" value={formData.level} onChange={handleInputChange}>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div className="form-group">
                <label>Estimated Duration</label>
                <input type="text" name="estimatedDuration" value={formData.estimatedDuration} onChange={handleInputChange} placeholder="e.g., 4 weeks" />
              </div>
            </div>

            <div className="form-group">
              <label>Learning Resources</label>
              {formData.resources.map((resource, index) => (
                <div key={index} className="nested-item">
                  <input type="text" value={resource.title} onChange={(e) => handleResourceChange(index, 'title', e.target.value)} placeholder="Resource title" />
                  <input type="url" value={resource.url} onChange={(e) => handleResourceChange(index, 'url', e.target.value)} placeholder="https://..." />
                  <select value={resource.type} onChange={(e) => handleResourceChange(index, 'type', e.target.value)}>
                    <option value="Video">Video</option>
                    <option value="Article">Article</option>
                    <option value="Tutorial">Tutorial</option>
                    <option value="Book">Book</option>
                  </select>
                  {formData.resources.length > 1 && (<button type="button" onClick={() => removeResource(index)} className="btn-remove">✕</button>)}
                </div>
              ))}
              <button type="button" onClick={addResource} className="btn-add">+ Add Resource</button>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">{editingId ? '✓ Update Prerequisite' : '+ Create Prerequisite'}</button>
              <button type="button" className="btn-secondary" onClick={resetForm}>✕ Cancel</button>
            </div>
          </form>
        </div>
      )}

      {selectedCourse && (
        <div className="list-card">
          <h3>Prerequisites ({prerequisites.length})</h3>
          {prerequisites.length === 0 ? (
            <p className="empty-message">No prerequisites yet. Create your first prerequisite!</p>
          ) : (
            <table>
              <thead><tr><th>Title</th><th>Course Code</th><th>Level</th><th>Duration</th><th>Resources</th><th>Actions</th></tr></thead>
              <tbody>
                {prerequisites.map(prereq => (
                  <tr key={prereq._id}>
                    <td><strong>{prereq.title}</strong></td>
                    <td>{prereq.courseCode}</td>
                    <td><span className={`badge ${
                      prereq.level === 'Beginner' ? 'badge-success' :
                      prereq.level === 'Intermediate' ? 'badge-warning' : 'badge-danger'
                    }`}>{prereq.level}</span></td>
                    <td>{prereq.estimatedDuration}</td>
                    <td>{prereq.resources?.length || 0} resources</td>
                    <td>
                      <button className="btn-edit" onClick={() => handleEdit(prereq)}>Edit</button>
                      <button className="btn-delete" onClick={() => handleDelete(prereq._id)}>Delete</button>
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

export default PrerequisiteManager;