import React, { useState, useEffect, useMemo } from 'react';
import { courseAPI, assignmentAPI } from '../../services/api';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import CourseDropdown from '../../components/CourseDropdown';
import { 
  FaCalendarAlt, 
  FaDownload, 
  FaExternalLinkAlt, 
  FaTasks,
  FaClock,
  FaAward,
  FaFileAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaChevronDown,
  FaChevronUp,
  FaBullseye,
  FaListUl,
  FaChartBar,
  FaCode,
  FaUpload,
  FaQuestionCircle,
  FaRocket,
  FaLightbulb,
  FaClipboardCheck,
  FaBookOpen,
  FaGraduationCap,
  FaBrain
} from 'react-icons/fa';
import './PublicPages.css';
import './AssignmentsPage.css';

// ============================================
// HELPER FUNCTIONS
// ============================================

// Calculate days until due date
const getDaysUntilDue = (dueDate) => {
  const now = new Date();
  const due = new Date(dueDate);
  const diffTime = due - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Get time progress percentage between release and due
const getTimeProgress = (releaseDate, dueDate) => {
  const now = new Date();
  const release = new Date(releaseDate);
  const due = new Date(dueDate);
  const total = due - release;
  const elapsed = now - release;
  const progress = Math.min(100, Math.max(0, (elapsed / total) * 100));
  return Math.round(progress);
};

// Get relative time text
const getRelativeTime = (date) => {
  const now = new Date();
  const target = new Date(date);
  const diffTime = now - target;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    const absDays = Math.abs(diffDays);
    if (absDays === 0) return 'Today';
    if (absDays === 1) return 'Tomorrow';
    if (absDays < 7) return `In ${absDays} days`;
    if (absDays < 30) return `In ${Math.floor(absDays / 7)} weeks`;
    return `In ${Math.floor(absDays / 30)} months`;
  }
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
};

// Format date nicely
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

// Get urgency level
const getUrgencyLevel = (daysUntilDue, status) => {
  if (status === 'Past Due') return 'overdue';
  if (status === 'Graded') return 'completed';
  if (daysUntilDue <= 1) return 'critical';
  if (daysUntilDue <= 3) return 'high';
  if (daysUntilDue <= 7) return 'medium';
  return 'low';
};

// Get status configuration
const getStatusConfig = (status, daysUntilDue) => {
  const configs = {
    'Active': { 
      icon: <FaClock />, 
      label: 'Active', 
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.15)',
      borderColor: 'rgba(16, 185, 129, 0.4)'
    },
    'Upcoming': { 
      icon: <FaRocket />, 
      label: 'Upcoming', 
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.15)',
      borderColor: 'rgba(245, 158, 11, 0.4)'
    },
    'Graded': { 
      icon: <FaCheckCircle />, 
      label: 'Graded', 
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.15)',
      borderColor: 'rgba(59, 130, 246, 0.4)'
    },
    'Past Due': { 
      icon: <FaExclamationTriangle />, 
      label: 'Past Due', 
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.15)',
      borderColor: 'rgba(239, 68, 68, 0.4)'
    }
  };
  
  // Override for urgent active assignments
  if (status === 'Active' && daysUntilDue <= 3) {
    return {
      ...configs['Active'],
      label: daysUntilDue <= 1 ? 'Due Soon!' : 'Due in ' + daysUntilDue + ' days',
      color: daysUntilDue <= 1 ? '#ef4444' : '#f59e0b',
      bgColor: daysUntilDue <= 1 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
      borderColor: daysUntilDue <= 1 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.4)'
    };
  }
  
  return configs[status] || configs['Upcoming'];
};

// ============================================
// SUB-COMPONENTS
// ============================================

// Metric Card Component
const MetricCard = ({ icon, label, value, subtext, urgent, className = '' }) => (
  <div className={`assignment-metric-card ${urgent ? 'urgent' : ''} ${className}`}>
    <div className="metric-icon-wrapper">{icon}</div>
    <div className="metric-content">
      <span className="metric-label">{label}</span>
      <span className="metric-value">{value}</span>
      {subtext && <span className="metric-subtext">{subtext}</span>}
    </div>
  </div>
);

// Countdown Timer Component
const CountdownTimer = ({ deadline }) => {
  const daysLeft = getDaysUntilDue(deadline);
  
  if (daysLeft < 0) {
    return (
      <div className="countdown-timer overdue">
        <span className="countdown-value">{Math.abs(daysLeft)}</span>
        <span className="countdown-label">days overdue</span>
      </div>
    );
  }
  
  if (daysLeft === 0) {
    return (
      <div className="countdown-timer critical">
        <span className="countdown-value">Today</span>
        <span className="countdown-label">Submit now!</span>
      </div>
    );
  }
  
  return (
    <div className={`countdown-timer ${daysLeft <= 3 ? 'urgent' : ''}`}>
      <span className="countdown-value">{daysLeft}</span>
      <span className="countdown-label">{daysLeft === 1 ? 'day left' : 'days left'}</span>
    </div>
  );
};

// Timeline Component
const AssignmentTimeline = ({ releaseDate, dueDate, status }) => {
  const progress = getTimeProgress(releaseDate, dueDate);
  const isOverdue = status === 'Past Due';
  const isComplete = status === 'Graded';
  
  return (
    <div className="assignment-timeline">
      <div className="timeline-track">
        <div className="timeline-point released">
          <div className="timeline-marker completed">
            <FaCheckCircle />
          </div>
          <div className="timeline-info">
            <span className="timeline-label">Released</span>
            <span className="timeline-date">{formatDate(releaseDate)}</span>
          </div>
        </div>
        
        <div className="timeline-bar">
          <div 
            className={`timeline-progress ${isOverdue ? 'overdue' : ''} ${isComplete ? 'complete' : ''}`}
            style={{ width: `${progress}%` }}
          />
          <div 
            className="timeline-current-marker"
            style={{ left: `${Math.min(progress, 95)}%` }}
          >
            <span className="current-label">Now</span>
          </div>
        </div>
        
        <div className={`timeline-point due ${isOverdue ? 'overdue' : ''} ${isComplete ? 'complete' : ''}`}>
          <div className={`timeline-marker ${isOverdue ? 'overdue' : ''} ${isComplete ? 'completed' : ''}`}>
            {isComplete ? <FaCheckCircle /> : isOverdue ? <FaExclamationTriangle /> : <FaClock />}
          </div>
          <div className="timeline-info">
            <span className="timeline-label">Due Date</span>
            <span className="timeline-date">{formatDate(dueDate)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Tab Navigation Component
const TabButton = ({ active, icon, children, onClick, count }) => (
  <button 
    className={`assignment-tab-btn ${active ? 'active' : ''}`}
    onClick={onClick}
  >
    <span className="tab-icon">{icon}</span>
    <span className="tab-text">{children}</span>
    {count !== undefined && <span className="tab-count">{count}</span>}
  </button>
);

// Objective Item Component
const ObjectiveItem = ({ objective, index }) => (
  <div className="objective-item">
    <div className="objective-number">{index + 1}</div>
    <div className="objective-content">
      <p>{objective}</p>
    </div>
    <div className="objective-check">
      <FaCheckCircle />
    </div>
  </div>
);

// Requirement Item Component
const RequirementItem = ({ requirement }) => (
  <div className="requirement-item">
    <div className="requirement-bullet">
      <FaClipboardCheck />
    </div>
    <div className="requirement-text">{requirement}</div>
  </div>
);

// Rubric Card Component
const RubricCard = ({ criteria, points, description, totalPoints }) => {
  const percentage = Math.round((points / totalPoints) * 100);
  
  return (
    <div className="rubric-card">
      <div className="rubric-card-header">
        <h4 className="rubric-criteria">{criteria}</h4>
        <div className="rubric-points">
          <span className="points-value">{points}</span>
          <span className="points-label">pts</span>
        </div>
      </div>
      
      <p className="rubric-description">{description}</p>
      
      <div className="rubric-progress">
        <div className="rubric-bar">
          <div 
            className="rubric-fill"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="rubric-percentage">{percentage}% of grade</span>
      </div>
    </div>
  );
};

// Template File Card
const TemplateFileCard = ({ file }) => {
  const getFileIcon = (fileName) => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    if (['ipynb', 'py'].includes(ext)) return <FaCode />;
    if (['pdf'].includes(ext)) return <FaFileAlt />;
    return <FaDownload />;
  };
  
  return (
    <a 
      href={file.url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="template-file-card"
    >
      <div className="file-icon">{getFileIcon(file.fileName)}</div>
      <div className="file-info">
        <span className="file-name">{file.fileName}</span>
        <span className="file-action">Click to download</span>
      </div>
      <FaExternalLinkAlt className="file-external" />
    </a>
  );
};

// Assignment Card Component
const AssignmentCard = ({ assignment, index }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isExpanded, setIsExpanded] = useState(true);
  
  const daysUntilDue = getDaysUntilDue(assignment.dueDate);
  const urgencyLevel = getUrgencyLevel(daysUntilDue, assignment.status);
  const statusConfig = getStatusConfig(assignment.status, daysUntilDue);
  const totalRubricPoints = assignment.rubric?.reduce((sum, r) => sum + (r.points || 0), 0) || assignment.totalPoints;
  
  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FaBookOpen />, show: true },
    { id: 'objectives', label: 'Learning Objectives', icon: <FaBullseye />, count: assignment.learningObjectives?.length, show: assignment.learningObjectives?.length > 0 },
    { id: 'requirements', label: 'Requirements', icon: <FaListUl />, count: assignment.requirements?.length, show: assignment.requirements?.length > 0 },
    { id: 'rubric', label: 'Grading Rubric', icon: <FaChartBar />, count: assignment.rubric?.length, show: assignment.rubric?.length > 0 },
    { id: 'files', label: 'Files & Submission', icon: <FaCode />, count: assignment.templateFiles?.length, show: assignment.templateFiles?.length > 0 || assignment.submissionFormat }
  ].filter(tab => tab.show);
  
  return (
    <div className={`assignment-hero-card urgency-${urgencyLevel}`}>
      {/* Header Section */}
      <div className="assignment-header-section">
        <div className="assignment-meta-badges">
          <span className="assignment-number">#{assignment.assignmentNumber || index + 1}</span>
          <span 
            className="assignment-status-badge"
            style={{ 
              background: statusConfig.bgColor,
              borderColor: statusConfig.borderColor,
              color: statusConfig.color
            }}
          >
            {statusConfig.icon}
            <span>{statusConfig.label}</span>
          </span>
        </div>
        
        <h2 className="assignment-title">{assignment.title}</h2>
        
        {assignment.description && (
          <p className="assignment-tagline">{assignment.description}</p>
        )}
        
        <button 
          className="expand-toggle-btn"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
          {isExpanded ? 'Collapse Details' : 'Expand Details'}
        </button>
      </div>
      
      {/* Metrics Bar */}
      <div className="assignment-metrics-bar">
        <MetricCard 
          icon={<FaCalendarAlt />}
          label="Released"
          value={formatDate(assignment.releaseDate)}
          subtext={getRelativeTime(assignment.releaseDate)}
        />
        
        <MetricCard 
          icon={<FaExclamationTriangle />}
          label="Due Date"
          value={formatDate(assignment.dueDate)}
          subtext={<CountdownTimer deadline={assignment.dueDate} />}
          urgent={daysUntilDue <= 3 && assignment.status !== 'Graded'}
        />
        
        <MetricCard 
          icon={<FaAward />}
          label="Total Points"
          value={assignment.totalPoints}
          subtext="Maximum score"
        />
        
        {assignment.submissionFormat && (
          <MetricCard 
            icon={<FaFileAlt />}
            label="Format"
            value={assignment.submissionFormat}
            subtext="Submission type"
          />
        )}
      </div>
      
      {/* Timeline */}
      <AssignmentTimeline 
        releaseDate={assignment.releaseDate}
        dueDate={assignment.dueDate}
        status={assignment.status}
      />
      
      {/* Action Buttons */}
      <div className="assignment-actions">
        {assignment.templateFiles?.length > 0 && (
          <a 
            href={assignment.templateFiles[0].url}
            target="_blank"
            rel="noopener noreferrer"
            className="primary-action-btn"
          >
            <FaDownload /> Download Assignment
          </a>
        )}
        
        <button className="secondary-action-btn">
          <FaUpload /> Submit Assignment
        </button>
        
        <button className="tertiary-action-btn">
          <FaQuestionCircle /> Ask Question
        </button>
      </div>
      
      {/* Expandable Content */}
      {isExpanded && (
        <div className="assignment-content-section">
          {/* Tab Navigation */}
          <div className="assignment-tabs-nav">
            {tabs.map(tab => (
              <TabButton
                key={tab.id}
                active={activeTab === tab.id}
                icon={tab.icon}
                onClick={() => setActiveTab(tab.id)}
                count={tab.count}
              >
                {tab.label}
              </TabButton>
            ))}
          </div>
          
          {/* Tab Content */}
          <div className="assignment-tab-content">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="tab-panel overview-panel">
                <div className="overview-grid">
                  <div className="overview-main">
                    <div className="overview-section">
                      <h3><FaLightbulb /> Assignment Description</h3>
                      <p className="description-text">{assignment.description || 'Complete this assignment according to the requirements and submit before the deadline.'}</p>
                    </div>
                    
                    {assignment.learningObjectives?.length > 0 && (
                      <div className="overview-section">
                        <h3><FaBullseye /> Key Learning Objectives</h3>
                        <div className="skills-preview">
                          {assignment.learningObjectives.slice(0, 3).map((obj, i) => (
                            <div key={i} className="skill-badge">
                              <FaBrain /> {obj.length > 50 ? obj.substring(0, 50) + '...' : obj}
                            </div>
                          ))}
                          {assignment.learningObjectives.length > 3 && (
                            <button 
                              className="see-more-btn"
                              onClick={() => setActiveTab('objectives')}
                            >
                              +{assignment.learningObjectives.length - 3} more
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="overview-sidebar">
                    <div className="quick-stats-card">
                      <h4><FaChartBar /> Quick Stats</h4>
                      <div className="quick-stat">
                        <span className="stat-label">Total Points</span>
                        <span className="stat-value">{assignment.totalPoints}</span>
                      </div>
                      {assignment.rubric?.length > 0 && (
                        <div className="quick-stat">
                          <span className="stat-label">Grading Criteria</span>
                          <span className="stat-value">{assignment.rubric.length}</span>
                        </div>
                      )}
                      {assignment.requirements?.length > 0 && (
                        <div className="quick-stat">
                          <span className="stat-label">Requirements</span>
                          <span className="stat-value">{assignment.requirements.length}</span>
                        </div>
                      )}
                      {assignment.templateFiles?.length > 0 && (
                        <div className="quick-stat">
                          <span className="stat-label">Template Files</span>
                          <span className="stat-value">{assignment.templateFiles.length}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Learning Objectives Tab */}
            {activeTab === 'objectives' && (
              <div className="tab-panel objectives-panel">
                <div className="objectives-header">
                  <h3><FaBullseye /> Learning Objectives</h3>
                  <p>By completing this assignment, you will achieve the following learning outcomes:</p>
                </div>
                <div className="objectives-list">
                  {assignment.learningObjectives.map((obj, i) => (
                    <ObjectiveItem key={i} objective={obj} index={i} />
                  ))}
                </div>
              </div>
            )}
            
            {/* Requirements Tab */}
            {activeTab === 'requirements' && (
              <div className="tab-panel requirements-panel">
                <div className="requirements-header">
                  <h3><FaListUl /> Assignment Requirements</h3>
                  <p>Complete all requirements to receive full credit:</p>
                </div>
                <div className="requirements-list">
                  {assignment.requirements.map((req, i) => (
                    <RequirementItem key={i} requirement={req} />
                  ))}
                </div>
              </div>
            )}
            
            {/* Grading Rubric Tab */}
            {activeTab === 'rubric' && (
              <div className="tab-panel rubric-panel">
                <div className="rubric-header">
                  <div className="rubric-title-section">
                    <h3><FaChartBar /> Grading Rubric</h3>
                    <p>Your assignment will be evaluated based on the following criteria:</p>
                  </div>
                  <div className="total-points-badge">
                    <FaAward />
                    <span className="total-label">Total:</span>
                    <span className="total-value">{totalRubricPoints} pts</span>
                  </div>
                </div>
                <div className="rubric-grid">
                  {assignment.rubric.map((item, i) => (
                    <RubricCard 
                      key={i}
                      criteria={item.criteria}
                      points={item.points}
                      description={item.description}
                      totalPoints={totalRubricPoints}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Files & Submission Tab */}
            {activeTab === 'files' && (
              <div className="tab-panel files-panel">
                {assignment.templateFiles?.length > 0 && (
                  <div className="files-section">
                    <h3><FaDownload /> Template Files</h3>
                    <p>Download these files to get started with your assignment:</p>
                    <div className="template-files-grid">
                      {assignment.templateFiles.map((file, i) => (
                        <TemplateFileCard key={i} file={file} />
                      ))}
                    </div>
                  </div>
                )}
                
                {assignment.submissionFormat && (
                  <div className="submission-section">
                    <h3><FaUpload /> Submission Guidelines</h3>
                    <div className="submission-info-card">
                      <div className="submission-format">
                        <FaFileAlt className="format-icon" />
                        <div className="format-details">
                          <span className="format-label">Required Format</span>
                          <span className="format-value">{assignment.submissionFormat}</span>
                        </div>
                      </div>
                      <div className="submission-deadline">
                        <FaClock className="deadline-icon" />
                        <div className="deadline-details">
                          <span className="deadline-label">Submit Before</span>
                          <span className="deadline-value">{formatDate(assignment.dueDate)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

const AssignmentsPage = () => {
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadCourses(); }, []);
  useEffect(() => { if (selectedCourse) loadAssignments(); }, [selectedCourse]);

  const loadCourses = async () => {
    try {
      const r = await courseAPI.getAll();
      const d = r.data.data || [];
      setCourses(d);
      if (d.length > 0) setSelectedCourse(d[0]._id);
      setLoading(false);
    } catch (e) { console.error(e); setLoading(false); }
  };

  const loadAssignments = async () => {
    try {
      const r = await assignmentAPI.getByCourse(selectedCourse);
      setAssignments(r.data.data || []);
    } catch (e) { console.error(e); }
  };
  
  // Calculate stats
  const stats = useMemo(() => {
    const active = assignments.filter(a => a.status === 'Active').length;
    const upcoming = assignments.filter(a => a.status === 'Upcoming').length;
    const graded = assignments.filter(a => a.status === 'Graded').length;
    const totalPoints = assignments.reduce((sum, a) => sum + (a.totalPoints || 0), 0);
    return { active, upcoming, graded, totalPoints, total: assignments.length };
  }, [assignments]);

  return (
    <div className="public-page assignments-page">
      <Header />
      <main className="assignments-main-container">
        {/* Hero Section */}
        <section className="assignments-hero-section">
          <div className="hero-content">
            <div className="hero-icon-wrapper">
              <FaTasks />
            </div>
            <div className="hero-text">
              <h1>Assignments Dashboard</h1>
              <p>Track your assignments, monitor deadlines, and submit your work</p>
            </div>
          </div>
          
          {!loading && assignments.length > 0 && (
            <div className="hero-stats">
              <div className="hero-stat">
                <span className="stat-number">{stats.total}</span>
                <span className="stat-label">Total</span>
              </div>
              <div className="hero-stat active">
                <span className="stat-number">{stats.active}</span>
                <span className="stat-label">Active</span>
              </div>
              <div className="hero-stat upcoming">
                <span className="stat-number">{stats.upcoming}</span>
                <span className="stat-label">Upcoming</span>
              </div>
              <div className="hero-stat graded">
                <span className="stat-number">{stats.graded}</span>
                <span className="stat-label">Graded</span>
              </div>
              <div className="hero-stat points">
                <span className="stat-number">{stats.totalPoints}</span>
                <span className="stat-label">Total Points</span>
              </div>
            </div>
          )}
        </section>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <span className="loading-text">Loading assignments...</span>
          </div>
        ) : (
          <>
            {/* Course Selector */}
            <CourseDropdown 
              courses={courses}
              selectedCourse={selectedCourse}
              onSelect={setSelectedCourse}
              icon={FaGraduationCap}
              label="Select Course:"
              accentColor="#8b5cf6"
            />
            
            {/* Assignments List */}
            <section className="assignments-list-section">
              {assignments.length === 0 ? (
                <div className="assignments-empty-state">
                  <div className="empty-illustration">
                    <div className="empty-icon-wrapper">
                      <FaTasks />
                    </div>
                  </div>
                  <h3>No Assignments Available</h3>
                  <p>Assignments will appear here when published by the instructor.</p>
                </div>
              ) : (
                <div className="assignments-cards-list">
                  {assignments.map((assignment, index) => (
                    <AssignmentCard 
                      key={assignment._id} 
                      assignment={assignment} 
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
};

export default AssignmentsPage;