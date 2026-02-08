import React, { useState, useEffect } from 'react';
import { resourceAPI, courseAPI } from '../../services/api';
import { useToast, useConfirm } from '../../context/ToastContext';
import './ManagerPage.css';

const ResourceManager = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const [resources, setResources] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    course: '', title: '', description: '', url: '', category: 'Books',
    author: '', publisher: '', year: '', tags: [''], isPremium: false, icon: '', order: 0
  });

  useEffect(() => { loadCourses(); }, []);
  useEffect(() => {
    if (selectedCourse) loadResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourse]);

  const loadCourses = async () => {
    try {
      const response = await courseAPI.getAll();
      setCourses(response.data.data || []);
    } catch (error) { console.error('Error loading courses:', error); }
  };

  const loadResources = async () => {
    if (!selectedCourse) return;
    try {
      const response = await resourceAPI.getByCourse(selectedCourse);
      setResources(response.data.data || []);
    } catch (error) { console.error('Error loading resources:', error); }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleArrayChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.map((item, i) => i === index ? value : item)
    }));
  };

  const addTag = () => { setFormData(prev => ({ ...prev, tags: [...prev.tags, ''] })); };
  const removeTag = (index) => { setFormData(prev => ({ ...prev, tags: prev.tags.filter((_, i) => i !== index) })); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSubmit = { ...formData, courseId: selectedCourse, tags: formData.tags.filter(t => t.trim()) };
      if (editingId) {
        await resourceAPI.update(editingId, dataToSubmit);
        toast.success('Resource updated successfully!');
      } else {
        await resourceAPI.create(dataToSubmit);
        toast.success('Resource created successfully!');
      }
      resetForm();
      loadResources();
    } catch (error) { console.error('Error saving resource:', error); toast.error('Failed to save resource'); }
  };

  const handleEdit = (resource) => {
    setFormData({
      course: resource.course?._id || resource.course || '', title: resource.title || '', description: resource.description || '',
      url: resource.url || '', category: resource.category || 'Books', author: resource.author || '',
      publisher: resource.publisher || '', year: resource.year || '', tags: resource.tags?.length ? resource.tags : [''],
      isPremium: resource.isPremium || false, icon: resource.icon || '', order: resource.order || 0
    });
    setEditingId(resource._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const ok = await confirm('Are you sure you want to delete this resource?');
    if (ok) {
      try {
        await resourceAPI.delete(id);
        toast.success('Resource deleted successfully!');
        loadResources();
      } catch (error) { console.error('Error deleting resource:', error); toast.error('Failed to delete resource'); }
    }
  };

  const resetForm = () => {
    setFormData({ course: '', title: '', description: '', url: '', category: 'Books',
      author: '', publisher: '', year: '', tags: [''], isPremium: false, icon: '', order: 0 });
    setEditingId(null);
    setShowForm(false);
  };

  const categories = ['Books', 'Online Courses', 'Research Papers', 'Tools & Frameworks', 'Communities', 'Datasets', 'Documentation', 'Other'];

  return (
    <div className="manager-page">
      <div className="page-header">
        <h1>📦 Resource Manager</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)} disabled={!selectedCourse}>
          {showForm ? '✕ Cancel' : '+ Add New Resource'}
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
          <h3>{editingId ? 'Edit Resource' : 'Create New Resource'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title *</label>
              <input type="text" name="title" value={formData.title} onChange={handleInputChange} required />
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>URL *</label>
                <input type="url" name="url" value={formData.url} onChange={handleInputChange} placeholder="https://..." required />
              </div>
              <div className="form-group">
                <label>Category *</label>
                <select name="category" value={formData.category} onChange={handleInputChange}>
                  {categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Author</label>
                <input type="text" name="author" value={formData.author} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Publisher</label>
                <input type="text" name="publisher" value={formData.publisher} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Year</label>
                <input type="text" name="year" value={formData.year} onChange={handleInputChange} placeholder="2026" />
              </div>
            </div>

            <div className="form-group">
              <label>Tags</label>
              {formData.tags.map((tag, index) => (
                <div key={index} className="array-item">
                  <input type="text" value={tag} onChange={(e) => handleArrayChange(index, e.target.value)} placeholder={`Tag ${index + 1}`} />
                  {formData.tags.length > 1 && (<button type="button" onClick={() => removeTag(index)} className="btn-remove">✕</button>)}
                </div>
              ))}
              <button type="button" onClick={addTag} className="btn-add">+ Add Tag</button>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Icon (emoji or URL)</label>
                <input type="text" name="icon" value={formData.icon} onChange={handleInputChange} placeholder="📚" />
              </div>
              <div className="form-group">
                <label>Display Order</label>
                <input type="number" name="order" value={formData.order} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input type="checkbox" name="isPremium" checked={formData.isPremium} onChange={handleInputChange} />
                  Premium Resource
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">{editingId ? '✓ Update Resource' : '+ Create Resource'}</button>
              <button type="button" className="btn-secondary" onClick={resetForm}>✕ Cancel</button>
            </div>
          </form>
        </div>
      )}

      {selectedCourse && (
        <div className="list-card">
          <h3>Resources ({resources.length})</h3>
          {resources.length === 0 ? (
            <p className="empty-message">No resources yet. Create your first resource!</p>
          ) : (
            <table>
              <thead><tr><th>Title</th><th>Category</th><th>URL</th><th>Premium</th><th>Actions</th></tr></thead>
              <tbody>
                {resources.map(resource => (
                  <tr key={resource._id}>
                    <td><strong>{resource.icon} {resource.title}</strong></td>
                    <td>{resource.category}</td>
                    <td><a href={resource.url} target="_blank" rel="noopener noreferrer">View</a></td>
                    <td><span className={`badge ${resource.isPremium ? 'badge-warning' : 'badge-success'}`}>{resource.isPremium ? 'Premium' : 'Free'}</span></td>
                    <td>
                      <button className="btn-edit" onClick={() => handleEdit(resource)}>Edit</button>
                      <button className="btn-delete" onClick={() => handleDelete(resource._id)}>Delete</button>
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

export default ResourceManager;