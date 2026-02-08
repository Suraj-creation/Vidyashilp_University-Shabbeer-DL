import React, { useState, useEffect } from 'react';
import { assignmentAPI, courseAPI, lectureAPI } from '../../services/api';
import { useToast, useConfirm } from '../../context/ToastContext';
import './ManagerPage.css';

const AssignmentManager = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    course: '', assignmentNumber: '', title: '', description: '', learningObjectives: [''],
    requirements: [''], relatedLectures: [], releaseDate: '', dueDate: '', totalPoints: '',
    status: 'Upcoming', submissionFormat: '', rubric: [{ criteria: '', points: '', description: '' }]
  });

  useEffect(() => { loadCourses(); }, []);
  useEffect(() => { if (selectedCourse) { loadAssignments(); loadLectures(); } }, [selectedCourse]);

  const loadCourses = async () => { try { const response = await courseAPI.getAll(); setCourses(response.data.data || []); } catch (error) { console.error('Error:', error); } };
  const loadLectures = async () => { if (!selectedCourse) return; try { const response = await lectureAPI.getByCourse(selectedCourse); setLectures(response.data.data || []); } catch (error) { console.error('Error:', error); } };
  const loadAssignments = async () => { if (!selectedCourse) return; try { const response = await assignmentAPI.getAllByCourse(selectedCourse); setAssignments(response.data.data || []); } catch (error) { console.error('Error:', error); } };

  const handleInputChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
  const handleArrayChange = (field, index, value) => { setFormData(prev => ({ ...prev, [field]: prev[field].map((item, i) => i === index ? value : item) })); };
  const addArrayItem = (field) => { setFormData(prev => ({ ...prev, [field]: [...prev[field], ''] })); };
  const removeArrayItem = (field, index) => { setFormData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) })); };

  const handleRubricChange = (index, field, value) => { setFormData(prev => ({ ...prev, rubric: prev.rubric.map((item, i) => i === index ? { ...item, [field]: value } : item) })); };
  const addRubricItem = () => { setFormData(prev => ({ ...prev, rubric: [...prev.rubric, { criteria: '', points: '', description: '' }] })); };
  const removeRubricItem = (index) => { setFormData(prev => ({ ...prev, rubric: prev.rubric.filter((_, i) => i !== index) })); };

  const handleLectureToggle = (lectureId) => { setFormData(prev => ({ ...prev, relatedLectures: prev.relatedLectures.includes(lectureId) ? prev.relatedLectures.filter(id => id !== lectureId) : [...prev.relatedLectures, lectureId] })); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSubmit = { ...formData, courseId: selectedCourse, learningObjectives: formData.learningObjectives.filter(obj => obj.trim()), requirements: formData.requirements.filter(req => req.trim()), rubric: formData.rubric.filter(r => r.criteria.trim()), isPublished: true };
      if (editingId) { await assignmentAPI.update(editingId, dataToSubmit); toast.success('Assignment updated!'); }
      else { await assignmentAPI.create(dataToSubmit); toast.success('Assignment created!'); }
      resetForm(); loadAssignments();
    } catch (error) { console.error('Error:', error); toast.error('Failed to save'); }
  };

  const handleEdit = (a) => {
    setFormData({ course: a.course?._id || a.course || '', assignmentNumber: a.assignmentNumber || '', title: a.title || '', description: a.description || '', learningObjectives: a.learningObjectives?.length ? a.learningObjectives : [''], requirements: a.requirements?.length ? a.requirements : [''], relatedLectures: a.relatedLectures?.map(l => l._id || l) || [], releaseDate: a.releaseDate ? a.releaseDate.split('T')[0] : '', dueDate: a.dueDate ? a.dueDate.split('T')[0] : '', totalPoints: a.totalPoints || '', status: a.status || 'Upcoming', submissionFormat: a.submissionFormat || '', rubric: a.rubric?.length ? a.rubric : [{ criteria: '', points: '', description: '' }] });
    setEditingId(a._id); setShowForm(true);
  };

  const handleDelete = async (id) => { const ok = await confirm('Are you sure you want to delete this assignment?'); if (ok) { try { await assignmentAPI.delete(id); toast.success('Deleted!'); loadAssignments(); } catch (error) { toast.error('Failed to delete'); } } };
  const resetForm = () => { setFormData({ course: '', assignmentNumber: '', title: '', description: '', learningObjectives: [''], requirements: [''], relatedLectures: [], releaseDate: '', dueDate: '', totalPoints: '', status: 'Upcoming', submissionFormat: '', rubric: [{ criteria: '', points: '', description: '' }] }); setEditingId(null); setShowForm(false); };

  return (
    <div className="manager-page">
      <div className="page-header"><h1>📝 Assignment Manager</h1><button className="btn-primary" onClick={() => setShowForm(!showForm)} disabled={!selectedCourse}>{showForm ? '✕ Cancel' : '+ Add New Assignment'}</button></div>
      <div className="course-selector"><label>Select Course:</label><select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}><option value="">Select a course...</option>{courses.map(c => <option key={c._id} value={c._id}>{c.courseCode} - {c.courseTitle}</option>)}</select></div>
      {showForm && <div className="form-card"><h3>{editingId ? 'Edit' : 'Create'} Assignment</h3><form onSubmit={handleSubmit}><div className="form-row"><div className="form-group"><label>Assignment # *</label><input type="number" name="assignmentNumber" value={formData.assignmentNumber} onChange={handleInputChange} required /></div><div className="form-group"><label>Title *</label><input type="text" name="title" value={formData.title} onChange={handleInputChange} required /></div></div><div className="form-group"><label>Description *</label><textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" required /></div><div className="form-group"><label>Learning Objectives</label>{formData.learningObjectives.map((obj, i) => <div key={i} className="array-item"><input type="text" value={obj} onChange={(e) => handleArrayChange('learningObjectives', i, e.target.value)} />{formData.learningObjectives.length > 1 && <button type="button" onClick={() => removeArrayItem('learningObjectives', i)} className="btn-remove">✕</button>}</div>)}<button type="button" onClick={() => addArrayItem('learningObjectives')} className="btn-add">+ Add Objective</button></div><div className="form-group"><label>Requirements</label>{formData.requirements.map((r, i) => <div key={i} className="array-item"><input type="text" value={r} onChange={(e) => handleArrayChange('requirements', i, e.target.value)} />{formData.requirements.length > 1 && <button type="button" onClick={() => removeArrayItem('requirements', i)} className="btn-remove">✕</button>}</div>)}<button type="button" onClick={() => addArrayItem('requirements')} className="btn-add">+ Add Requirement</button></div><div className="form-group"><label>Related Lectures</label><div className="checkbox-group">{lectures.map(l => <label key={l._id} className="checkbox-label"><input type="checkbox" checked={formData.relatedLectures.includes(l._id)} onChange={() => handleLectureToggle(l._id)} />Lecture {l.lectureNumber}: {l.title}</label>)}</div></div><div className="form-row"><div className="form-group"><label>Release Date *</label><input type="date" name="releaseDate" value={formData.releaseDate} onChange={handleInputChange} required /></div><div className="form-group"><label>Due Date *</label><input type="date" name="dueDate" value={formData.dueDate} onChange={handleInputChange} required /></div><div className="form-group"><label>Total Points *</label><input type="number" name="totalPoints" value={formData.totalPoints} onChange={handleInputChange} required /></div></div><div className="form-row"><div className="form-group"><label>Status</label><select name="status" value={formData.status} onChange={handleInputChange}><option value="Upcoming">Upcoming</option><option value="Active">Active</option><option value="Graded">Graded</option><option value="Past Due">Past Due</option></select></div><div className="form-group"><label>Submission Format</label><input type="text" name="submissionFormat" value={formData.submissionFormat} onChange={handleInputChange} /></div></div><div className="form-group"><label>Grading Rubric</label>{formData.rubric.map((item, i) => <div key={i} className="nested-item"><input type="text" value={item.criteria} onChange={(e) => handleRubricChange(i, 'criteria', e.target.value)} placeholder="Criteria" /><input type="number" value={item.points} onChange={(e) => handleRubricChange(i, 'points', e.target.value)} placeholder="Points" style={{width:'100px'}} /><input type="text" value={item.description} onChange={(e) => handleRubricChange(i, 'description', e.target.value)} placeholder="Description" />{formData.rubric.length > 1 && <button type="button" onClick={() => removeRubricItem(i)} className="btn-remove">✕</button>}</div>)}<button type="button" onClick={addRubricItem} className="btn-add">+ Add Rubric</button></div><div className="form-actions"><button type="submit" className="btn-primary">{editingId ? '✓ Update Assignment' : '+ Create Assignment'}</button><button type="button" className="btn-secondary" onClick={resetForm}>✕ Cancel</button></div></form></div>}
      {selectedCourse && <div className="list-card"><h3>Assignments ({assignments.length})</h3>{assignments.length === 0 ? <p className="empty-message">No assignments yet.</p> : <table><thead><tr><th>#</th><th>Title</th><th>Due Date</th><th>Points</th><th>Status</th><th>Actions</th></tr></thead><tbody>{assignments.map(a => <tr key={a._id}><td><strong>{a.assignmentNumber}</strong></td><td>{a.title}</td><td>{new Date(a.dueDate).toLocaleDateString()}</td><td>{a.totalPoints}</td><td><span className={'badge ' + (a.status === 'Active' || a.status === 'Graded' ? 'badge-success' : a.status === 'Past Due' ? 'badge-danger' : 'badge-warning')}>{a.status}</span></td><td><button className="btn-edit" onClick={() => handleEdit(a)}>Edit</button><button className="btn-delete" onClick={() => handleDelete(a._id)}>Delete</button></td></tr>)}</tbody></table>}</div>}
    </div>
  );
};

export default AssignmentManager;