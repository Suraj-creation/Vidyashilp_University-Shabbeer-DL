import React, { useState, useEffect } from 'react';
import { courseAPI, prerequisiteAPI } from '../../services/api';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import CourseDropdown from '../../components/CourseDropdown';
import { 
  FaClock, 
  FaExternalLinkAlt, 
  FaCode, 
  FaTrophy, 
  FaBook, 
  FaVideo, 
  FaFileAlt, 
  FaLink,
  FaChevronDown,
  FaChevronUp,
  FaCheckCircle,
  FaGraduationCap,
  FaLayerGroup,
  FaLightbulb
} from 'react-icons/fa';
import './PublicPages.css';
import './PrerequisitesPage.css';

// Helper function to parse description text and convert to proper HTML structure
const parseDescription = (text) => {
  if (!text) return null;
  
  // Split by newlines
  const lines = text.split('\n').filter(line => line.trim());
  
  const elements = [];
  let currentList = [];
  let listIndex = 0;
  
  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    
    // Check if line is a bullet point
    if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('• ') || trimmedLine.startsWith('* ')) {
      const bulletContent = trimmedLine.substring(2).trim();
      currentList.push(bulletContent);
    } else {
      // If we have accumulated list items, render them first
      if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${listIndex}`} className="prereq-description-list">
            {currentList.map((item, i) => (
              <li key={i}>{highlightKeywords(item)}</li>
            ))}
          </ul>
        );
        currentList = [];
        listIndex++;
      }
      // Render as paragraph
      elements.push(
        <p key={`para-${index}`} className="prereq-description-paragraph">
          {highlightKeywords(trimmedLine)}
        </p>
      );
    }
  });
  
  // Don't forget remaining list items
  if (currentList.length > 0) {
    elements.push(
      <ul key={`list-${listIndex}`} className="prereq-description-list">
        {currentList.map((item, i) => (
          <li key={i}>{highlightKeywords(item)}</li>
        ))}
      </ul>
    );
  }
  
  return elements;
};

// Helper function to highlight important keywords
const highlightKeywords = (text) => {
  const keywords = [
    'required',
    'must have',
    'essential',
    'important',
    'recommended',
    'strongly recommended',
    'prerequisite',
    'mandatory',
    'fundamental',
    'basic understanding',
    'prior knowledge'
  ];
  
  let result = text;
  keywords.forEach(keyword => {
    const regex = new RegExp(`(${keyword})`, 'gi');
    result = result.replace(regex, '<strong>$1</strong>');
  });
  
  // Return as dangerouslySetInnerHTML for highlighted text
  return <span dangerouslySetInnerHTML={{ __html: result }} />;
};

// Get resource icon based on type
const getResourceIcon = (type) => {
  const iconMap = {
    'video': <FaVideo />,
    'article': <FaFileAlt />,
    'book': <FaBook />,
    'course': <FaGraduationCap />,
    'documentation': <FaFileAlt />,
    'tutorial': <FaLightbulb />,
  };
  return iconMap[type?.toLowerCase()] || <FaLink />;
};

// Prerequisite Card Component
const PrerequisiteCard = ({ prereq, index }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const getLevelConfig = (level) => {
    const configs = {
      'Beginner': {
        color: '#10B981',
        bgColor: 'rgba(16, 185, 129, 0.1)',
        borderColor: '#10B981',
        icon: '🌱',
        label: 'Beginner'
      },
      'Intermediate': {
        color: '#F59E0B',
        bgColor: 'rgba(245, 158, 11, 0.1)',
        borderColor: '#F59E0B',
        icon: '⚡',
        label: 'Intermediate'
      },
      'Advanced': {
        color: '#EF4444',
        bgColor: 'rgba(239, 68, 68, 0.1)',
        borderColor: '#EF4444',
        icon: '🚀',
        label: 'Advanced'
      }
    };
    return configs[level] || configs['Beginner'];
  };
  
  const levelConfig = getLevelConfig(prereq.level);
  
  return (
    <article 
      className="prereq-card"
      style={{ 
        '--level-color': levelConfig.color,
        '--level-bg': levelConfig.bgColor,
        animationDelay: `${index * 0.1}s`
      }}
    >
      {/* Level Accent Bar */}
      <div 
        className="prereq-card-accent"
        style={{ background: `linear-gradient(135deg, ${levelConfig.color} 0%, ${levelConfig.color}99 100%)` }}
      />
      
      {/* Card Header */}
      <header className="prereq-card-header">
        <div className="prereq-title-section">
          <h2 className="prereq-title">{prereq.title}</h2>
          <span 
            className="prereq-level-badge"
            style={{ 
              background: levelConfig.bgColor, 
              color: levelConfig.color,
              border: `1px solid ${levelConfig.color}30`
            }}
          >
            <FaTrophy className="level-icon" />
            {levelConfig.icon} {levelConfig.label}
          </span>
        </div>
        
        <button 
          className="prereq-expand-btn"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
        >
          {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </header>
      
      {/* Metadata Row */}
      <div className="prereq-metadata">
        {prereq.courseCode && (
          <div className="prereq-meta-item">
            <FaCode className="meta-icon" />
            <span className="prereq-course-code">{prereq.courseCode}</span>
          </div>
        )}
        
        {prereq.estimatedDuration && (
          <div className="prereq-meta-item">
            <FaClock className="meta-icon" />
            <span className="prereq-duration">{prereq.estimatedDuration}</span>
          </div>
        )}
        
        {prereq.level && (
          <div className="prereq-meta-item prereq-meta-level">
            <FaLayerGroup className="meta-icon" />
            <span>Difficulty: {prereq.level}</span>
          </div>
        )}
      </div>
      
      {/* Collapsible Content */}
      <div className={`prereq-content ${isExpanded ? 'expanded' : 'collapsed'}`}>
        {/* Description Section */}
        {prereq.description && (
          <section className="prereq-description-section">
            <h3 className="prereq-section-title">
              <FaFileAlt className="section-icon" />
              Description
            </h3>
            <div className="prereq-description-content">
              {parseDescription(prereq.description)}
            </div>
          </section>
        )}
        
        {/* Duration Progress Indicator */}
        {prereq.estimatedDuration && (
          <div className="prereq-time-indicator">
            <div className="time-indicator-header">
              <FaClock className="time-icon" />
              <span className="time-label">Estimated Study Time</span>
            </div>
            <div className="time-indicator-bar">
              <div 
                className="time-indicator-fill"
                style={{ 
                  width: getTimePercentage(prereq.estimatedDuration),
                  background: `linear-gradient(90deg, ${levelConfig.color} 0%, ${levelConfig.color}80 100%)`
                }}
              />
            </div>
            <span className="time-value">{prereq.estimatedDuration}</span>
          </div>
        )}
        
        {/* Learning Resources Section */}
        {prereq.resources && prereq.resources.length > 0 && (
          <section className="prereq-resources-section">
            <h3 className="prereq-section-title">
              <FaBook className="section-icon" />
              Learning Resources
            </h3>
            <ul className="prereq-resource-list">
              {prereq.resources.map((resource, i) => (
                <li key={i} className="prereq-resource-item">
                  <a 
                    href={resource.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="prereq-resource-link"
                  >
                    <span className="resource-icon">
                      {getResourceIcon(resource.type)}
                    </span>
                    <span className="resource-title">{resource.title}</span>
                    <FaExternalLinkAlt className="external-icon" />
                  </a>
                  {resource.type && (
                    <span className="resource-type-badge">{resource.type}</span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
      
      {/* Card Footer with Status */}
      <footer className="prereq-card-footer">
        <div className="prereq-status">
          <FaCheckCircle className="status-icon" />
          <span>Review this prerequisite before starting the course</span>
        </div>
      </footer>
    </article>
  );
};

// Helper to calculate time percentage for progress bar
const getTimePercentage = (duration) => {
  if (!duration) return '50%';
  
  // Extract hours from duration string
  const hoursMatch = duration.match(/(\d+)\s*(?:hour|hr)/i);
  const weeksMatch = duration.match(/(\d+)\s*week/i);
  const daysMatch = duration.match(/(\d+)\s*day/i);
  
  let totalHours = 0;
  if (hoursMatch) totalHours += parseInt(hoursMatch[1]);
  if (weeksMatch) totalHours += parseInt(weeksMatch[1]) * 40;
  if (daysMatch) totalHours += parseInt(daysMatch[1]) * 8;
  
  // Cap at 100 hours for visualization
  const percentage = Math.min((totalHours / 100) * 100, 100);
  return `${Math.max(percentage, 15)}%`; // Minimum 15% for visibility
};

function PrerequisitesPage() {
  const [courses, setCourses] = useState([]);
  const [prerequisites, setPrerequisites] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadCourses(); }, []);
  useEffect(() => {
    if (selectedCourse) loadPrerequisites();
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

  const loadPrerequisites = async () => {
    try {
      const response = await prerequisiteAPI.getByCourse(selectedCourse);
      setPrerequisites(response.data.data || []);
    } catch (error) { console.error('Error:', error); }
  };

  return (
    <div className="public-page">
      <Header userRole="student" />
      
      <main className="main-container">
        {/* Page Header */}
        <div className="prereq-page-header">
          <div className="prereq-header-content">
            <div className="prereq-header-icon">
              <FaGraduationCap />
            </div>
            <div className="prereq-header-text">
              <h1 className="prereq-page-title">Course Prerequisites</h1>
              <p className="prereq-page-subtitle">
                Essential knowledge and recommended preparation to succeed in this course
              </p>
            </div>
          </div>
          
          {/* Legend */}
          <div className="prereq-legend">
            <span className="legend-title">Difficulty Levels:</span>
            <div className="legend-items">
              <span className="legend-item beginner">
                <span className="legend-dot"></span>
                🌱 Beginner
              </span>
              <span className="legend-item intermediate">
                <span className="legend-dot"></span>
                ⚡ Intermediate
              </span>
              <span className="legend-item advanced">
                <span className="legend-dot"></span>
                🚀 Advanced
              </span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <span className="loading-text">Loading prerequisites...</span>
          </div>
        ) : (
          <>
            {/* Course Selector */}
            <CourseDropdown 
              courses={courses}
              selectedCourse={selectedCourse}
              onSelect={setSelectedCourse}
              icon={FaLightbulb}
              label="Select Course:"
              accentColor="#22c55e"
            />

            {/* Prerequisites Grid */}
            <section className="prereq-section" aria-label="Prerequisites list">
              {prerequisites.length === 0 ? (
                <div className="prereq-empty-state">
                  <div className="empty-state-illustration">
                    <div className="empty-icon-wrapper">
                      <FaCheckCircle className="empty-check-icon" />
                    </div>
                  </div>
                  <h3 className="empty-state-title">No Prerequisites Required</h3>
                  <p className="empty-state-text">
                    Great news! This course has no specific prerequisites. 
                    You can start learning right away!
                  </p>
                </div>
              ) : (
                <>
                  <div className="prereq-count-badge">
                    <FaLayerGroup />
                    <span>{prerequisites.length} Prerequisite{prerequisites.length !== 1 ? 's' : ''} Found</span>
                  </div>
                  
                  <div className="prereq-grid">
                    {prerequisites.map((prereq, index) => (
                      <PrerequisiteCard 
                        key={prereq._id} 
                        prereq={prereq} 
                        index={index}
                      />
                    ))}
                  </div>
                </>
              )}
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default PrerequisitesPage;
