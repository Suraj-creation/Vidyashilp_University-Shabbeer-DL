import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { courseAPI, lectureAPI } from '../../services/api';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import CourseDropdown from '../../components/CourseDropdown';
import { 
  FaPlay, FaFileAlt, FaBook, FaExternalLinkAlt, FaCalendarAlt, 
  FaTimes, FaExpand, FaCompress, FaChevronLeft, FaChevronRight, 
  FaDownload, FaGlobe, FaExclamationTriangle, FaSync, FaCheckCircle,
  FaSearch, FaSortAmountDown, FaChevronDown, FaVideo, FaBookOpen,
  FaTag, FaInfoCircle, FaEye, FaPlayCircle, FaGraduationCap
} from 'react-icons/fa';
import './PublicPages.css';
import './LecturesPage.css';

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

// Convert Google Slides URL to embed URL
const getEmbedUrl = (url) => {
  if (!url) return null;
  
  if (url.includes('docs.google.com/presentation')) {
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match) {
      return `https://docs.google.com/presentation/d/${match[1]}/embed?start=false&loop=false&delayms=3000`;
    }
  }
  
  if (url.includes('docs.google.com/document')) {
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match) {
      return `https://docs.google.com/document/d/${match[1]}/preview`;
    }
  }
  
  if (url.includes('drive.google.com')) {
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/) || url.match(/id=([a-zA-Z0-9-_]+)/);
    if (match) {
      return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
  }
  
  if (url.endsWith('.pdf') || url.includes('.pdf?')) {
    return url;
  }
  
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const videoId = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId[1]}?rel=0&modestbranding=1`;
    }
  }
  
  return url;
};

// Get download URL for Google Drive files
const getDownloadUrl = (url) => {
  if (!url) return null;
  
  if (url.includes('drive.google.com')) {
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/) || url.match(/id=([a-zA-Z0-9-_]+)/);
    if (match) {
      return `https://drive.google.com/uc?export=download&id=${match[1]}`;
    }
  }
  
  if (url.includes('docs.google.com/presentation')) {
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match) {
      return `https://docs.google.com/presentation/d/${match[1]}/export/pdf`;
    }
  }
  
  if (url.includes('docs.google.com/document')) {
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match) {
      return `https://docs.google.com/document/d/${match[1]}/export?format=pdf`;
    }
  }
  
  if (url.endsWith('.pdf') || url.endsWith('.pptx') || url.endsWith('.docx') || url.endsWith('.zip')) {
    return url;
  }
  
  return null;
};

// Determine the type of content
const getContentType = (url) => {
  if (!url) return 'unknown';
  if (url.includes('docs.google.com/presentation') || url.includes('slides')) return 'slides';
  if (url.includes('docs.google.com/document')) return 'document';
  if (url.includes('drive.google.com') || url.endsWith('.pdf') || url.includes('.pdf?')) return 'pdf';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'video';
  if (url.startsWith('http://') || url.startsWith('https://')) return 'website';
  return 'other';
};

// Check if URL can be embedded
const canEmbed = (url) => {
  if (!url) return false;
  if (url.includes('docs.google.com')) return true;
  if (url.includes('drive.google.com')) return true;
  if (url.includes('youtube.com') || url.includes('youtu.be')) return true;
  if (url.endsWith('.pdf') || url.includes('.pdf?')) return true;
  return false;
};

// Get YouTube thumbnail
const getYouTubeThumbnail = (url) => {
  if (!url) return null;
  const videoId = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
  if (videoId) {
    return `https://img.youtube.com/vi/${videoId[1]}/mqdefault.jpg`;
  }
  return null;
};

// Format date
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
};

// Truncate text
const truncateText = (text, maxLength) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// =====================================================
// CONTENT VIEWER COMPONENT
// =====================================================

const ContentViewer = ({ content, onClose, allContent, currentIndex, onNavigate }) => {
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [embedError, setEmbedError] = useState(false);
  
  const embedUrl = getEmbedUrl(content?.url);
  const downloadUrl = getDownloadUrl(content?.url);
  const contentType = getContentType(content?.url);
  const isEmbeddable = canEmbed(content?.url);
  
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft' && currentIndex > 0) onNavigate(currentIndex - 1);
    if (e.key === 'ArrowRight' && currentIndex < allContent.length - 1) onNavigate(currentIndex + 1);
  }, [onClose, currentIndex, allContent.length, onNavigate]);
  
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    setEmbedError(false);
    setIsLoading(true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [handleKeyDown, content]);

  const handleIframeError = () => {
    setEmbedError(true);
    setIsLoading(false);
  };

  return (
    <div className={`content-viewer-overlay ${isFullscreen ? 'fullscreen' : ''}`}>
      <div className="content-viewer-container">
        <div className="viewer-header">
          <div className="viewer-title">
            <span className={`content-type-badge ${contentType}`}>
              {contentType === 'slides' && '📊 Slides'}
              {contentType === 'pdf' && '📄 PDF'}
              {contentType === 'video' && '🎬 Video'}
              {contentType === 'document' && '📝 Document'}
              {contentType === 'website' && '🌐 Website'}
              {contentType === 'other' && '📎 Content'}
            </span>
            <h3>{content?.title || 'Untitled'}</h3>
          </div>
          <div className="viewer-controls">
            {allContent.length > 1 && (
              <span className="nav-indicator">{currentIndex + 1} / {allContent.length}</span>
            )}
            {downloadUrl && (
              <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className="viewer-btn download-btn" title="Download" download>
                <FaDownload />
              </a>
            )}
            <a href={content?.url} target="_blank" rel="noopener noreferrer" className="viewer-btn" title="Open in new tab">
              <FaExternalLinkAlt />
            </a>
            <button className="viewer-btn" onClick={() => setIsFullscreen(!isFullscreen)} title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
              {isFullscreen ? <FaCompress /> : <FaExpand />}
            </button>
            <button className="viewer-btn close-btn" onClick={onClose} title="Close">
              <FaTimes />
            </button>
          </div>
        </div>
        
        <div className="viewer-content">
          {allContent.length > 1 && currentIndex > 0 && (
            <button className="nav-arrow prev" onClick={() => onNavigate(currentIndex - 1)} title="Previous">
              <FaChevronLeft />
            </button>
          )}
          
          {isLoading && !embedError && (
            <div className="viewer-loading">
              <div className="loading-spinner"></div>
              <p>Loading content...</p>
            </div>
          )}
          
          {embedError || !isEmbeddable ? (
            <div className="viewer-error">
              <FaGlobe style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.6 }} />
              <p style={{ fontSize: '1.1rem', marginBottom: '8px' }}>
                {contentType === 'website' 
                  ? 'This website cannot be embedded directly due to security restrictions.'
                  : 'Unable to embed this content.'}
              </p>
              <p style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '20px' }}>
                Click the button below to view it in a new tab.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <a href={content?.url} target="_blank" rel="noopener noreferrer" className="btn-primary">
                  <FaExternalLinkAlt /> Open in New Tab
                </a>
                {downloadUrl && (
                  <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary" download>
                    <FaDownload /> Download
                  </a>
                )}
              </div>
            </div>
          ) : embedUrl ? (
            <iframe
              src={embedUrl}
              title={content?.title || 'Content Viewer'}
              className={`content-iframe ${contentType === 'video' ? 'video-iframe' : ''}`}
              frameBorder="0"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              onLoad={() => setIsLoading(false)}
              onError={handleIframeError}
              style={{ opacity: isLoading ? 0 : 1 }}
            />
          ) : (
            <div className="viewer-error">
              <p>Unable to embed this content.</p>
              <a href={content?.url} target="_blank" rel="noopener noreferrer" className="btn-primary">
                <FaExternalLinkAlt /> Open in New Tab
              </a>
            </div>
          )}
          
          {allContent.length > 1 && currentIndex < allContent.length - 1 && (
            <button className="nav-arrow next" onClick={() => onNavigate(currentIndex + 1)} title="Next">
              <FaChevronRight />
            </button>
          )}
        </div>
        
        {allContent.length > 1 && (
          <div className="viewer-thumbnails">
            {allContent.map((item, idx) => (
              <button
                key={idx}
                className={`thumbnail-btn ${idx === currentIndex ? 'active' : ''}`}
                onClick={() => onNavigate(idx)}
              >
                <span className="thumb-icon">
                  {getContentType(item.url) === 'slides' && '📊'}
                  {getContentType(item.url) === 'pdf' && '📄'}
                  {getContentType(item.url) === 'video' && '🎬'}
                  {getContentType(item.url) === 'document' && '📝'}
                  {getContentType(item.url) === 'website' && '🌐'}
                  {getContentType(item.url) === 'other' && '📎'}
                </span>
                <span className="thumb-title">{item.title?.substring(0, 15) || `Item ${idx + 1}`}...</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// =====================================================
// STAT CARD COMPONENT
// =====================================================

const StatCard = ({ icon, value, label, gradient }) => (
  <div className={`lectures-stat-card ${gradient}`}>
    <div className="stat-icon-wrapper">{icon}</div>
    <span className="stat-value">{value}</span>
    <span className="stat-label">{label}</span>
  </div>
);

// =====================================================
// LECTURE CARD COMPONENT
// =====================================================

const LectureCard = ({ 
  lecture, 
  lectureNumber, 
  isLatest, 
  isExpanded, 
  onToggle,
  onOpenViewer 
}) => {
  const topicsCount = lecture.topicsCovered?.length || 0;
  const slidesCount = lecture.slides?.length || 0;
  const videosCount = lecture.videos?.length || 0;
  const readingsCount = lecture.readingMaterials?.length || 0;

  return (
    <div className={`lectures-card ${isExpanded ? 'expanded' : ''}`}>
      {/* Card Header */}
      <div className="lectures-card-header" onClick={onToggle}>
        {/* Lecture Number Badge */}
        <div className="lectures-number-badge">
          <span className="lecture-label">L</span>
          <span className="lecture-num">{lectureNumber}</span>
        </div>
        
        {/* Main Info */}
        <div className="lectures-main-info">
          <div className="lectures-title-row">
            <h3 className="lectures-title">{lecture.title}</h3>
            {isLatest && <span className="new-badge">NEW</span>}
          </div>
          
          <div className="lectures-metadata">
            {lecture.date && (
              <span className="meta-item">
                <FaCalendarAlt />
                {formatDate(lecture.date)}
              </span>
            )}
            {topicsCount > 0 && (
              <span className="meta-item">
                <FaTag />
                {topicsCount} topics
              </span>
            )}
          </div>
        </div>
        
        {/* Right Section - Indicators */}
        <div className="lectures-right-section">
          <div className="lectures-indicators">
            {lecture.isPublished && (
              <span className="status-badge published">
                <FaCheckCircle /> Published
              </span>
            )}
            <div className="resource-indicators">
              {slidesCount > 0 && (
                <span className="indicator-badge slides">
                  <FaFileAlt /> {slidesCount}
                </span>
              )}
              {videosCount > 0 && (
                <span className="indicator-badge videos">
                  <FaVideo /> {videosCount}
                </span>
              )}
              {readingsCount > 0 && (
                <span className="indicator-badge readings">
                  <FaBookOpen /> {readingsCount}
                </span>
              )}
            </div>
          </div>
          
          <button className="lectures-expand-btn">
            <FaChevronDown className={isExpanded ? 'rotated' : ''} />
          </button>
        </div>
      </div>
      
      {/* Preview Section (Collapsed) */}
      {!isExpanded && lecture.description && (
        <div className="lectures-preview">
          <p className="preview-text">{truncateText(lecture.description, 150)}</p>
          
          {topicsCount > 0 && (
            <div className="topic-pills-preview">
              {lecture.topicsCovered.slice(0, 3).map((topic, i) => (
                <span key={i} className="topic-pill">{topic}</span>
              ))}
              {topicsCount > 3 && (
                <span className="more-topics">+{topicsCount - 3} more</span>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Expanded Content */}
      {isExpanded && (
        <div className="lectures-expanded-content">
          {/* Description Section */}
          {lecture.description && (
            <section className="lectures-content-section">
              <h4 className="section-title">
                <FaInfoCircle /> Lecture Overview
              </h4>
              <p className="lectures-description">{lecture.description}</p>
            </section>
          )}
          
          {/* Topics Grid */}
          {topicsCount > 0 && (
            <section className="lectures-content-section">
              <h4 className="section-title">
                <FaTag /> Topics Covered
              </h4>
              <div className="topics-grid">
                {lecture.topicsCovered.map((topic, index) => (
                  <div key={index} className="topic-card">
                    <span className="topic-number">{index + 1}</span>
                    <span className="topic-name">{topic}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
          
          {/* Slides & Materials */}
          {slidesCount > 0 && (
            <section className="lectures-content-section">
              <h4 className="section-title">
                <FaFileAlt /> Slides & Materials
              </h4>
              <div className="materials-grid">
                {lecture.slides.map((slide, index) => (
                  <div key={index} className="material-card">
                    <div className="material-icon-wrapper">
                      <FaFileAlt />
                    </div>
                    <div className="material-info">
                      <h5 className="material-title">{slide.title}</h5>
                      <span className="material-meta">
                        {getContentType(slide.url) === 'slides' ? 'Google Slides' : 'PDF Document'}
                      </span>
                    </div>
                    <div className="material-actions">
                      <button 
                        className="action-btn view-btn"
                        onClick={() => onOpenViewer(slide, lecture.slides, index)}
                      >
                        <FaEye /> View
                      </button>
                      {getDownloadUrl(slide.url) && (
                        <a 
                          href={getDownloadUrl(slide.url)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="action-btn download-btn"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FaDownload /> Download
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
          
          {/* Videos */}
          {videosCount > 0 && (
            <section className="lectures-content-section">
              <h4 className="section-title">
                <FaVideo /> Video Lectures
              </h4>
              <div className="videos-grid">
                {lecture.videos.map((video, index) => (
                  <div key={index} className="video-card">
                    <div className="video-thumbnail">
                      {getYouTubeThumbnail(video.url) ? (
                        <img src={getYouTubeThumbnail(video.url)} alt={video.title} />
                      ) : (
                        <div className="video-placeholder">
                          <FaPlayCircle />
                        </div>
                      )}
                      <div className="play-overlay">
                        <FaPlayCircle />
                      </div>
                      {video.duration && (
                        <span className="video-duration">{video.duration}</span>
                      )}
                    </div>
                    <div className="video-info">
                      <h5 className="video-title">{video.title}</h5>
                      <button 
                        className="watch-btn"
                        onClick={() => onOpenViewer(video, lecture.videos, index)}
                      >
                        <FaPlay /> Watch Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
          
          {/* Reading Materials */}
          {readingsCount > 0 && (
            <section className="lectures-content-section">
              <h4 className="section-title">
                <FaBookOpen /> Reading Materials
              </h4>
              <div className="readings-list">
                {lecture.readingMaterials.map((reading, index) => (
                  <a 
                    key={index}
                    href={reading.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="reading-item"
                    onClick={(e) => {
                      if (reading.url && canEmbed(reading.url)) {
                        e.preventDefault();
                        const embedReads = lecture.readingMaterials.filter(r => r.url && canEmbed(r.url));
                        const embIdx = embedReads.findIndex(r => r.url === reading.url);
                        if (embIdx >= 0) onOpenViewer(reading, embedReads, embIdx);
                      }
                    }}
                  >
                    <div className="reading-icon">
                      <FaBook />
                    </div>
                    <div className="reading-content">
                      <h5 className="reading-title">{reading.title}</h5>
                      {reading.author && (
                        <span className="reading-author">— {reading.author}</span>
                      )}
                    </div>
                    <div className="reading-action">
                      <FaExternalLinkAlt />
                      <span>Open</span>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

// =====================================================
// MAIN LECTURES PAGE COMPONENT
// =====================================================

const LecturesPage = () => {
  const [courses, setCourses] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(true);
  const [lecturesLoading, setLecturesLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lecturesError, setLecturesError] = useState(null);
  const [expandedLecture, setExpandedLecture] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('oldest'); // 'oldest', 'newest', 'number'
  
  // Viewer state
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerContent, setViewerContent] = useState(null);
  const [allViewerContent, setAllViewerContent] = useState([]);
  const [currentContentIndex, setCurrentContentIndex] = useState(0);

  useEffect(() => { loadCourses(); }, []);
  useEffect(() => {
    if (selectedCourse) loadLectures();
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
      setError(err.response?.data?.message || 'Unable to load courses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadLectures = async () => {
    try {
      setLecturesLoading(true);
      setLecturesError(null);
      const response = await lectureAPI.getByCourse(selectedCourse);
      setLectures(response.data.data || []);
    } catch (err) { 
      console.error('Error loading lectures:', err);
      setLecturesError(err.response?.data?.message || 'Unable to load lectures. Please try again.');
    } finally {
      setLecturesLoading(false);
    }
  };

  const handleRetry = () => {
    if (error) {
      loadCourses();
    } else if (lecturesError) {
      loadLectures();
    }
  };

  const toggleLecture = (lectureId) => {
    setExpandedLecture(expandedLecture === lectureId ? null : lectureId);
  };

  // Sort and filter lectures
  const processedLectures = useMemo(() => {
    let filtered = [...lectures];
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(lecture => 
        lecture.title?.toLowerCase().includes(query) ||
        lecture.description?.toLowerCase().includes(query) ||
        lecture.topicsCovered?.some(topic => topic.toLowerCase().includes(query))
      );
    }
    
    // Sort
    filtered.sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.date) - new Date(a.date);
      } else if (sortOrder === 'oldest') {
        return new Date(a.date) - new Date(b.date);
      } else {
        return (a.lectureNumber || 0) - (b.lectureNumber || 0);
      }
    });
    
    // Add proper sequential numbering based on date order (oldest first)
    const dateOrdered = [...lectures].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return filtered.map(lecture => ({
      ...lecture,
      displayNumber: dateOrdered.findIndex(l => l._id === lecture._id) + 1
    }));
  }, [lectures, searchQuery, sortOrder]);

  // Calculate statistics
  const stats = useMemo(() => ({
    totalLectures: lectures.length,
    totalVideos: lectures.reduce((acc, l) => acc + (l.videos?.length || 0), 0),
    totalSlides: lectures.reduce((acc, l) => acc + (l.slides?.length || 0), 0),
    totalReadings: lectures.reduce((acc, l) => acc + (l.readingMaterials?.length || 0), 0)
  }), [lectures]);

  // Viewer functions
  const openViewer = (content, allContent, index) => {
    setViewerContent(content);
    setAllViewerContent(allContent);
    setCurrentContentIndex(index);
    setViewerOpen(true);
  };

  const navigateViewer = (index) => {
    setCurrentContentIndex(index);
    setViewerContent(allViewerContent[index]);
  };

  const closeViewer = () => {
    setViewerOpen(false);
    setViewerContent(null);
    setAllViewerContent([]);
    setCurrentContentIndex(0);
  };

  return (
    <div className="public-page lectures-page">
      <Header userRole="student" />
      
      <main className="lectures-main-container">
        {/* Hero Section */}
        <div className="lectures-hero-section">
          <div className="lectures-hero-content">
            <div className="lectures-course-badge">
              <FaGraduationCap /> COURSE CONTENT
            </div>
            <h1 className="lectures-page-title">Lecture Library</h1>
            <p className="lectures-page-subtitle">
              Browse through all lectures, videos, slides and learning materials
            </p>
          </div>
          
          <div className="lectures-stats-grid">
            <StatCard 
              icon={<FaBookOpen />}
              value={stats.totalLectures}
              label="Lectures"
              gradient="blue"
            />
            <StatCard 
              icon={<FaVideo />}
              value={stats.totalVideos}
              label="Video Sessions"
              gradient="purple"
            />
            <StatCard 
              icon={<FaFileAlt />}
              value={stats.totalSlides}
              label="Slide Decks"
              gradient="green"
            />
            <StatCard 
              icon={<FaBook />}
              value={stats.totalReadings}
              label="Readings"
              gradient="orange"
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <span className="loading-text">Loading lectures...</span>
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
            {/* Course Selector & Controls */}
            <div className="lectures-controls-section">
              <div className="lectures-course-selector">
                <CourseDropdown 
                  courses={courses}
                  selectedCourse={selectedCourse}
                  onSelect={setSelectedCourse}
                  icon={FaGraduationCap}
                  label="Select Course:"
                  accentColor="#667eea"
                />
              </div>
              
              <div className="lectures-filter-controls">
                <div className="lectures-search-box">
                  <FaSearch className="search-icon" />
                  <input 
                    type="text" 
                    placeholder="Search lectures by title or topic..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="lectures-sort-dropdown">
                  <FaSortAmountDown className="sort-icon" />
                  <select 
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                  >
                    <option value="oldest">Oldest First (Chronological)</option>
                    <option value="newest">Newest First</option>
                    <option value="number">By Lecture Number</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Lectures List */}
            <section className="lectures-list-section">
              {lecturesLoading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <span className="loading-text">Loading lectures...</span>
                </div>
              ) : lecturesError ? (
                <div className="error-state-enhanced">
                  <div className="error-icon-wrapper">
                    <FaExclamationTriangle className="error-icon" />
                  </div>
                  <h3>Unable to Load Lectures</h3>
                  <p>{lecturesError}</p>
                  <button onClick={handleRetry} className="retry-btn">
                    <FaSync /> Try Again
                  </button>
                </div>
              ) : processedLectures.length === 0 ? (
                <div className="empty-state-enhanced">
                  <div className="empty-icon-wrapper">
                    <FaBook className="empty-icon" />
                  </div>
                  <h3>{searchQuery ? 'No Lectures Found' : 'No Lectures Available'}</h3>
                  <p>
                    {searchQuery 
                      ? `No lectures match "${searchQuery}". Try a different search term.`
                      : 'Lectures will appear here once published by the instructor.'}
                  </p>
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="retry-btn">
                      Clear Search
                    </button>
                  )}
                </div>
              ) : (
                <div className="lectures-list">
                  {processedLectures.map((lecture, index) => (
                    <LectureCard
                      key={lecture._id}
                      lecture={lecture}
                      lectureNumber={lecture.displayNumber}
                      isLatest={index === processedLectures.length - 1 && sortOrder === 'oldest'}
                      isExpanded={expandedLecture === lecture._id}
                      onToggle={() => toggleLecture(lecture._id)}
                      onOpenViewer={openViewer}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
      
      {/* Content Viewer Modal */}
      {viewerOpen && viewerContent && (
        <ContentViewer
          content={viewerContent}
          onClose={closeViewer}
          allContent={allViewerContent}
          currentIndex={currentContentIndex}
          onNavigate={navigateViewer}
        />
      )}
      
      <Footer />
    </div>
  );
};

export default LecturesPage;
