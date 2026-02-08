import React, { useState, useEffect, useMemo } from 'react';
import { courseAPI, examAPI } from '../../services/api';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import CourseDropdown from '../../components/CourseDropdown';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaMapMarkerAlt, 
  FaClipboardList,
  FaCheckCircle,
  FaExclamationTriangle,
  FaExternalLinkAlt,
  FaChevronDown,
  FaChevronUp,
  FaAward,
  FaFileAlt,
  FaInfoCircle,
  FaBookOpen,
  FaLightbulb,
  FaGraduationCap,
  FaHourglassHalf,
  FaDownload,
  FaBell,
  FaCalendarPlus,
  FaShare,
  FaSync
} from 'react-icons/fa';
import './PublicPages.css';
import './ExamsPage.css';

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

// Calculate days until exam
const calculateDaysUntil = (dateString) => {
  if (!dateString) return null;
  const examDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  examDate.setHours(0, 0, 0, 0);
  const diffTime = examDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Get short date
const getShortDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric'
  });
};

// Get day of week
const getDayOfWeek = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'long' });
};

// Get exam status
const getExamStatus = (dateString) => {
  const days = calculateDaysUntil(dateString);
  if (days === null) return 'unknown';
  if (days < 0) return 'completed';
  if (days === 0) return 'today';
  if (days <= 7) return 'upcoming';
  return 'scheduled';
};

// Get exam type config
const examTypeConfig = {
  'Midterm': { color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)', icon: '📝', borderColor: '#f59e0b' },
  'End-Semester': { color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)', icon: '📋', borderColor: '#ef4444' },
  'Final': { color: '#dc2626', bgColor: 'rgba(220, 38, 38, 0.1)', icon: '🎓', borderColor: '#dc2626' },
  'Quiz': { color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.1)', icon: '⚡', borderColor: '#8b5cf6' },
  'Test': { color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.1)', icon: '✏️', borderColor: '#3b82f6' }
};

// =====================================================
// STAT CARD COMPONENT
// =====================================================

const StatCard = ({ icon, value, label, gradient }) => (
  <div className={`exams-stat-card ${gradient}`}>
    <div className="stat-icon-wrapper">{icon}</div>
    <span className="stat-value">{value}</span>
    <span className="stat-label">{label}</span>
  </div>
);

// =====================================================
// COUNTDOWN BADGE COMPONENT
// =====================================================

const CountdownBadge = ({ days }) => {
  if (days === null) return null;
  
  let statusClass = 'scheduled';
  let statusText = `${days} days left`;
  
  if (days < 0) {
    statusClass = 'completed';
    statusText = 'Completed';
  } else if (days === 0) {
    statusClass = 'today';
    statusText = 'TODAY!';
  } else if (days === 1) {
    statusText = 'Tomorrow';
    statusClass = 'urgent';
  } else if (days <= 3) {
    statusClass = 'urgent';
  } else if (days <= 7) {
    statusClass = 'upcoming';
  }
  
  return (
    <span className={`countdown-badge ${statusClass}`}>
      <FaHourglassHalf />
      {statusText}
    </span>
  );
};

// =====================================================
// EXAM CARD COMPONENT
// =====================================================

const ExamCard = ({ exam, index }) => {
  const [isExpanded, setIsExpanded] = useState(index === 0);
  
  const daysUntil = calculateDaysUntil(exam.date);
  const examStatus = getExamStatus(exam.date);
  const typeConfig = examTypeConfig[exam.examType] || examTypeConfig['Test'];
  
  return (
    <article 
      className={`exam-card-modern exam-status-${examStatus}`}
      style={{ 
        animationDelay: `${index * 0.1}s`,
        borderLeftColor: typeConfig.borderColor
      }}
    >
      {/* Card Header */}
      <div className="exam-card-header">
        <div className="exam-header-left">
          {/* Type Badge */}
          <span 
            className="exam-type-badge"
            style={{ 
              background: typeConfig.bgColor, 
              color: typeConfig.color,
              borderColor: typeConfig.color
            }}
          >
            <span className="type-icon">{typeConfig.icon}</span>
            {exam.examType}
          </span>
          
          {/* Countdown Badge */}
          <CountdownBadge days={daysUntil} />
        </div>
        
        <div className="exam-header-actions">
          <button className="exam-action-btn" title="Set Reminder">
            <FaBell />
          </button>
          <button className="exam-action-btn" title="Add to Calendar">
            <FaCalendarPlus />
          </button>
          <button className="exam-action-btn" title="Share">
            <FaShare />
          </button>
        </div>
      </div>
      
      {/* Title Section */}
      <div className="exam-title-section">
        <h2 className="exam-card-title">{exam.title}</h2>
        {exam.isPublished && (
          <span className="published-badge">
            <FaCheckCircle /> Published
          </span>
        )}
      </div>
      
      {/* Info Grid */}
      <div className="exam-info-grid">
        {/* Date Card */}
        <div className="exam-info-card date-card">
          <div className="info-card-icon">
            <FaCalendarAlt />
          </div>
          <div className="info-card-content">
            <span className="info-label">Date</span>
            <span className="info-value">{getShortDate(exam.date)}</span>
            <span className="info-subtext">{getDayOfWeek(exam.date)}</span>
          </div>
        </div>
        
        {/* Time Card */}
        {exam.time && (
          <div className="exam-info-card time-card">
            <div className="info-card-icon">
              <FaClock />
            </div>
            <div className="info-card-content">
              <span className="info-label">Time</span>
              <span className="info-value">{exam.time.start} - {exam.time.end}</span>
              {exam.duration && (
                <span className="info-subtext">Duration: {exam.duration}</span>
              )}
            </div>
          </div>
        )}
        
        {/* Location Card */}
        {exam.location && (
          <div className="exam-info-card location-card">
            <div className="info-card-icon">
              <FaMapMarkerAlt />
            </div>
            <div className="info-card-content">
              <span className="info-label">Location</span>
              <span className="info-value">{exam.location}</span>
            </div>
          </div>
        )}
        
        {/* Marks Card */}
        {exam.totalMarks && (
          <div className="exam-info-card marks-card">
            <div className="info-card-icon">
              <FaAward />
            </div>
            <div className="info-card-content">
              <span className="info-label">Total Marks</span>
              <span className="info-value">{exam.totalMarks}</span>
              {exam.format && (
                <span className="info-subtext">{exam.format}</span>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Expand/Collapse Button */}
      <button 
        className="exam-expand-btn"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        {isExpanded ? (
          <>Hide Details <FaChevronUp /></>
        ) : (
          <>View Details <FaChevronDown /></>
        )}
      </button>
      
      {/* Expanded Content */}
      <div className={`exam-expanded-content ${isExpanded ? 'show' : ''}`}>
        {/* Syllabus Section */}
        {exam.syllabus && exam.syllabus.length > 0 && (
          <section className="exam-detail-section syllabus-section">
            <h3 className="detail-section-title">
              <FaBookOpen /> Syllabus Coverage
            </h3>
            <div className="syllabus-topics-grid">
              {exam.syllabus.map((topic, i) => (
                <div key={i} className="syllabus-topic-card">
                  <div className="topic-number">{i + 1}</div>
                  <div className="topic-content">
                    <span className="topic-text">{topic}</span>
                  </div>
                  <div className="topic-check">
                    <FaCheckCircle />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        
        {/* Guidelines Section */}
        {exam.guidelines && exam.guidelines.length > 0 && (
          <section className="exam-detail-section guidelines-section">
            <h3 className="detail-section-title">
              <FaInfoCircle /> Exam Guidelines & Rules
            </h3>
            <div className="guidelines-list">
              {exam.guidelines.map((guideline, i) => (
                <div key={i} className="guideline-item">
                  <div className="guideline-icon">
                    <FaExclamationTriangle />
                  </div>
                  <p className="guideline-text">{guideline}</p>
                </div>
              ))}
            </div>
          </section>
        )}
        
        {/* Preparation Resources Section */}
        {exam.preparationResources && exam.preparationResources.length > 0 && (
          <section className="exam-detail-section resources-section">
            <h3 className="detail-section-title">
              <FaLightbulb /> Preparation Resources
            </h3>
            <div className="resources-grid">
              {exam.preparationResources.map((resource, i) => (
                <a 
                  key={i}
                  href={resource.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="resource-card"
                >
                  <div className="resource-icon">
                    <FaFileAlt />
                  </div>
                  <div className="resource-info">
                    <h4 className="resource-title">{resource.title}</h4>
                    <span className="resource-type">{resource.resourceType || 'Document'}</span>
                  </div>
                  <div className="resource-action">
                    <FaExternalLinkAlt />
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}
        
        {/* Action Buttons */}
        <div className="exam-actions-footer">
          <button className="exam-primary-btn">
            <FaBookOpen /> Start Studying
          </button>
          <button className="exam-secondary-btn">
            <FaDownload /> Download Syllabus
          </button>
        </div>
      </div>
    </article>
  );
};

// =====================================================
// MAIN EXAMS PAGE COMPONENT
// =====================================================

function ExamsPage() {
  const [courses, setCourses] = useState([]);
  const [exams, setExams] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(true);
  const [examsLoading, setExamsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [examsError, setExamsError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'completed'

  useEffect(() => { loadCourses(); }, []);
  useEffect(() => {
    if (selectedCourse) loadExams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourse]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await courseAPI.getAll();
      const coursesData = response.data.data || [];
      setCourses(coursesData);
      if (coursesData.length > 0) setSelectedCourse(coursesData[0]._id);
    } catch (err) { 
      console.error('Error loading courses:', err);
      setError(err.response?.data?.message || 'Unable to load courses.');
    } finally {
      setLoading(false);
    }
  };

  const loadExams = async () => {
    try {
      setExamsLoading(true);
      setExamsError(null);
      const response = await examAPI.getByCourse(selectedCourse);
      setExams(response.data.data || []);
    } catch (err) { 
      console.error('Error loading exams:', err);
      setExamsError(err.response?.data?.message || 'Unable to load exams.');
    } finally {
      setExamsLoading(false);
    }
  };

  const handleRetry = () => {
    if (error) loadCourses();
    else if (examsError) loadExams();
  };

  // Calculate stats
  const stats = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    let upcoming = 0;
    let completed = 0;
    let nextExamDays = Infinity;
    
    exams.forEach(exam => {
      const examDate = new Date(exam.date);
      examDate.setHours(0, 0, 0, 0);
      
      if (examDate >= now) {
        upcoming++;
        const days = calculateDaysUntil(exam.date);
        if (days !== null && days >= 0 && days < nextExamDays) {
          nextExamDays = days;
        }
      } else {
        completed++;
      }
    });
    
    return {
      total: exams.length,
      upcoming,
      completed,
      nextExamDays: nextExamDays === Infinity ? null : nextExamDays
    };
  }, [exams]);

  // Filter exams
  const filteredExams = useMemo(() => {
    if (filter === 'all') return exams;
    
    return exams.filter(exam => {
      const status = getExamStatus(exam.date);
      if (filter === 'upcoming') {
        return status !== 'completed';
      } else if (filter === 'completed') {
        return status === 'completed';
      }
      return true;
    });
  }, [exams, filter]);

  // Format next exam text
  const getNextExamText = () => {
    if (stats.nextExamDays === null) return '—';
    if (stats.nextExamDays === 0) return 'Today!';
    if (stats.nextExamDays === 1) return '1 day';
    return `${stats.nextExamDays} days`;
  };

  return (
    <div className="public-page exams-page">
      <Header userRole="student" />
      
      <main className="exams-main-container">
        {/* Hero Section */}
        <div className="exams-hero-section">
          <div className="exams-hero-content">
            <div className="exams-hero-icon">
              <FaClipboardList />
            </div>
            <div className="exams-hero-text">
              <h1 className="exams-page-title">Examinations</h1>
              <p className="exams-page-subtitle">
                View exam schedules, locations, and preparation guidelines
              </p>
            </div>
          </div>
          
          {/* Stats Grid */}
          <div className="exams-stats-grid">
            <StatCard 
              icon={<FaCalendarAlt />}
              value={stats.upcoming}
              label="Upcoming"
              gradient="orange"
            />
            <StatCard 
              icon={<FaHourglassHalf />}
              value={getNextExamText()}
              label="Next Exam In"
              gradient="red"
            />
            <StatCard 
              icon={<FaCheckCircle />}
              value={stats.completed}
              label="Completed"
              gradient="green"
            />
            <StatCard 
              icon={<FaGraduationCap />}
              value={stats.total}
              label="Total Exams"
              gradient="blue"
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <span className="loading-text">Loading exams...</span>
          </div>
        ) : error ? (
          <div className="error-state-enhanced">
            <div className="error-icon-wrapper">
              <FaExclamationTriangle className="error-icon" />
            </div>
            <h3>Unable to Load Content</h3>
            <p>{error}</p>
            <button onClick={handleRetry} className="retry-btn">
              <FaSync /> Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Controls Section */}
            <div className="exams-controls-section">
              <div className="exams-course-selector">
                <CourseDropdown 
                  courses={courses}
                  selectedCourse={selectedCourse}
                  onSelect={setSelectedCourse}
                  icon={FaClipboardList}
                  label="Select Course:"
                  accentColor="#ef4444"
                />
              </div>
              
              {/* Filter Tabs */}
              <div className="exams-filter-tabs">
                <button 
                  className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                  onClick={() => setFilter('all')}
                >
                  All Exams
                </button>
                <button 
                  className={`filter-tab ${filter === 'upcoming' ? 'active' : ''}`}
                  onClick={() => setFilter('upcoming')}
                >
                  Upcoming
                </button>
                <button 
                  className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
                  onClick={() => setFilter('completed')}
                >
                  Completed
                </button>
              </div>
            </div>

            {/* Exams List */}
            <section className="exams-list-section">
              {examsLoading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <span className="loading-text">Loading exams...</span>
                </div>
              ) : examsError ? (
                <div className="error-state-enhanced">
                  <div className="error-icon-wrapper">
                    <FaExclamationTriangle className="error-icon" />
                  </div>
                  <h3>Unable to Load Exams</h3>
                  <p>{examsError}</p>
                  <button onClick={handleRetry} className="retry-btn">
                    <FaSync /> Try Again
                  </button>
                </div>
              ) : filteredExams.length === 0 ? (
                <div className="empty-state-enhanced">
                  <div className="empty-icon-wrapper">
                    <FaClipboardList className="empty-icon" />
                  </div>
                  <h3>{filter === 'all' ? 'No Exams Scheduled' : `No ${filter.charAt(0).toUpperCase() + filter.slice(1)} Exams`}</h3>
                  <p>
                    {filter === 'all' 
                      ? 'Exam information will appear here when available.'
                      : 'No exams match the selected filter.'}
                  </p>
                  {filter !== 'all' && (
                    <button onClick={() => setFilter('all')} className="retry-btn">
                      View All Exams
                    </button>
                  )}
                </div>
              ) : (
                <div className="exams-list">
                  {filteredExams.map((exam, index) => (
                    <ExamCard 
                      key={exam._id} 
                      exam={exam} 
                      index={index}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
}

export default ExamsPage;
