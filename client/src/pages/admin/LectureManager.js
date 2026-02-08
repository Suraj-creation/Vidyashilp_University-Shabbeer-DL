import React, { useState, useEffect } from 'react';
import { lectureAPI, courseAPI } from '../../services/api';
import { useToast, useConfirm } from '../../context/ToastContext';
import './ManagerPage.css';

const LectureManager = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const [lectures, setLectures] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    courseId: '',
    lectureNumber: '',
    title: '',
    description: '',
    date: '',
    topicsCovered: [''],
    slides: [{ title: '', url: '' }],
    videos: [{ title: '', url: '', platform: 'YouTube' }],
    readingMaterials: [{ title: '', author: '', year: '', url: '' }],
    isPublished: false
  });

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      loadLectures();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourse]);

  const loadCourses = async () => {
    try {
      const res = await courseAPI.getAll();
      setCourses(res.data.data || []);
      if (res.data.data && res.data.data.length > 0) {
        setSelectedCourse(res.data.data[0]._id);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

  const loadLectures = async () => {
    try {
      const res = await lectureAPI.getAllByCourse(selectedCourse);
      setLectures(res.data.data || []);
    } catch (error) {
      console.error('Error loading lectures:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSubmit = { ...formData, courseId: selectedCourse };
      
      if (editingId) {
        await lectureAPI.update(editingId, dataToSubmit);
        toast.success('Lecture updated successfully!');
      } else {
        await lectureAPI.create(dataToSubmit);
        toast.success('Lecture created successfully!');
      }
      
      resetForm();
      loadLectures();
    } catch (error) {
      console.error('Error saving lecture:', error);
      toast.error('Error saving lecture');
    }
  };

  const handleEdit = (lecture) => {
    setFormData(lecture);
    setEditingId(lecture._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const ok = await confirm('Are you sure you want to delete this lecture?');
    if (ok) {
      try {
        await lectureAPI.delete(id);
        toast.success('Lecture deleted successfully!');
        loadLectures();
      } catch (error) {
        console.error('Error deleting lecture:', error);
        toast.error('Error deleting lecture');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      courseId: '',
      lectureNumber: '',
      title: '',
      description: '',
      date: '',
      topicsCovered: [''],
      slides: [{ title: '', url: '' }],
      videos: [{ title: '', url: '', platform: 'YouTube' }],
      readingMaterials: [{ title: '', author: '', year: '', url: '' }],
      isPublished: false
    });
    setEditingId(null);
    setShowForm(false);
  };

  const addArrayItem = (field) => {
    const newItem = field === 'topicsCovered' ? '' : 
                    field === 'slides' ? { title: '', url: '' } :
                    field === 'videos' ? { title: '', url: '', platform: 'YouTube' } :
                    { title: '', author: '', year: '', url: '' };
    
    setFormData({
      ...formData,
      [field]: [...formData[field], newItem]
    });
  };

  const updateArrayItem = (field, index, value) => {
    const updatedArray = [...formData[field]];
    updatedArray[index] = value;
    setFormData({ ...formData, [field]: updatedArray });
  };

  const removeArrayItem = (field, index) => {
    const updatedArray = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: updatedArray });
  };

  return (
    <div className="manager-page">
      <div className="page-header">
        <h1>🎓 Lecture Manager</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ Add New Lecture'}
        </button>
      </div>

      {/* Course Selector */}
      <div className="course-selector">
        <label>Select Course:</label>
        <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
          <option value="">Select a course...</option>
          {courses.map(course => (
            <option key={course._id} value={course._id}>
              {course.courseCode} - {course.courseTitle}
            </option>
          ))}
        </select>
      </div>

      {/* Form */}
      {showForm && (
        <div className="form-card">
          <h2>{editingId ? 'Edit Lecture' : 'Create New Lecture'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Lecture Number *</label>
                <input
                  type="number"
                  value={formData.lectureNumber}
                  onChange={(e) => setFormData({ ...formData, lectureNumber: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={formData.date ? formData.date.split('T')[0] : ''}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Introduction to Neural Networks"
                required
              />
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="4"
                placeholder="Detailed description of the lecture..."
                required
              />
            </div>

            {/* Topics Covered */}
            <div className="form-group">
              <label>Topics Covered</label>
              {formData.topicsCovered.map((topic, index) => (
                <div key={index} className="array-item">
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => updateArrayItem('topicsCovered', index, e.target.value)}
                    placeholder="Topic name"
                  />
                  <button type="button" onClick={() => removeArrayItem('topicsCovered', index)}>✕</button>
                </div>
              ))}
              <button type="button" className="btn-add" onClick={() => addArrayItem('topicsCovered')}>
                + Add Topic
              </button>
            </div>

            {/* Videos */}
            <div className="form-group">
              <label>Videos (YouTube Links)</label>
              {formData.videos.map((video, index) => (
                <div key={index} className="nested-item">
                  <input
                    type="text"
                    value={video.title}
                    onChange={(e) => updateArrayItem('videos', index, { ...video, title: e.target.value })}
                    placeholder="Video title (e.g., M1, Part 1)"
                  />
                  <input
                    type="url"
                    value={video.url}
                    onChange={(e) => updateArrayItem('videos', index, { ...video, url: e.target.value })}
                    placeholder="YouTube URL"
                  />
                  <button type="button" onClick={() => removeArrayItem('videos', index)}>✕</button>
                </div>
              ))}
              <button type="button" className="btn-add" onClick={() => addArrayItem('videos')}>
                + Add Video
              </button>
            </div>

            {/* Slides */}
            <div className="form-group">
              <label>Slides</label>
              {formData.slides.map((slide, index) => (
                <div key={index} className="nested-item">
                  <input
                    type="text"
                    value={slide.title}
                    onChange={(e) => updateArrayItem('slides', index, { ...slide, title: e.target.value })}
                    placeholder="Slide title (e.g., Lecture 1 Slides)"
                  />
                  <input
                    type="url"
                    value={slide.url}
                    onChange={(e) => updateArrayItem('slides', index, { ...slide, url: e.target.value })}
                    placeholder="URL to slides (Google Drive, Dropbox, etc.)"
                  />
                  <button type="button" onClick={() => removeArrayItem('slides', index)}>✕</button>
                </div>
              ))}
              <button type="button" className="btn-add" onClick={() => addArrayItem('slides')}>
                + Add Slides
              </button>
            </div>

            {/* Reading Materials */}
            <div className="form-group">
              <label>Reading Materials</label>
              {formData.readingMaterials.map((reading, index) => (
                <div key={index} className="nested-item">
                  <input
                    type="text"
                    value={reading.title}
                    onChange={(e) => updateArrayItem('readingMaterials', index, { ...reading, title: e.target.value })}
                    placeholder="Title"
                  />
                  <input
                    type="text"
                    value={reading.author}
                    onChange={(e) => updateArrayItem('readingMaterials', index, { ...reading, author: e.target.value })}
                    placeholder="Author"
                  />
                  <input
                    type="text"
                    value={reading.year}
                    onChange={(e) => updateArrayItem('readingMaterials', index, { ...reading, year: e.target.value })}
                    placeholder="Year"
                  />
                  <input
                    type="url"
                    value={reading.url}
                    onChange={(e) => updateArrayItem('readingMaterials', index, { ...reading, url: e.target.value })}
                    placeholder="URL"
                  />
                  <button type="button" onClick={() => removeArrayItem('readingMaterials', index)}>✕</button>
                </div>
              ))}
              <button type="button" className="btn-add" onClick={() => addArrayItem('readingMaterials')}>
                + Add Reading Material
              </button>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                />
                <span>Publish immediately</span>
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingId ? '✓ Update Lecture' : '+ Create Lecture'}
              </button>
              <button type="button" className="btn-secondary" onClick={resetForm}>
                ✕ Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lectures List */}
      <div className="list-card">
        <h2>Lectures ({lectures.length})</h2>
        {lectures.length === 0 ? (
          <p className="empty-message">No lectures yet. Create your first lecture!</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Videos</th>
                  <th>Slides</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {lectures.map((lecture) => (
                  <tr key={lecture._id}>
                    <td>{lecture.lectureNumber}</td>
                    <td>
                      <strong>{lecture.title}</strong>
                      <br />
                      <small>{lecture.description?.substring(0, 60)}...</small>
                    </td>
                    <td>{lecture.videos?.length || 0} videos</td>
                    <td>{lecture.slides?.length || 0} files</td>
                    <td>
                      <span className={`badge ${lecture.isPublished ? 'badge-success' : 'badge-warning'}`}>
                        {lecture.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="actions">
                      <button className="btn-edit" onClick={() => handleEdit(lecture)}>Edit</button>
                      <button className="btn-delete" onClick={() => handleDelete(lecture._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LectureManager;
