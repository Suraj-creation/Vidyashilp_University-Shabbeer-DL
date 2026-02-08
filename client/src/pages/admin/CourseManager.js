import React, { useState, useEffect } from 'react';
import { courseAPI } from '../../services/api';
import { useToast, useConfirm } from '../../context/ToastContext';
import './ManagerPage.css';

const CourseManager = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    courseCode: '',
    courseTitle: '',
    description: '',
    semester: '',
    year: '',
    credits: '',
    level: 'Undergraduate',
    maxStudents: '',
    enrollmentStatus: 'Open',
    lectureSlot: '',
    lectureLocation: '',
    instructor: {
      name: '',
      email: '',
      office: '',
      officeHours: ''
    }
  });

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const response = await courseAPI.getAll();
      setCourses(response.data.data || []);
    } catch (error) {
      console.error('Error loading courses:', error);
      toast.error('Failed to load courses');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('instructor.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        instructor: {
          ...prev.instructor,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await courseAPI.update(editingId, formData);
        toast.success('Course updated successfully!');
      } else {
        await courseAPI.create(formData);
        toast.success('Course created successfully!');
      }
      resetForm();
      loadCourses();
    } catch (error) {
      console.error('Error saving course:', error);
      toast.error('Failed to save course');
    }
  };

  const handleEdit = (course) => {
    setFormData({
      courseCode: course.courseCode || '',
      courseTitle: course.courseTitle || '',
      description: course.description || '',
      semester: course.semester || '',
      year: course.year || '',
      credits: course.credits || '',
      level: course.level || 'Undergraduate',
      maxStudents: course.maxStudents || '',
      enrollmentStatus: course.enrollmentStatus || 'Open',
      lectureSlot: course.lectureSlot || '',
      lectureLocation: course.lectureLocation || '',
      instructor: {
        name: course.instructor?.name || '',
        email: course.instructor?.email || '',
        office: course.instructor?.office || '',
        officeHours: course.instructor?.officeHours || ''
      }
    });
    setEditingId(course._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const ok = await confirm('Are you sure you want to delete this course?');
    if (ok) {
      try {
        await courseAPI.delete(id);
        toast.success('Course deleted successfully!');
        loadCourses();
      } catch (error) {
        console.error('Error deleting course:', error);
        toast.error('Failed to delete course');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      courseCode: '',
      courseTitle: '',
      description: '',
      semester: '',
      year: '',
      credits: '',
      level: 'Undergraduate',
      maxStudents: '',
      enrollmentStatus: 'Open',
      lectureSlot: '',
      lectureLocation: '',
      instructor: {
        name: '',
        email: '',
        office: '',
        officeHours: ''
      }
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="manager-page">
      <div className="page-header">
        <h1>📚 Course Manager</h1>
        <button 
          className="btn-primary" 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Cancel' : '+ Add New Course'}
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h3>{editingId ? 'Edit Course' : 'Create New Course'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Course Code *</label>
                <input
                  type="text"
                  name="courseCode"
                  value={formData.courseCode}
                  onChange={handleInputChange}
                  placeholder="e.g., CS6910"
                  required
                />
              </div>

              <div className="form-group">
                <label>Course Title *</label>
                <input
                  type="text"
                  name="courseTitle"
                  value={formData.courseTitle}
                  onChange={handleInputChange}
                  placeholder="e.g., Deep Learning"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Course description..."
                rows="3"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Semester *</label>
                <input
                  type="text"
                  name="semester"
                  value={formData.semester}
                  onChange={handleInputChange}
                  placeholder="e.g., Jan-May 2026"
                  required
                />
              </div>

              <div className="form-group">
                <label>Year</label>
                <input
                  type="text"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  placeholder="e.g., 2026"
                />
              </div>

              <div className="form-group">
                <label>Credits *</label>
                <input
                  type="number"
                  name="credits"
                  value={formData.credits}
                  onChange={handleInputChange}
                  placeholder="e.g., 4"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Level</label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                >
                  <option value="Undergraduate">Undergraduate</option>
                  <option value="Graduate">Graduate</option>
                  <option value="PhD">PhD</option>
                </select>
              </div>

              <div className="form-group">
                <label>Max Students</label>
                <input
                  type="number"
                  name="maxStudents"
                  value={formData.maxStudents}
                  onChange={handleInputChange}
                  placeholder="e.g., 100"
                />
              </div>

              <div className="form-group">
                <label>Enrollment Status</label>
                <select
                  name="enrollmentStatus"
                  value={formData.enrollmentStatus}
                  onChange={handleInputChange}
                >
                  <option value="Open">Open</option>
                  <option value="Closed">Closed</option>
                  <option value="Waitlist">Waitlist</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Lecture Slot</label>
                <input
                  type="text"
                  name="lectureSlot"
                  value={formData.lectureSlot}
                  onChange={handleInputChange}
                  placeholder="e.g., Mon/Thu 10:00-11:30"
                />
              </div>

              <div className="form-group">
                <label>Lecture Location</label>
                <input
                  type="text"
                  name="lectureLocation"
                  value={formData.lectureLocation}
                  onChange={handleInputChange}
                  placeholder="e.g., Room 101, Main Building"
                />
              </div>
            </div>

            <h4>Instructor Information</h4>
            <div className="form-row">
              <div className="form-group">
                <label>Instructor Name *</label>
                <input
                  type="text"
                  name="instructor.name"
                  value={formData.instructor.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Dr. John Doe"
                  required
                />
              </div>

              <div className="form-group">
                <label>Instructor Email *</label>
                <input
                  type="email"
                  name="instructor.email"
                  value={formData.instructor.email}
                  onChange={handleInputChange}
                  placeholder="instructor@example.com"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Office Location</label>
                <input
                  type="text"
                  name="instructor.office"
                  value={formData.instructor.office}
                  onChange={handleInputChange}
                  placeholder="e.g., Room 305, CSE Block"
                />
              </div>

              <div className="form-group">
                <label>Office Hours</label>
                <input
                  type="text"
                  name="instructor.officeHours"
                  value={formData.instructor.officeHours}
                  onChange={handleInputChange}
                  placeholder="e.g., Tue/Thu 2:00-3:00 PM"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingId ? '✓ Update Course' : '+ Create Course'}
              </button>
              <button type="button" className="btn-secondary" onClick={resetForm}>
                ✕ Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="list-card">
        <h3>All Courses ({courses.length})</h3>
        {courses.length === 0 ? (
          <p className="empty-message">No courses yet. Create your first course!</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Title</th>
                <th>Semester</th>
                <th>Instructor</th>
                <th>Credits</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(course => (
                <tr key={course._id}>
                  <td><strong>{course.courseCode}</strong></td>
                  <td>{course.courseTitle}</td>
                  <td>{course.semester}</td>
                  <td>{course.instructor?.name}</td>
                  <td>{course.credits}</td>
                  <td>
                    <span className={`badge ${
                      course.enrollmentStatus === 'Open' ? 'badge-success' :
                      course.enrollmentStatus === 'Closed' ? 'badge-danger' :
                      'badge-warning'
                    }`}>
                      {course.enrollmentStatus}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn-edit" 
                      onClick={() => handleEdit(course)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn-delete" 
                      onClick={() => handleDelete(course._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CourseManager;
