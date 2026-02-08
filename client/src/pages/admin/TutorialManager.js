import React, { useState, useEffect } from 'react';
import { tutorialAPI, courseAPI, lectureAPI } from '../../services/api';
import { useToast, useConfirm } from '../../context/ToastContext';
import './ManagerPage.css';

const TutorialManager = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const [tutorials, setTutorials] = useState([]);
  const [courses, setCourses] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    tutorialNumber: '', title: '', briefSummary: '', description: '', learningObjectives: [''], topicsCovered: [''], coveredInLectures: [],
    whyItMatters: '', videos: [{ title: '', url: '', duration: '' }], slides: [{ title: '', url: '' }],
    practiceProblems: [{ title: '', url: '', solutionsUrl: '' }], isPublished: true
  });

  useEffect(() => { loadCourses(); }, []);
  useEffect(() => { if (selectedCourse) { loadTutorials(); loadLectures(); } }, [selectedCourse]);

  const loadCourses = async () => { try { const r = await courseAPI.getAll(); const d = r.data.data || []; setCourses(d); if (d.length > 0) setSelectedCourse(d[0]._id); } catch (e) { console.error(e); } };
  const loadLectures = async () => { if (!selectedCourse) return; try { const r = await lectureAPI.getByCourse(selectedCourse); setLectures(r.data.data || []); } catch (e) { console.error(e); } };
  const loadTutorials = async () => { if (!selectedCourse) return; try { const r = await tutorialAPI.getAllByCourse(selectedCourse); setTutorials(r.data.data || []); } catch (e) { console.error(e); } };

  const handleInputChange = (e) => { const { name, value, type, checked } = e.target; setFormData(p => ({ ...p, [name]: type === 'checkbox' ? checked : value })); };
  const handleArrayChange = (f, i, v) => { setFormData(p => ({ ...p, [f]: p[f].map((item, idx) => idx === i ? v : item) })); };
  const addArrayItem = (f) => { setFormData(p => ({ ...p, [f]: [...p[f], ''] })); };
  const removeArrayItem = (f, i) => { if (formData[f].length > 1) setFormData(p => ({ ...p, [f]: p[f].filter((_, idx) => idx !== i) })); };

  const handleVideoChange = (i, f, v) => { setFormData(p => ({ ...p, videos: p.videos.map((item, idx) => idx === i ? { ...item, [f]: v } : item) })); };
  const addVideo = () => { setFormData(p => ({ ...p, videos: [...p.videos, { title: '', url: '', duration: '' }] })); };
  const removeVideo = (i) => { if (formData.videos.length > 1) setFormData(p => ({ ...p, videos: p.videos.filter((_, idx) => idx !== i) })); };

  const handleSlideChange = (i, f, v) => { setFormData(p => ({ ...p, slides: p.slides.map((item, idx) => idx === i ? { ...item, [f]: v } : item) })); };
  const addSlide = () => { setFormData(p => ({ ...p, slides: [...p.slides, { title: '', url: '' }] })); };
  const removeSlide = (i) => { if (formData.slides.length > 1) setFormData(p => ({ ...p, slides: p.slides.filter((_, idx) => idx !== i) })); };

  const handleProblemChange = (i, f, v) => { setFormData(p => ({ ...p, practiceProblems: p.practiceProblems.map((item, idx) => idx === i ? { ...item, [f]: v } : item) })); };
  const addProblem = () => { setFormData(p => ({ ...p, practiceProblems: [...p.practiceProblems, { title: '', url: '', solutionsUrl: '' }] })); };
  const removeProblem = (i) => { if (formData.practiceProblems.length > 1) setFormData(p => ({ ...p, practiceProblems: p.practiceProblems.filter((_, idx) => idx !== i) })); };

  const handleLectureToggle = (id) => { setFormData(p => ({ ...p, coveredInLectures: p.coveredInLectures.includes(id) ? p.coveredInLectures.filter(x => x !== id) : [...p.coveredInLectures, id] })); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...formData, courseId: selectedCourse, learningObjectives: formData.learningObjectives.filter(o => o.trim()), topicsCovered: formData.topicsCovered.filter(t => t.trim()), videos: formData.videos.filter(v => v.title.trim() || v.url.trim()), slides: formData.slides.filter(s => s.title.trim() || s.url.trim()), practiceProblems: formData.practiceProblems.filter(p => p.title.trim()) };
      if (editingId) { await tutorialAPI.update(editingId, data); toast.success('Updated!'); }
      else { await tutorialAPI.create(data); toast.success('Created!'); }
      resetForm(); loadTutorials();
    } catch (e) { console.error(e); toast.error('Failed to save'); }
  };

  const handleEdit = (t) => {
    setFormData({ tutorialNumber: t.tutorialNumber || '', title: t.title || '', briefSummary: t.briefSummary || '', description: t.description || '', learningObjectives: t.learningObjectives?.length ? t.learningObjectives : [''], topicsCovered: t.topicsCovered?.length ? t.topicsCovered : [''], coveredInLectures: t.coveredInLectures?.map(l => l._id || l) || [], whyItMatters: t.whyItMatters || '', videos: t.videos?.length ? t.videos : [{ title: '', url: '', duration: '' }], slides: t.slides?.length ? t.slides : [{ title: '', url: '' }], practiceProblems: t.practiceProblems?.length ? t.practiceProblems : [{ title: '', url: '', solutionsUrl: '' }], isPublished: t.isPublished !== undefined ? t.isPublished : true });
    setEditingId(t._id); setShowForm(true);
  };

  const handleDelete = async (id) => { const ok = await confirm('Delete this tutorial?'); if (ok) { try { await tutorialAPI.delete(id); toast.success('Deleted!'); loadTutorials(); } catch (e) { toast.error('Failed to delete'); } } };
  const resetForm = () => { setFormData({ tutorialNumber: '', title: '', briefSummary: '', description: '', learningObjectives: [''], topicsCovered: [''], coveredInLectures: [], whyItMatters: '', videos: [{ title: '', url: '', duration: '' }], slides: [{ title: '', url: '' }], practiceProblems: [{ title: '', url: '', solutionsUrl: '' }], isPublished: true }); setEditingId(null); setShowForm(false); };

  return (
    <div className="manager-page">
      <div className="page-header"><h1>🎯 Tutorial Manager</h1><button className="btn-primary" onClick={() => setShowForm(!showForm)} disabled={!selectedCourse}>{showForm ? '✕ Cancel' : '+ Add New Tutorial'}</button></div>
      <div className="course-selector"><label>Select Course:</label><select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}><option value="">Select a course...</option>{courses.map(c => <option key={c._id} value={c._id}>{c.courseCode} - {c.courseTitle}</option>)}</select></div>
      {showForm && <div className="form-card"><h2>{editingId ? 'Edit' : 'Create'} Tutorial</h2><form onSubmit={handleSubmit}><div className="form-section"><h3 className="section-title">Basic Info</h3><div className="form-row"><div className="form-group"><label>Tutorial # *</label><input type="number" name="tutorialNumber" value={formData.tutorialNumber} onChange={handleInputChange} required min="1" /></div><div className="form-group"><label>Title *</label><input type="text" name="title" value={formData.title} onChange={handleInputChange} required /></div></div><div className="form-group"><label>Brief Summary (1-2 sentences, max 300 chars)</label><textarea name="briefSummary" value={formData.briefSummary} onChange={handleInputChange} rows="2" maxLength="300" placeholder="A concise 1-2 sentence overview of this tutorial..." /></div><div className="form-group"><label>Full Description (supports markdown/formatting)</label><textarea name="description" value={formData.description} onChange={handleInputChange} rows="5" placeholder="Detailed description with formatting, code blocks, lists, etc..." /></div><div className="form-group"><label>Why It Matters</label><textarea name="whyItMatters" value={formData.whyItMatters} onChange={handleInputChange} rows="2" /></div></div><div className="form-section"><h3 className="section-title">Learning Objectives (5-10 clear goals)</h3><p style={{fontSize:'0.85rem',color:'#666',marginBottom:'12px'}}>Add specific, actionable objectives that students will achieve</p>{formData.learningObjectives.map((o, i) => <div key={i} className="array-item"><input type="text" value={o} onChange={(e) => handleArrayChange('learningObjectives', i, e.target.value)} placeholder="e.g., Implement a neural network from scratch" /><button type="button" onClick={() => removeArrayItem('learningObjectives', i)} className="btn-remove">✕</button></div>)}<button type="button" onClick={() => addArrayItem('learningObjectives')} className="btn-add">+ Add Learning Objective</button></div><div className="form-section"><h3 className="section-title">Topics Covered</h3>{formData.topicsCovered.map((t, i) => <div key={i} className="array-item"><input type="text" value={t} onChange={(e) => handleArrayChange('topicsCovered', i, e.target.value)} /><button type="button" onClick={() => removeArrayItem('topicsCovered', i)} className="btn-remove">✕</button></div>)}<button type="button" onClick={() => addArrayItem('topicsCovered')} className="btn-add">+ Add Topic</button></div><div className="form-section"><h3 className="section-title">Related Lectures</h3><div className="checkbox-group">{lectures.length === 0 ? <p className="empty-message">No lectures available.</p> : lectures.map(l => <label key={l._id} className="checkbox-label"><input type="checkbox" checked={formData.coveredInLectures.includes(l._id)} onChange={() => handleLectureToggle(l._id)} /><span>L{l.lectureNumber}: {l.title}</span></label>)}</div></div><div className="form-section"><h3 className="section-title">Videos</h3>{formData.videos.map((v, i) => <div key={i} className="nested-item"><input type="text" value={v.title} onChange={(e) => handleVideoChange(i, 'title', e.target.value)} placeholder="Title" style={{flex:2}} /><input type="url" value={v.url} onChange={(e) => handleVideoChange(i, 'url', e.target.value)} placeholder="URL" style={{flex:3}} /><input type="text" value={v.duration} onChange={(e) => handleVideoChange(i, 'duration', e.target.value)} placeholder="Duration" style={{width:'100px',flex:'none'}} /><button type="button" onClick={() => removeVideo(i)} className="btn-remove">✕</button></div>)}<button type="button" onClick={addVideo} className="btn-add">+ Add Video</button></div><div className="form-section"><h3 className="section-title">Slides</h3>{formData.slides.map((s, i) => <div key={i} className="nested-item"><input type="text" value={s.title} onChange={(e) => handleSlideChange(i, 'title', e.target.value)} placeholder="Title" style={{flex:1}} /><input type="url" value={s.url} onChange={(e) => handleSlideChange(i, 'url', e.target.value)} placeholder="URL" style={{flex:2}} /><button type="button" onClick={() => removeSlide(i)} className="btn-remove">✕</button></div>)}<button type="button" onClick={addSlide} className="btn-add">+ Add Slides</button></div><div className="form-section"><h3 className="section-title">Practice Problems</h3>{formData.practiceProblems.map((p, i) => <div key={i} className="nested-item"><input type="text" value={p.title} onChange={(e) => handleProblemChange(i, 'title', e.target.value)} placeholder="Title" style={{flex:1}} /><input type="url" value={p.url} onChange={(e) => handleProblemChange(i, 'url', e.target.value)} placeholder="Problem URL" style={{flex:1}} /><input type="url" value={p.solutionsUrl} onChange={(e) => handleProblemChange(i, 'solutionsUrl', e.target.value)} placeholder="Solutions URL" style={{flex:1}} /><button type="button" onClick={() => removeProblem(i)} className="btn-remove">✕</button></div>)}<button type="button" onClick={addProblem} className="btn-add">+ Add Problem</button></div><div className="form-section"><div className="form-group"><label className="checkbox-label"><input type="checkbox" name="isPublished" checked={formData.isPublished} onChange={handleInputChange} /><span>Publish immediately</span></label></div></div><div className="form-actions"><button type="submit" className="btn-primary">{editingId ? '✓ Update Tutorial' : '+ Create Tutorial'}</button><button type="button" className="btn-secondary" onClick={resetForm}>✕ Cancel</button></div></form></div>}
      {selectedCourse && <div className="list-card"><h2>Tutorials ({tutorials.length})</h2>{tutorials.length === 0 ? <p className="empty-message">No tutorials yet.</p> : <div className="table-container"><table><thead><tr><th>#</th><th>Title</th><th>Topics</th><th>Videos</th><th>Slides</th><th>Problems</th><th>Status</th><th>Actions</th></tr></thead><tbody>{tutorials.map(t => <tr key={t._id}><td><strong>{t.tutorialNumber}</strong></td><td><strong>{t.title}</strong><br/><small style={{color:'#666'}}>{t.description?.substring(0,50)}{t.description?.length > 50 ? '...' : ''}</small></td><td>{t.topicsCovered?.length || 0}</td><td>{t.videos?.length || 0}</td><td>{t.slides?.length || 0}</td><td>{t.practiceProblems?.length || 0}</td><td><span className={'badge ' + (t.isPublished ? 'badge-success' : 'badge-warning')}>{t.isPublished ? 'Published' : 'Draft'}</span></td><td className="actions"><button className="btn-edit" onClick={() => handleEdit(t)}>Edit</button><button className="btn-delete" onClick={() => handleDelete(t._id)}>Delete</button></td></tr>)}</tbody></table></div>}</div>}
    </div>
  );
};

export default TutorialManager;