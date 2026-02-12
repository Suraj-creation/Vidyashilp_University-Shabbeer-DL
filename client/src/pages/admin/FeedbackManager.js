import React, { useState, useEffect, useCallback } from 'react';
import { FiMessageSquare, FiTrash2, FiEye, FiFilter, FiChevronDown, FiChevronUp, FiEdit3, FiCheckCircle, FiClock } from 'react-icons/fi';
import api from '../../services/api';
import './FeedbackManager.css';

const CATEGORIES = [
  'All', 'General', 'Content', 'Instructor', 'Assignments',
  'Exams', 'Resources', 'Technical Issue', 'Suggestion'
];

const FeedbackManager = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [stats, setStats] = useState({ total: 0, unread: 0, categoryBreakdown: [] });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ category: 'All', isRead: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedId, setExpandedId] = useState(null);
  const [noteInput, setNoteInput] = useState({});
  const [savingNote, setSavingNote] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const loadFeedback = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit: 15 });
      if (filter.category !== 'All') params.append('category', filter.category);
      if (filter.isRead !== '') params.append('isRead', filter.isRead);

      const res = await api.get(`/feedback?${params.toString()}`);
      setFeedbacks(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error('Failed to load feedback:', err);
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  const loadStats = useCallback(async () => {
    try {
      const res = await api.get('/feedback/stats');
      setStats(res.data.data || stats);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadFeedback();
    loadStats();
  }, [loadFeedback, loadStats]);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/feedback/${id}/read`);
      setFeedbacks(prev => prev.map(f => f._id === id ? { ...f, isRead: true } : f));
      setStats(prev => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const saveNote = async (id) => {
    setSavingNote(id);
    try {
      await api.patch(`/feedback/${id}/note`, { adminNote: noteInput[id] || '' });
      setFeedbacks(prev => prev.map(f =>
        f._id === id ? { ...f, adminNote: noteInput[id], isRead: true } : f
      ));
    } catch (err) {
      console.error('Failed to save note:', err);
    } finally {
      setSavingNote(null);
    }
  };

  const deleteFeedback = async (id) => {
    if (!window.confirm('Delete this feedback?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/feedback/${id}`);
      setFeedbacks(prev => prev.filter(f => f._id !== id));
      setStats(prev => ({ ...prev, total: prev.total - 1 }));
    } catch (err) {
      console.error('Failed to delete:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="feedback-manager">
      <div className="fm-header">
        <h1><FiMessageSquare /> Student Feedback</h1>
        <p className="fm-subtitle">View and manage course feedback from students</p>
      </div>

      {/* Stats Cards */}
      <div className="fm-stats-grid">
        <div className="fm-stat-card">
          <div className="fm-stat-icon total"><FiMessageSquare /></div>
          <div className="fm-stat-info">
            <span className="fm-stat-value">{stats.total}</span>
            <span className="fm-stat-label">Total Feedback</span>
          </div>
        </div>
        <div className="fm-stat-card">
          <div className="fm-stat-icon unread"><FiClock /></div>
          <div className="fm-stat-info">
            <span className="fm-stat-value">{stats.unread}</span>
            <span className="fm-stat-label">Unread</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="fm-filters">
        <FiFilter className="filter-icon" />
        <select value={filter.category} onChange={e => { setFilter(f => ({ ...f, category: e.target.value })); setPage(1); }}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filter.isRead} onChange={e => { setFilter(f => ({ ...f, isRead: e.target.value })); setPage(1); }}>
          <option value="">All Status</option>
          <option value="false">Unread</option>
          <option value="true">Read</option>
        </select>
      </div>

      {/* Feedback List */}
      {loading ? (
        <div className="fm-loading">Loading feedback...</div>
      ) : feedbacks.length === 0 ? (
        <div className="fm-empty">
          <FiMessageSquare size={48} />
          <h3>No Feedback Yet</h3>
          <p>Student feedback will appear here once submitted.</p>
        </div>
      ) : (
        <div className="fm-list">
          {feedbacks.map(fb => (
            <div
              key={fb._id}
              className={`fm-card ${!fb.isRead ? 'fm-card-unread' : ''} ${expandedId === fb._id ? 'fm-card-expanded' : ''}`}
            >
              <div className="fm-card-header" onClick={() => toggleExpand(fb._id)}>
                <div className="fm-card-left">
                  {!fb.isRead && <span className="fm-unread-dot" />}
                  <div className="fm-avatar">
                    {fb.userName?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="fm-card-meta">
                    <span className="fm-card-name">{fb.userName}</span>
                    <span className="fm-card-email">{fb.userEmail}</span>
                  </div>
                </div>
                <div className="fm-card-right">
                  <span className={`fm-badge fm-badge-${fb.category?.toLowerCase().replace(/\s/g, '-')}`}>
                    {fb.category}
                  </span>
                  <span className="fm-card-date">{formatDate(fb.createdAt)}</span>
                  {expandedId === fb._id ? <FiChevronUp /> : <FiChevronDown />}
                </div>
              </div>

              {expandedId === fb._id && (
                <div className="fm-card-body">
                  {fb.courseName && (
                    <div className="fm-course-tag">📚 {fb.courseName}</div>
                  )}
                  <p className="fm-message">{fb.message}</p>

                  {/* Admin note */}
                  <div className="fm-note-section">
                    <label><FiEdit3 /> Admin Note</label>
                    <textarea
                      value={noteInput[fb._id] ?? fb.adminNote ?? ''}
                      onChange={e => setNoteInput(prev => ({ ...prev, [fb._id]: e.target.value }))}
                      placeholder="Add an internal note..."
                      rows={2}
                    />
                    <div className="fm-card-actions">
                      {!fb.isRead && (
                        <button className="fm-btn fm-btn-read" onClick={() => markAsRead(fb._id)}>
                          <FiEye /> Mark Read
                        </button>
                      )}
                      <button
                        className="fm-btn fm-btn-note"
                        onClick={() => saveNote(fb._id)}
                        disabled={savingNote === fb._id}
                      >
                        <FiCheckCircle /> {savingNote === fb._id ? 'Saving...' : 'Save Note'}
                      </button>
                      <button
                        className="fm-btn fm-btn-delete"
                        onClick={() => deleteFeedback(fb._id)}
                        disabled={deletingId === fb._id}
                      >
                        <FiTrash2 /> {deletingId === fb._id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="fm-pagination">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Previous</button>
          <span>Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
};

export default FeedbackManager;
