import React, { useState, useEffect } from 'react';
import { examAPI, courseAPI, lectureAPI } from '../../services/api';
import { useToast, useConfirm } from '../../context/ToastContext';
import './ManagerPage.css';

const ExamManager = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    examType: 'Midterm', title: '', date: '', time: { start: '', end: '' },
    location: '', duration: '', totalMarks: '', format: '', syllabus: [''],
    coveredLectures: [], guidelines: [''], preparationResources: [{ title: '', url: '' }]
  });

  useEffect(() => { loadCourses(); }, []);
  useEffect(() => { if (selectedCourse) { loadExams(); loadLectures(); } }, [selectedCourse]);

  const loadCourses = async () => { try { const res = await courseAPI.getAll(); setCourses(res.data.data || []); } catch (e) { console.error(e); } };
  const loadLectures = async () => { if (!selectedCourse) return; try { const res = await lectureAPI.getByCourse(selectedCourse); setLectures(res.data.data || []); } catch (e) { console.error(e); } };
  const loadExams = async () => { if (!selectedCourse) return; try { const res = await examAPI.getAllByCourse(selectedCourse); setExams(res.data.data || []); } catch (e) { console.error(e); } };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('time.')) {
      const field = name.split('.')[1];
      setFormData(p => ({ ...p, time: { ...p.time, [field]: value } }));
    } else {
      setFormData(p => ({ ...p, [name]: value }));
    }
  };

  const handleArrayChange = (field, index, value) => { setFormData(p => ({ ...p, [field]: p[field].map((item, i) => i === index ? value : item) })); };
  const addArrayItem = (field) => { setFormData(p => ({ ...p, [field]: [...p[field], ''] })); };
  const removeArrayItem = (field, index) => { setFormData(p => ({ ...p, [field]: p[field].filter((_, i) => i !== index) })); };
  const handleResourceChange = (index, field, value) => { setFormData(p => ({ ...p, preparationResources: p.preparationResources.map((item, i) => i === index ? { ...item, [field]: value } : item) })); };
  const addResource = () => { setFormData(p => ({ ...p, preparationResources: [...p.preparationResources, { title: '', url: '' }] })); };
  const removeResource = (index) => { setFormData(p => ({ ...p, preparationResources: p.preparationResources.filter((_, i) => i !== index) })); };
  const handleLectureToggle = (lectureId) => { setFormData(p => ({ ...p, coveredLectures: p.coveredLectures.includes(lectureId) ? p.coveredLectures.filter(id => id !== lectureId) : [...p.coveredLectures, lectureId] })); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...formData, courseId: selectedCourse, syllabus: formData.syllabus.filter(s => s.trim()), guidelines: formData.guidelines.filter(g => g.trim()), preparationResources: formData.preparationResources.filter(r => r.title.trim()), isPublished: true };
      if (editingId) { await examAPI.update(editingId, data); toast.success('Exam updated!'); }
      else { await examAPI.create(data); toast.success('Exam created!'); }
      resetForm(); loadExams();
    } catch (e) { console.error(e); toast.error('Failed to save'); }
  };

  const handleEdit = (exam) => {
    setFormData({ examType: exam.examType || 'Midterm', title: exam.title || '', date: exam.date ? exam.date.split('T')[0] : '', time: { start: exam.time?.start || '', end: exam.time?.end || '' }, location: exam.location || '', duration: exam.duration || '', totalMarks: exam.totalMarks || '', format: exam.format || '', syllabus: exam.syllabus?.length ? exam.syllabus : [''], coveredLectures: exam.coveredLectures?.map(l => l._id || l) || [], guidelines: exam.guidelines?.length ? exam.guidelines : [''], preparationResources: exam.preparationResources?.length ? exam.preparationResources : [{ title: '', url: '' }] });
    setEditingId(exam._id); setShowForm(true);
  };

  const handleDelete = async (id) => { const ok = await confirm('Delete this exam?'); if (ok) { try { await examAPI.delete(id); toast.success('Deleted!'); loadExams(); } catch (e) { toast.error('Failed to delete'); } } };
  const resetForm = () => { setFormData({ examType: 'Midterm', title: '', date: '', time: { start: '', end: '' }, location: '', duration: '', totalMarks: '', format: '', syllabus: [''], coveredLectures: [], guidelines: [''], preparationResources: [{ title: '', url: '' }] }); setEditingId(null); setShowForm(false); };

  return (
    <div className="manager-page">
      <div className="page-header"><h1>📊 Exam Manager</h1><button className="btn-primary" onClick={() => setShowForm(!showForm)} disabled={!selectedCourse}>{showForm ? '✕ Cancel' : '+ Add New Exam'}</button></div>
      <div className="course-selector"><label>Select Course:</label><select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}><option value="">Select a course...</option>{courses.map(c => <option key={c._id} value={c._id}>{c.courseCode} - {c.courseTitle}</option>)}</select></div>
      {showForm && <div className="form-card"><h3>{editingId ? 'Edit' : 'Create'} Exam</h3><form onSubmit={handleSubmit}><div className="form-row"><div className="form-group"><label>Type *</label><select name="examType" value={formData.examType} onChange={handleInputChange}><option value="Midterm">Midterm</option><option value="End-Semester">End-Semester</option><option value="Quiz">Quiz</option><option value="Final">Final</option></select></div><div className="form-group"><label>Title *</label><input type="text" name="title" value={formData.title} onChange={handleInputChange} required /></div></div><div className="form-row"><div className="form-group"><label>Date *</label><input type="date" name="date" value={formData.date} onChange={handleInputChange} required /></div><div className="form-group"><label>Start *</label><input type="time" name="time.start" value={formData.time.start} onChange={handleInputChange} required /></div><div className="form-group"><label>End *</label><input type="time" name="time.end" value={formData.time.end} onChange={handleInputChange} required /></div></div><div className="form-row"><div className="form-group"><label>Location *</label><input type="text" name="location" value={formData.location} onChange={handleInputChange} required /></div><div className="form-group"><label>Duration</label><input type="text" name="duration" value={formData.duration} onChange={handleInputChange} /></div><div className="form-group"><label>Total Marks *</label><input type="number" name="totalMarks" value={formData.totalMarks} onChange={handleInputChange} required /></div></div><div className="form-group"><label>Format</label><input type="text" name="format" value={formData.format} onChange={handleInputChange} /></div><div className="form-group"><label>Syllabus</label>{formData.syllabus.map((t, i) => <div key={i} className="array-item"><input type="text" value={t} onChange={(e) => handleArrayChange('syllabus', i, e.target.value)} />{formData.syllabus.length > 1 && <button type="button" onClick={() => removeArrayItem('syllabus', i)} className="btn-remove">✕</button>}</div>)}<button type="button" onClick={() => addArrayItem('syllabus')} className="btn-add">+ Add Syllabus Topic</button></div><div className="form-group"><label>Lectures</label><div className="checkbox-group">{lectures.map(l => <label key={l._id} className="checkbox-label"><input type="checkbox" checked={formData.coveredLectures.includes(l._id)} onChange={() => handleLectureToggle(l._id)} />L{l.lectureNumber}: {l.title}</label>)}</div></div><div className="form-group"><label>Guidelines</label>{formData.guidelines.map((g, i) => <div key={i} className="array-item"><input type="text" value={g} onChange={(e) => handleArrayChange('guidelines', i, e.target.value)} />{formData.guidelines.length > 1 && <button type="button" onClick={() => removeArrayItem('guidelines', i)} className="btn-remove">✕</button>}</div>)}<button type="button" onClick={() => addArrayItem('guidelines')} className="btn-add">+ Add Guideline</button></div><div className="form-group"><label>Prep Resources</label>{formData.preparationResources.map((r, i) => <div key={i} className="nested-item"><input type="text" value={r.title} onChange={(e) => handleResourceChange(i, 'title', e.target.value)} placeholder="Title" /><input type="url" value={r.url} onChange={(e) => handleResourceChange(i, 'url', e.target.value)} placeholder="URL" />{formData.preparationResources.length > 1 && <button type="button" onClick={() => removeResource(i)} className="btn-remove">✕</button>}</div>)}<button type="button" onClick={addResource} className="btn-add">+ Add Resource</button></div><div className="form-actions"><button type="submit" className="btn-primary">{editingId ? '✓ Update Exam' : '+ Create Exam'}</button><button type="button" className="btn-secondary" onClick={resetForm}>✕ Cancel</button></div></form></div>}
      {selectedCourse && <div className="list-card"><h3>Exams ({exams.length})</h3>{exams.length === 0 ? <p className="empty-message">No exams yet.</p> : <table><thead><tr><th>Type</th><th>Title</th><th>Date</th><th>Time</th><th>Location</th><th>Marks</th><th>Actions</th></tr></thead><tbody>{exams.map(e => <tr key={e._id}><td><span className="badge badge-warning">{e.examType}</span></td><td><strong>{e.title}</strong></td><td>{new Date(e.date).toLocaleDateString()}</td><td>{e.time?.start} - {e.time?.end}</td><td>{e.location}</td><td>{e.totalMarks}</td><td><button className="btn-edit" onClick={() => handleEdit(e)}>Edit</button><button className="btn-delete" onClick={() => handleDelete(e._id)}>Delete</button></td></tr>)}</tbody></table>}</div>}
    </div>
  );
};

export default ExamManager;