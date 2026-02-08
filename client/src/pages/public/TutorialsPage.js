import React, { useState, useEffect, useMemo } from 'react';
import { courseAPI, tutorialAPI } from '../../services/api';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import CourseDropdown from '../../components/CourseDropdown';
import { 
  FaPlay, 
  FaLightbulb, 
  FaExternalLinkAlt,
  FaChevronUp,
  FaCheckCircle,
  FaBook,
  FaVideo,
  FaFilePdf,
  FaFileAlt,
  FaFilePowerpoint,
  FaCode,
  FaTasks,
  FaGraduationCap,
  FaArrowRight,
  FaDownload,
  FaEye,
  FaRocket,
  FaBullseye,
  FaListUl,
  FaFlask,
  FaBriefcase,
  FaClock,
  FaCalendarAlt
} from 'react-icons/fa';
import './PublicPages.css';
import './TutorialsPage.css';

// Difficulty configuration
const difficultyConfig = {
  'Beginner': { color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.1)', icon: '🌱', label: 'Beginner' },
  'Intermediate': { color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.1)', icon: '⚡', label: 'Intermediate' },
  'Advanced': { color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.1)', icon: '🚀', label: 'Advanced' },
  'Easy': { color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.1)', icon: '✨', label: 'Easy' },
  'Medium': { color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.1)', icon: '⚡', label: 'Medium' },
  'Hard': { color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.1)', icon: '🔥', label: 'Hard' }
};

// Get file icon based on URL
const getFileIcon = (url) => {
  if (!url) return <FaFileAlt />;
  const ext = url.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return <FaFilePdf />;
  if (['ppt', 'pptx'].includes(ext)) return <FaFilePowerpoint />;
  return <FaFileAlt />;
};

// Get file type label
const getFileType = (url) => {
  if (!url) return 'Document';
  const ext = url.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return 'PDF';
  if (['ppt', 'pptx'].includes(ext)) return 'PowerPoint';
  if (['doc', 'docx'].includes(ext)) return 'Word';
  return 'Document';
};

// Format date
const formatDate = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
};

// Truncate text
const truncateText = (text, maxLength = 120) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Calculate estimated duration
const calculateDuration = (tutorial) => {
  let minutes = 0;
  // Estimate: 3 min per topic, 5 min per slide, video duration, 10 min per problem
  minutes += (tutorial.topicsCovered?.length || 0) * 3;
  minutes += (tutorial.slides?.length || 0) * 5;
  minutes += (tutorial.practiceProblems?.length || 0) * 10;
  
  // Parse video durations if available
  tutorial.videos?.forEach(video => {
    if (video.duration) {
      const parts = video.duration.split(':');
      if (parts.length === 2) {
        minutes += parseInt(parts[0]) || 0;
      }
    } else {
      minutes += 8; // Default 8 min per video
    }
  });
  
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
};

// Get difficulty from tutorial or derive it
const getDifficulty = (tutorial) => {
  if (tutorial.difficulty) return tutorial.difficulty;
  // Derive from content complexity
  const totalContent = (tutorial.topicsCovered?.length || 0) + 
                       (tutorial.videos?.length || 0) + 
                       (tutorial.practiceProblems?.length || 0);
  if (totalContent <= 3) return 'Beginner';
  if (totalContent <= 6) return 'Intermediate';
  return 'Advanced';
};

// Topic Card Component
const TopicCard = ({ topic, index }) => (
  <div className="topic-card">
    <div className="topic-number">{index + 1}</div>
    <span className="topic-text">{topic}</span>
    <FaCheckCircle className="topic-check" />
  </div>
);

// Video Card Component
const VideoCard = ({ video, index, total }) => (
  <div className="video-card">
    <div className="video-thumbnail">
      <div className="video-play-overlay">
        <FaPlay />
      </div>
      {video.duration && (
        <span className="video-duration">{video.duration}</span>
      )}
    </div>
    <div className="video-info">
      <span className="video-number">Video {index + 1} of {total}</span>
      <h4 className="video-title">{video.title}</h4>
      {video.description && (
        <p className="video-description">{video.description}</p>
      )}
      <a 
        href={video.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="video-watch-btn"
      >
        <FaPlay /> Watch Now
        <FaExternalLinkAlt className="external-icon" />
      </a>
    </div>
  </div>
);

// Slide Card Component
const SlideCard = ({ slide, index }) => (
  <div className="slide-card">
    <div className="slide-icon-wrapper">
      {getFileIcon(slide.url)}
    </div>
    <div className="slide-info">
      <h4 className="slide-title">{slide.title}</h4>
      <span className="slide-type">{getFileType(slide.url)}</span>
    </div>
    <div className="slide-actions">
      <a 
        href={slide.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="slide-action-btn view-btn"
        title="View"
      >
        <FaEye />
      </a>
      <a 
        href={slide.url} 
        download
        className="slide-action-btn download-btn"
        title="Download"
      >
        <FaDownload />
      </a>
    </div>
  </div>
);

// Problem Card Component
const ProblemCard = ({ problem, index }) => {
  const config = difficultyConfig[problem.difficulty] || difficultyConfig['Medium'];
  
  return (
    <div className="problem-card">
      <div className="problem-header">
        <span className="problem-number">Problem {index + 1}</span>
        <span 
          className="problem-difficulty"
          style={{ 
            background: config.bgColor, 
            color: config.color,
            border: `1px solid ${config.color}30`
          }}
        >
          {config.icon} {problem.difficulty}
        </span>
      </div>
      <h4 className="problem-title">{problem.title}</h4>
      {problem.description && (
        <p className="problem-description">{problem.description}</p>
      )}
      {problem.url && (
        <a 
          href={problem.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="problem-start-btn"
        >
          <FaCode /> Start Problem
          <FaArrowRight className="arrow-icon" />
        </a>
      )}
    </div>
  );
};

// Tutorial Card Component (Main) - Modern Grid Card Design
const TutorialCard = ({ tutorial, index, totalTutorials }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isExpanded, setIsExpanded] = useState(false);
  
  const stats = useMemo(() => ({
    topics: tutorial.topicsCovered?.length || 0,
    videos: tutorial.videos?.length || 0,
    slides: tutorial.slides?.length || 0,
    problems: tutorial.practiceProblems?.length || 0
  }), [tutorial]);
  
  const difficulty = getDifficulty(tutorial);
  const diffConfig = difficultyConfig[difficulty] || difficultyConfig['Intermediate'];
  const estimatedDuration = calculateDuration(tutorial);
  const isLatest = index === totalTutorials - 1;
  
  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FaBook />, show: true },
    { id: 'topics', label: 'Topics', icon: <FaListUl />, show: stats.topics > 0, count: stats.topics },
    { id: 'videos', label: 'Videos', icon: <FaVideo />, show: stats.videos > 0, count: stats.videos },
    { id: 'slides', label: 'Slides', icon: <FaFileAlt />, show: stats.slides > 0, count: stats.slides },
    { id: 'problems', label: 'Practice', icon: <FaTasks />, show: stats.problems > 0, count: stats.problems }
  ].filter(tab => tab.show);
  
  // Get learning objectives: prefer dedicated field, fallback to smart parsing
  const getLearningObjectives = (tutorial) => {
    // If dedicated learningObjectives field exists and has content, use it
    if (tutorial.learningObjectives && tutorial.learningObjectives.length > 0 && 
        tutorial.learningObjectives.some(o => o && o.trim())) {
      return tutorial.learningObjectives
        .filter(o => o && o.trim())
        .map((obj, idx) => ({
          id: idx + 1,
          text: obj.trim()
        }));
    }
    
    // Fallback: Use topicsCovered as learning objectives if available
    if (tutorial.topicsCovered && tutorial.topicsCovered.length > 0 &&
        tutorial.topicsCovered.some(t => t && t.trim())) {
      return tutorial.topicsCovered
        .filter(t => t && t.trim())
        .slice(0, 10) // Limit to 10 items
        .map((topic, idx) => ({
          id: idx + 1,
          text: topic.trim()
        }));
    }
    
    return [];
  };
  
  // Format description as structured content (preserves paragraphs, lists, code)
  const formatDescription = (description) => {
    if (!description) return null;
    
    // Split by double newlines for paragraphs, preserve structure
    const paragraphs = description.split(/\n\n+/).filter(p => p.trim());
    
    return paragraphs.map((para, idx) => {
      const trimmed = para.trim();
      
      // Check if it's a header (ends with :)
      if (trimmed.endsWith(':') && !trimmed.includes('\n')) {
        return { type: 'header', content: trimmed, key: idx };
      }
      
      // Check if it's a code block (starts with common code indicators)
      if (trimmed.startsWith('```') || trimmed.match(/^(sudo|npm|pip|python|git|cd|ls|mkdir)/)) {
        return { type: 'code', content: trimmed.replace(/^```\w*\n?/, '').replace(/```$/, ''), key: idx };
      }
      
      // Check if it's a list (lines starting with -, *, •, or numbers)
      const lines = trimmed.split('\n');
      const isList = lines.every(line => 
        line.trim().match(/^[-•*]\s/) || 
        line.trim().match(/^\d+[.)]\s/) ||
        line.trim() === ''
      );
      
      if (isList && lines.length > 1) {
        const items = lines
          .filter(line => line.trim())
          .map(line => line.replace(/^[-•*]\s*/, '').replace(/^\d+[.)]\s*/, '').trim());
        return { type: 'list', items, key: idx };
      }
      
      // Regular paragraph
      return { type: 'paragraph', content: trimmed, key: idx };
    });
  };
  
  const learningObjectives = getLearningObjectives(tutorial);
  const formattedDescription = formatDescription(tutorial.description);
  const briefSummary = tutorial.briefSummary || 
    (tutorial.description ? tutorial.description.split('\n')[0].substring(0, 200) : null);
  
  return (
    <article 
      className={`tutorial-card-modern ${isExpanded ? 'expanded' : ''}`}
      style={{ animationDelay: `${index * 0.1}s` }}
      tabIndex={0}
      aria-label={`Tutorial ${tutorial.tutorialNumber}: ${tutorial.title}`}
    >
      {/* Tutorial Card Header - Modern Grid Design */}
      <div className="tutorial-card-grid">
        {/* Thumbnail/Preview Area */}
        <div className="tutorial-thumbnail-area">
          <div className="tutorial-thumbnail">
            <div className="thumbnail-gradient">
              <div className="thumbnail-icon">
                <FaFlask />
              </div>
            </div>
            <div className="tutorial-number-chip">
              Tutorial {String(tutorial.tutorialNumber).padStart(2, '0')}
            </div>
            {isLatest && (
              <div className="tutorial-new-badge">NEW</div>
            )}
          </div>
          
          {/* Content Type Icons */}
          <div className="content-type-icons">
            {stats.videos > 0 && (
              <div className="content-type-item" title={`${stats.videos} Video${stats.videos > 1 ? 's' : ''}`}>
                <FaVideo />
                <span>{stats.videos}</span>
              </div>
            )}
            {stats.slides > 0 && (
              <div className="content-type-item" title={`${stats.slides} Slide${stats.slides > 1 ? 's' : ''}`}>
                <FaFileAlt />
                <span>{stats.slides}</span>
              </div>
            )}
            {stats.problems > 0 && (
              <div className="content-type-item" title={`${stats.problems} Practice Problem${stats.problems > 1 ? 's' : ''}`}>
                <FaCode />
                <span>{stats.problems}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="tutorial-content-area">
          {/* Top Meta Row */}
          <div className="tutorial-meta-badges">
            {tutorial.isPublished ? (
              <span className="status-pill published">
                <FaCheckCircle /> Published
              </span>
            ) : (
              <span className="status-pill draft">
                Draft
              </span>
            )}
            <span 
              className="difficulty-pill"
              style={{ 
                background: diffConfig.bgColor, 
                color: diffConfig.color,
                borderColor: diffConfig.color
              }}
            >
              {diffConfig.icon} {diffConfig.label}
            </span>
          </div>
          
          {/* Title */}
          <h2 className="tutorial-card-title">{tutorial.title}</h2>
          
          {/* Description Preview */}
          {tutorial.description && (
            <p className="tutorial-card-description">
              {truncateText(tutorial.description.split('\n')[0], 140)}
            </p>
          )}
          
          {/* Stats Row */}
          <div className="tutorial-stats-row">
            <div className="stat-chip">
              <FaFileAlt className="stat-icon slides" />
              <span>{stats.slides} Slide{stats.slides !== 1 ? 's' : ''}</span>
            </div>
            <div className="stat-chip">
              <FaVideo className="stat-icon videos" />
              <span>{stats.videos} Video{stats.videos !== 1 ? 's' : ''}</span>
            </div>
            <div className="stat-chip">
              <FaCode className="stat-icon problems" />
              <span>{stats.problems} Problem{stats.problems !== 1 ? 's' : ''}</span>
            </div>
          </div>
          
          {/* Bottom Row - Duration, Date, Actions */}
          <div className="tutorial-bottom-row">
            <div className="tutorial-meta-info">
              <span className="meta-item">
                <FaClock />
                {estimatedDuration}
              </span>
              {tutorial.updatedAt && (
                <span className="meta-item">
                  <FaCalendarAlt />
                  Updated {formatDate(tutorial.updatedAt)}
                </span>
              )}
            </div>
            
            <button 
              className="tutorial-cta-btn"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-expanded={isExpanded}
              aria-controls={`tutorial-content-${tutorial._id}`}
            >
              {isExpanded ? (
                <>View Less <FaChevronUp /></>
              ) : (
                <>Start Tutorial <FaArrowRight /></>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Expandable Content */}
      <div 
        className={`tutorial-expanded-content ${isExpanded ? 'show' : ''}`}
        id={`tutorial-content-${tutorial._id}`}
      >
        {/* Progress Indicator (placeholder for future) */}
        <div className="tutorial-progress-bar">
          <div className="progress-track">
            <div className="progress-fill" style={{ width: '0%' }}></div>
          </div>
          <span className="progress-text">Ready to start</span>
        </div>
        
        {/* Enhanced Tab Navigation */}
        <div className="tutorial-tabs-container">
          <div className="tutorial-tabs-header">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`tutorial-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <div className="tab-btn-content">
                  <span className="tab-btn-icon">{tab.icon}</span>
                  <span className="tab-btn-label">{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className="tab-btn-badge">{tab.count}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Tab Content */}
        <div className="tutorial-tab-content">
          {/* Overview Tab - Restructured */}
          {activeTab === 'overview' && (
            <div className="tab-panel overview-panel enhanced">
              {/* Section 1: Brief Summary */}
              {briefSummary && (
                <section className="content-block summary-block">
                  <div className="content-block-header">
                    <div className="header-icon-box info">
                      <FaGraduationCap />
                    </div>
                    <div className="header-text">
                      <h3 className="block-title">Overview</h3>
                      <p className="block-subtitle">Quick summary of this tutorial</p>
                    </div>
                  </div>
                  <div className="summary-content">
                    <p className="lead-paragraph">{briefSummary}</p>
                  </div>
                </section>
              )}
              
              {/* Section 2: Learning Objectives - Card Layout */}
              {learningObjectives.length > 0 && (
                <section className="content-block learning-objectives-block">
                  <div className="content-block-header">
                    <div className="header-icon-box primary">
                      <FaBullseye />
                    </div>
                    <div className="header-text">
                      <h3 className="block-title">What You'll Learn</h3>
                      <p className="block-subtitle">{learningObjectives.length} key learning objective{learningObjectives.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  
                  <div className="objectives-grid">
                    {learningObjectives.map((objective) => (
                      <div key={objective.id} className="objective-card">
                        <div className="objective-number">{objective.id}</div>
                        <div className="objective-content">
                          <p className="objective-text">{objective.text}</p>
                        </div>
                        <FaCheckCircle className="objective-check" />
                      </div>
                    ))}
                  </div>
                </section>
              )}
              
              {/* Section 3: Detailed Description */}
              {formattedDescription && formattedDescription.length > 0 && (
                <section className="content-block description-block">
                  <div className="content-block-header">
                    <div className="header-icon-box secondary">
                      <FaBook />
                    </div>
                    <div className="header-text">
                      <h3 className="block-title">About This Tutorial</h3>
                      <p className="block-subtitle">Detailed information and content</p>
                    </div>
                  </div>
                  
                  <div className="description-content formatted">
                    {formattedDescription.map((block) => {
                      if (block.type === 'header') {
                        return <h4 key={block.key} className="desc-header">{block.content}</h4>;
                      }
                      if (block.type === 'code') {
                        return (
                          <pre key={block.key} className="desc-code">
                            <code>{block.content}</code>
                          </pre>
                        );
                      }
                      if (block.type === 'list') {
                        return (
                          <ul key={block.key} className="desc-list">
                            {block.items.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        );
                      }
                      return <p key={block.key} className="desc-paragraph">{block.content}</p>;
                    })}
                  </div>
                </section>
              )}
              
              {/* Section 4: Why It Matters - Enhanced */}
              {tutorial.whyItMatters && (
                <section className="content-block why-matters-block">
                  <div className="content-block-header">
                    <div className="header-icon-box accent">
                      <FaLightbulb />
                    </div>
                    <div className="header-text">
                      <h3 className="block-title">Why It Matters</h3>
                      <p className="block-subtitle">Real-world relevance and importance</p>
                    </div>
                  </div>
                  
                  <div className="why-matters-content-enhanced">
                    <div className="main-explanation">
                      <p className="lead-paragraph">{tutorial.whyItMatters}</p>
                    </div>
                    
                    <div className="impact-cards-grid">
                      <div className="impact-card">
                        <div className="impact-icon">
                          <FaBullseye />
                        </div>
                        <h4 className="impact-title">Real-World Impact</h4>
                        <p className="impact-text">Foundation for building production-ready ML models</p>
                      </div>
                      
                      <div className="impact-card">
                        <div className="impact-icon rocket">
                          <FaRocket />
                        </div>
                        <h4 className="impact-title">Career Relevance</h4>
                        <p className="impact-text">Essential skill for AI/ML engineering roles</p>
                      </div>
                      
                      <div className="impact-card">
                        <div className="impact-icon briefcase">
                          <FaBriefcase />
                        </div>
                        <h4 className="impact-title">Industry Standard</h4>
                        <p className="impact-text">Used by leading tech companies worldwide</p>
                      </div>
                    </div>
                  </div>
                </section>
              )}
              
              {/* Quick Links - Enhanced */}
              {(stats.videos > 0 || stats.slides > 0 || stats.problems > 0) && (
                <section className="content-block quick-access-block">
                  <div className="content-block-header">
                    <div className="header-icon-box success">
                      <FaRocket />
                    </div>
                    <div className="header-text">
                      <h3 className="block-title">Quick Access</h3>
                      <p className="block-subtitle">Jump to specific content</p>
                    </div>
                  </div>
                  
                  <div className="quick-access-grid enhanced">
                    {stats.videos > 0 && (
                      <button 
                        className="quick-access-card video"
                        onClick={() => setActiveTab('videos')}
                      >
                        <div className="qa-icon-wrapper">
                          <FaVideo />
                        </div>
                        <div className="qa-text">
                          <span className="qa-label">Watch Videos</span>
                          <span className="qa-count">{stats.videos} available</span>
                        </div>
                        <FaArrowRight className="qa-arrow" />
                      </button>
                    )}
                    {stats.slides > 0 && (
                      <button 
                        className="quick-access-card slides"
                        onClick={() => setActiveTab('slides')}
                      >
                        <div className="qa-icon-wrapper">
                          <FaFileAlt />
                        </div>
                        <div className="qa-text">
                          <span className="qa-label">View Slides</span>
                          <span className="qa-count">{stats.slides} available</span>
                        </div>
                        <FaArrowRight className="qa-arrow" />
                      </button>
                    )}
                    {stats.problems > 0 && (
                      <button 
                        className="quick-access-card practice"
                        onClick={() => setActiveTab('problems')}
                      >
                        <div className="qa-icon-wrapper">
                          <FaCode />
                        </div>
                        <div className="qa-text">
                          <span className="qa-label">Practice Problems</span>
                          <span className="qa-count">{stats.problems} available</span>
                        </div>
                        <FaArrowRight className="qa-arrow" />
                      </button>
                    )}
                  </div>
                </section>
              )}
            </div>
          )}
          
          {/* Topics Tab */}
          {activeTab === 'topics' && tutorial.topicsCovered && (
            <div className="tab-panel topics-panel">
              <div className="topics-header">
                <h3 className="section-title">
                  <FaListUl /> Topics Covered
                </h3>
                <span className="topics-count">{stats.topics} topics</span>
              </div>
              <div className="topics-grid">
                {tutorial.topicsCovered.map((topic, i) => (
                  <TopicCard key={i} topic={topic} index={i} />
                ))}
              </div>
            </div>
          )}
          
          {/* Videos Tab */}
          {activeTab === 'videos' && tutorial.videos && (
            <div className="tab-panel videos-panel">
              <div className="videos-header">
                <h3 className="section-title">
                  <FaVideo /> Video Lectures
                </h3>
                <span className="videos-count">{stats.videos} videos</span>
              </div>
              <div className="videos-grid">
                {tutorial.videos.map((video, i) => (
                  <VideoCard 
                    key={i} 
                    video={video} 
                    index={i} 
                    total={stats.videos}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Slides Tab */}
          {activeTab === 'slides' && tutorial.slides && (
            <div className="tab-panel slides-panel">
              <div className="slides-header">
                <h3 className="section-title">
                  <FaFileAlt /> Slides & Materials
                </h3>
                <span className="slides-count">{stats.slides} files</span>
              </div>
              <div className="slides-list">
                {tutorial.slides.map((slide, i) => (
                  <SlideCard key={i} slide={slide} index={i} />
                ))}
              </div>
            </div>
          )}
          
          {/* Problems Tab */}
          {activeTab === 'problems' && tutorial.practiceProblems && (
            <div className="tab-panel problems-panel">
              <div className="problems-header">
                <h3 className="section-title">
                  <FaTasks /> Practice Problems
                </h3>
                <span className="problems-count">{stats.problems} problems</span>
              </div>
              <div className="problems-grid">
                {tutorial.practiceProblems.map((problem, i) => (
                  <ProblemCard key={i} problem={problem} index={i} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

function TutorialsPage() {
  const [courses, setCourses] = useState([]);
  const [tutorials, setTutorials] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadCourses(); }, []);
  useEffect(() => {
    if (selectedCourse) loadTutorials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourse]);

  const loadCourses = async () => {
    try {
      const response = await courseAPI.getAll();
      const coursesData = response.data.data || [];
      setCourses(coursesData);
      if (coursesData.length > 0) setSelectedCourse(coursesData[0]._id);
      setLoading(false);
    } catch (error) { console.error('Error:', error); setLoading(false); }
  };

  const loadTutorials = async () => {
    try {
      const response = await tutorialAPI.getByCourse(selectedCourse);
      setTutorials(response.data.data || []);
    } catch (error) { console.error('Error:', error); }
  };

  // Calculate overall stats
  const overallStats = useMemo(() => {
    return tutorials.reduce((acc, t) => ({
      topics: acc.topics + (t.topicsCovered?.length || 0),
      videos: acc.videos + (t.videos?.length || 0),
      slides: acc.slides + (t.slides?.length || 0),
      problems: acc.problems + (t.practiceProblems?.length || 0)
    }), { topics: 0, videos: 0, slides: 0, problems: 0 });
  }, [tutorials]);

  return (
    <div className="public-page">
      <Header userRole="student" />
      
      <main className="main-container tutorials-page">
        {/* Page Hero */}
        <section className="tutorials-hero">
          <div className="tutorials-hero-content">
            <div className="tutorials-hero-icon">
              <FaGraduationCap />
            </div>
            <div className="tutorials-hero-text">
              <h1 className="tutorials-hero-title">Lab Tutorials</h1>
              <p className="tutorials-hero-subtitle">
                Hands-on practice sessions with videos, slides, and coding exercises
              </p>
            </div>
          </div>
          
          {/* Overall Stats */}
          <div className="tutorials-overall-stats">
            <div className="overall-stat">
              <span className="overall-stat-value">{tutorials.length}</span>
              <span className="overall-stat-label">Tutorials</span>
            </div>
            <div className="overall-stat">
              <span className="overall-stat-value">{overallStats.videos}</span>
              <span className="overall-stat-label">Videos</span>
            </div>
            <div className="overall-stat">
              <span className="overall-stat-value">{overallStats.slides}</span>
              <span className="overall-stat-label">Slides</span>
            </div>
            <div className="overall-stat">
              <span className="overall-stat-value">{overallStats.problems}</span>
              <span className="overall-stat-label">Practice Problems</span>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <span className="loading-text">Loading tutorials...</span>
          </div>
        ) : (
          <>
            {/* Enhanced Course Selector */}
            <CourseDropdown 
              courses={courses}
              selectedCourse={selectedCourse}
              onSelect={setSelectedCourse}
              icon={FaCode}
              label="Select Course:"
              accentColor="#667eea"
            />

            {/* Tutorials List */}
            <section className="tutorials-section" aria-label="Tutorials list">
              {tutorials.length === 0 ? (
                <div className="tutorials-empty-state">
                  <div className="empty-state-illustration">
                    <div className="empty-icon-wrapper">
                      <FaBook className="empty-book-icon" />
                    </div>
                  </div>
                  <h3 className="empty-state-title">No Tutorials Available</h3>
                  <p className="empty-state-text">
                    Lab tutorials will appear here when published. Check back soon!
                  </p>
                </div>
              ) : (
                <div className="tutorials-grid-modern">
                  {tutorials.map((tutorial, index) => (
                    <TutorialCard 
                      key={tutorial._id} 
                      tutorial={tutorial} 
                      index={index}
                      totalTutorials={tutorials.length}
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

export default TutorialsPage;
