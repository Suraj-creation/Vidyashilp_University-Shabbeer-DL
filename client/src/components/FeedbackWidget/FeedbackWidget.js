import React, { useState, useEffect, useRef } from 'react';
import { useStudentAuth } from '../../context/StudentAuthContext';
import { courseAPI } from '../../services/api';
import './FeedbackWidget.css';

const CATEGORIES = [
  'General', 'Content', 'Instructor', 'Assignments',
  'Exams', 'Resources', 'Technical Issue', 'Suggestion'
];

const FeedbackWidget = () => {
  const { isAuthenticated, student, token } = useStudentAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isPulsing, setIsPulsing] = useState(true);
  const [formData, setFormData] = useState({
    category: 'General',
    message: '',
    course: '',
    courseName: ''
  });
  const [courses, setCourses] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const widgetRef = useRef(null);

  // Load courses for dropdown
  useEffect(() => {
    if (!isAuthenticated) return;
    const loadCourses = async () => {
      try {
        const res = await courseAPI.getAll();
        setCourses(res.data?.data || res.data || []);
      } catch (err) {
        console.error('Failed to load courses:', err);
      }
    };
    if (isOpen && courses.length === 0) {
      loadCourses();
    }
  }, [isOpen, courses.length, isAuthenticated]);

  // Close widget when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (widgetRef.current && !widgetRef.current.contains(e.target)) {
        if (isOpen && !submitting) {
          setIsOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, submitting]);

  // Stop pulse after first open
  useEffect(() => {
    if (isOpen) setIsPulsing(false);
  }, [isOpen]);

  // Only show for logged-in students
  if (!isAuthenticated) return null;

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (submitted) {
      setSubmitted(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({ category: 'General', message: '', course: '', courseName: '' });
    setError('');
  };

  const handleCourseChange = (e) => {
    const courseId = e.target.value;
    const selected = courses.find(c => c._id === courseId);
    setFormData(prev => ({
      ...prev,
      course: courseId,
      courseName: selected ? `${selected.courseCode} - ${selected.courseTitle}` : ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.message.trim().length < 10) {
      setError('Feedback must be at least 10 characters');
      return;
    }

    setSubmitting(true);
    try {
      const studentToken = token || localStorage.getItem('studentToken');
      const payload = {
        category: formData.category,
        message: formData.message.trim()
      };
      if (formData.course) {
        payload.course = formData.course;
        payload.courseName = formData.courseName;
      }

      const response = await fetch(
        `${process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000'}/api/feedback`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${studentToken}`
          },
          body: JSON.stringify(payload)
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to submit');

      setSubmitted(true);
      resetForm();
    } catch (err) {
      setError(err.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="feedback-widget" ref={widgetRef}>
      {/* Floating Circular Button */}
      <button
        className={`feedback-fab ${isOpen ? 'fab-open' : ''} ${isPulsing ? 'fab-pulse' : ''}`}
        onClick={handleToggle}
        title="Send Feedback"
        aria-label="Open feedback form"
      >
        {isOpen ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <line x1="9" y1="10" x2="9" y2="10" strokeWidth="3" />
            <line x1="15" y1="10" x2="15" y2="10" strokeWidth="3" />
          </svg>
        )}
      </button>

      {/* Expanded Feedback Panel */}
      {isOpen && (
        <div className={`feedback-panel ${isOpen ? 'panel-open' : ''}`}>
          {submitted ? (
            <div className="feedback-success">
              <div className="success-icon">✓</div>
              <h3>Thank You!</h3>
              <p>Your feedback has been submitted successfully.</p>
              <button className="feedback-close-btn" onClick={handleToggle}>
                Close
              </button>
            </div>
          ) : (
            <>
              <div className="feedback-panel-header">
                <h3>💬 Course Feedback</h3>
                <p>Hi {student?.name?.split(' ')[0] || 'there'}! Share your thoughts</p>
              </div>

              <form onSubmit={handleSubmit} className="feedback-form">
                {/* Category */}
                <div className="feedback-field">
                  <label>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Course (optional) */}
                {courses.length > 0 && (
                  <div className="feedback-field">
                    <label>Course <span className="optional">(optional)</span></label>
                    <select value={formData.course} onChange={handleCourseChange}>
                      <option value="">-- Select Course --</option>
                      {courses.map(c => (
                        <option key={c._id} value={c._id}>
                          {c.courseCode} - {c.courseTitle}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Message */}
                <div className="feedback-field">
                  <label>Your Feedback <span className="required">*</span></label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Tell us what you think... (min 10 characters)"
                    rows={4}
                    maxLength={2000}
                  />
                  <span className="char-count">{formData.message.length}/2000</span>
                </div>

                {error && <div className="feedback-error">{error}</div>}

                <button
                  type="submit"
                  className="feedback-submit-btn"
                  disabled={submitting}
                >
                  {submitting ? (
                    <><span className="btn-spinner" /> Submitting...</>
                  ) : (
                    'Submit Feedback'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default FeedbackWidget;
