import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { courseAPI, resourceAPI } from '../../services/api';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import CourseDropdown from '../../components/CourseDropdown';
import { 
  FaExternalLinkAlt, 
  FaStar, 
  FaSearch, 
  FaBook, 
  FaGraduationCap, 
  FaFileAlt, 
  FaTools, 
  FaUsers, 
  FaDatabase, 
  FaBookOpen,
  FaEllipsisH,
  FaUser,
  FaBuilding,
  FaCalendarAlt,
  FaBookmark,
  FaRegBookmark,
  FaShare,
  FaTimes,
  FaFilter,
  FaTh,
  FaLayerGroup,
  FaArrowRight,
  FaSortAmountDown,
  FaCheck,
  FaLink,
  FaCopy
} from 'react-icons/fa';
import './PublicPages.css';
import './ResourcesPage.css';

// Category configuration with icons, colors, and emojis
const categoryConfig = {
  'Books': { 
    icon: <FaBook />, 
    emoji: '📚', 
    color: '#3b82f6', 
    bgColor: 'rgba(59, 130, 246, 0.1)',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
  },
  'Online Courses': { 
    icon: <FaGraduationCap />, 
    emoji: '🎓', 
    color: '#10b981', 
    bgColor: 'rgba(16, 185, 129, 0.1)',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
  },
  'Research Papers': { 
    icon: <FaFileAlt />, 
    emoji: '📄', 
    color: '#8b5cf6', 
    bgColor: 'rgba(139, 92, 246, 0.1)',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
  },
  'Tools & Frameworks': { 
    icon: <FaTools />, 
    emoji: '🛠️', 
    color: '#f59e0b', 
    bgColor: 'rgba(245, 158, 11, 0.1)',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
  },
  'Communities': { 
    icon: <FaUsers />, 
    emoji: '👥', 
    color: '#ec4899', 
    bgColor: 'rgba(236, 72, 153, 0.1)',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)'
  },
  'Datasets': { 
    icon: <FaDatabase />, 
    emoji: '📊', 
    color: '#14b8a6', 
    bgColor: 'rgba(20, 184, 166, 0.1)',
    gradient: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)'
  },
  'Documentation': { 
    icon: <FaBookOpen />, 
    emoji: '📖', 
    color: '#6b7280', 
    bgColor: 'rgba(107, 114, 128, 0.1)',
    gradient: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
  },
  'Other': { 
    icon: <FaEllipsisH />, 
    emoji: '📦', 
    color: '#64748b', 
    bgColor: 'rgba(100, 116, 139, 0.1)',
    gradient: 'linear-gradient(135deg, #64748b 0%, #475569 100%)'
  }
};

// Get category config with fallback
const getCategoryConfig = (category) => {
  return categoryConfig[category] || categoryConfig['Other'];
};

// Sort options
const sortOptions = [
  { value: 'order', label: 'Display Order' },
  { value: 'title-asc', label: 'Title (A-Z)' },
  { value: 'title-desc', label: 'Title (Z-A)' },
  { value: 'year-desc', label: 'Newest First' },
  { value: 'year-asc', label: 'Oldest First' },
];

// Resource Card Component
const ResourceCard = ({ resource, onTagClick, bookmarks, toggleBookmark, animationDelay }) => {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const config = getCategoryConfig(resource.category);
  const isBookmarked = bookmarks.includes(resource._id);
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: resource.title,
          text: resource.description,
          url: resource.url
        });
      } catch (err) {
        setShowShareMenu(true);
      }
    } else {
      setShowShareMenu(true);
    }
  };
  
  const copyLink = () => {
    navigator.clipboard.writeText(resource.url);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setShowShareMenu(false);
    }, 1500);
  };
  
  return (
    <article 
      className="resource-card"
      style={{ 
        '--category-color': config.color,
        '--category-bg': config.bgColor,
        animationDelay: `${animationDelay}s`
      }}
    >
      {/* Category Accent */}
      <div 
        className="resource-card-accent"
        style={{ background: config.gradient }}
      />
      
      {/* Card Header with Icon */}
      <div className="resource-card-header">
        <div 
          className="resource-icon-wrapper"
          style={{ background: config.gradient }}
        >
          {resource.icon ? (
            <span className="resource-custom-icon">{resource.icon}</span>
          ) : (
            <span className="resource-category-icon">{config.emoji}</span>
          )}
        </div>
        
        <div className="resource-header-badges">
          <span 
            className="resource-category-badge"
            style={{ background: config.bgColor, color: config.color }}
          >
            {config.icon}
            <span>{resource.category}</span>
          </span>
          
          {resource.isPremium && (
            <span className="resource-premium-badge">
              <FaStar /> Premium
            </span>
          )}
        </div>
      </div>
      
      {/* Card Body */}
      <div className="resource-card-body">
        <h3 className="resource-title">
          <a 
            href={resource.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="resource-title-link"
          >
            {resource.title}
            <FaExternalLinkAlt className="external-link-icon" />
          </a>
        </h3>
        
        {resource.description && (
          <p className="resource-description">{resource.description}</p>
        )}
      </div>
      
      {/* Metadata Section */}
      <div className="resource-metadata">
        {resource.author && (
          <div className="resource-meta-item">
            <FaUser className="meta-icon" />
            <span className="meta-value">{resource.author}</span>
          </div>
        )}
        {resource.publisher && (
          <div className="resource-meta-item">
            <FaBuilding className="meta-icon" />
            <span className="meta-value">{resource.publisher}</span>
          </div>
        )}
        {resource.year && (
          <div className="resource-meta-item">
            <FaCalendarAlt className="meta-icon" />
            <span className="meta-value">{resource.year}</span>
          </div>
        )}
      </div>
      
      {/* Tags Section */}
      {resource.tags && resource.tags.length > 0 && (
        <div className="resource-tags">
          {resource.tags.map((tag, i) => (
            <button 
              key={i} 
              className="resource-tag"
              onClick={() => onTagClick(tag)}
              title={`Filter by "${tag}"`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
      
      {/* Card Actions */}
      <div className="resource-card-actions">
        <button 
          className={`resource-action-btn bookmark-btn ${isBookmarked ? 'active' : ''}`}
          onClick={() => toggleBookmark(resource._id)}
          title={isBookmarked ? 'Remove bookmark' : 'Bookmark this resource'}
        >
          {isBookmarked ? <FaBookmark /> : <FaRegBookmark />}
        </button>
        
        <div className="share-container">
          <button 
            className="resource-action-btn share-btn"
            onClick={handleShare}
            title="Share this resource"
          >
            <FaShare />
          </button>
          
          {showShareMenu && (
            <div className="share-menu">
              <button onClick={copyLink} className="share-menu-item">
                {copied ? <FaCheck /> : <FaCopy />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
              <button onClick={() => setShowShareMenu(false)} className="share-menu-close">
                <FaTimes />
              </button>
            </div>
          )}
        </div>
        
        {resource.url && (
          <a 
            href={resource.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="resource-visit-btn"
          >
            Visit Resource
            <FaArrowRight />
          </a>
        )}
      </div>
    </article>
  );
};

// Category Filter Card Component
const CategoryFilterCard = ({ category, count, isActive, onClick, config }) => (
  <button 
    className={`category-filter-card ${isActive ? 'active' : ''}`}
    onClick={onClick}
    style={{ 
      '--category-color': config.color,
      '--category-bg': config.bgColor 
    }}
  >
    <div 
      className="category-filter-icon"
      style={{ background: isActive ? config.gradient : config.bgColor }}
    >
      {config.emoji}
    </div>
    <span className="category-filter-label">{category}</span>
    <span className="category-filter-count">{count}</span>
  </button>
);

// Stats Card Component
const StatsCard = ({ icon, value, label, color }) => (
  <div className="resources-stat-card" style={{ '--stat-color': color }}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-content">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  </div>
);

const ResourcesPage = () => {
  const [courses, setCourses] = useState([]);
  const [resources, setResources] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState('order');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'category'
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [bookmarks, setBookmarks] = useState(() => {
    const saved = localStorage.getItem('resourceBookmarks');
    return saved ? JSON.parse(saved) : [];
  });

  const categories = ['All', 'Books', 'Online Courses', 'Research Papers', 'Tools & Frameworks', 'Communities', 'Datasets', 'Documentation', 'Other'];

  useEffect(() => { loadCourses(); }, []);
  useEffect(() => { if (selectedCourse) loadResources(); }, [selectedCourse]);
  
  // Save bookmarks to localStorage
  useEffect(() => {
    localStorage.setItem('resourceBookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const loadCourses = async () => {
    try {
      const r = await courseAPI.getAll();
      const d = r.data.data || [];
      setCourses(d);
      if (d.length > 0) setSelectedCourse(d[0]._id);
      setLoading(false);
    } catch (e) { console.error(e); setLoading(false); }
  };

  const loadResources = async () => {
    try {
      const r = await resourceAPI.getByCourse(selectedCourse);
      setResources(r.data.data || []);
    } catch (e) { console.error(e); }
  };

  // Toggle bookmark
  const toggleBookmark = useCallback((resourceId) => {
    setBookmarks(prev => 
      prev.includes(resourceId) 
        ? prev.filter(id => id !== resourceId)
        : [...prev, resourceId]
    );
  }, []);

  // Handle tag click
  const handleTagClick = useCallback((tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  }, []);

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set();
    resources.forEach(r => {
      if (r.tags) r.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [resources]);

  // Get category counts
  const categoryCounts = useMemo(() => {
    const counts = { All: resources.length };
    resources.forEach(r => {
      counts[r.category] = (counts[r.category] || 0) + 1;
    });
    return counts;
  }, [resources]);

  // Filter and sort resources
  const filteredResources = useMemo(() => {
    let result = [...resources];
    
    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter(r => r.category === selectedCategory);
    }
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(r => 
        r.title?.toLowerCase().includes(query) ||
        r.description?.toLowerCase().includes(query) ||
        r.author?.toLowerCase().includes(query) ||
        r.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Tags filter
    if (selectedTags.length > 0) {
      result = result.filter(r => 
        r.tags && selectedTags.every(tag => r.tags.includes(tag))
      );
    }
    
    // Sort
    switch (sortBy) {
      case 'title-asc':
        result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      case 'title-desc':
        result.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
        break;
      case 'year-desc':
        result.sort((a, b) => (b.year || 0) - (a.year || 0));
        break;
      case 'year-asc':
        result.sort((a, b) => (a.year || 0) - (b.year || 0));
        break;
      default:
        result.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    }
    
    return result;
  }, [resources, selectedCategory, searchQuery, selectedTags, sortBy]);

  // Group resources by category for category view
  const groupedResources = useMemo(() => {
    const groups = {};
    filteredResources.forEach(r => {
      if (!groups[r.category]) groups[r.category] = [];
      groups[r.category].push(r);
    });
    return groups;
  }, [filteredResources]);

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setSelectedTags([]);
    setSortBy('order');
  };

  const hasActiveFilters = selectedCategory !== 'All' || searchQuery || selectedTags.length > 0;

  return (
    <div className="public-page">
      <Header />
      <main className="main-container resources-page">
        {/* Hero Section */}
        <section className="resources-hero">
          <div className="resources-hero-content">
            <div className="resources-hero-icon">
              <FaBook />
            </div>
            <div className="resources-hero-text">
              <h1 className="resources-hero-title">Learning Resources Hub</h1>
              <p className="resources-hero-subtitle">
                Curated collection of books, papers, tools, and materials for Deep Learning
              </p>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="resources-search-container">
            <div className="resources-search-wrapper">
              <FaSearch className="search-icon" />
              <input
                type="text"
                className="resources-search-input"
                placeholder="Search resources by title, author, or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  className="search-clear-btn"
                  onClick={() => setSearchQuery('')}
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="resources-stats">
            <StatsCard 
              icon="📚" 
              value={resources.length} 
              label="Total Resources" 
              color="#6366f1"
            />
            <StatsCard 
              icon="📂" 
              value={Object.keys(categoryCounts).length - 1} 
              label="Categories" 
              color="#10b981"
            />
            <StatsCard 
              icon="🏷️" 
              value={allTags.length} 
              label="Topics" 
              color="#f59e0b"
            />
            <StatsCard 
              icon="⭐" 
              value={bookmarks.length} 
              label="Bookmarked" 
              color="#ec4899"
            />
          </div>
        </section>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <span className="loading-text">Loading resources...</span>
          </div>
        ) : (
          <>
            {/* Course Selector & Controls */}
            <div className="resources-controls">
              <CourseDropdown 
                courses={courses}
                selectedCourse={selectedCourse}
                onSelect={setSelectedCourse}
                icon={FaBookOpen}
                label="Course:"
                accentColor="#6366f1"
              />
              
              <div className="resources-view-controls">
                {/* View Mode Toggle */}
                <div className="view-toggle">
                  <button 
                    className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setViewMode('grid')}
                    title="Grid View"
                  >
                    <FaTh /> Grid
                  </button>
                  <button 
                    className={`view-toggle-btn ${viewMode === 'category' ? 'active' : ''}`}
                    onClick={() => setViewMode('category')}
                    title="Category View"
                  >
                    <FaLayerGroup /> By Category
                  </button>
                </div>
                
                {/* Sort Dropdown */}
                <div className="sort-dropdown">
                  <FaSortAmountDown className="sort-icon" />
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="sort-select"
                  >
                    {sortOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                
                {/* Filter Toggle (Mobile) */}
                <button 
                  className="filter-toggle-btn"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <FaFilter />
                  Filters
                  {hasActiveFilters && <span className="filter-badge"></span>}
                </button>
              </div>
            </div>

            {/* Category Filter Cards */}
            <div className={`resources-filters ${showFilters ? 'show' : ''}`}>
              <div className="category-filters">
                <CategoryFilterCard
                  category="All"
                  count={resources.length}
                  isActive={selectedCategory === 'All'}
                  onClick={() => setSelectedCategory('All')}
                  config={{ emoji: '🌐', color: '#6366f1', bgColor: 'rgba(99, 102, 241, 0.1)', gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
                />
                {categories.slice(1).map(cat => (
                  <CategoryFilterCard
                    key={cat}
                    category={cat}
                    count={categoryCounts[cat] || 0}
                    isActive={selectedCategory === cat}
                    onClick={() => setSelectedCategory(cat)}
                    config={getCategoryConfig(cat)}
                  />
                ))}
              </div>
              
              {/* Tag Cloud */}
              {allTags.length > 0 && (
                <div className="resources-tag-cloud">
                  <h4 className="tag-cloud-title">
                    <FaLink /> Filter by Tags
                  </h4>
                  <div className="tag-cloud-container">
                    {allTags.map(tag => (
                      <button
                        key={tag}
                        className={`tag-cloud-item ${selectedTags.includes(tag) ? 'active' : ''}`}
                        onClick={() => handleTagClick(tag)}
                      >
                        {tag}
                        {selectedTags.includes(tag) && <FaTimes className="tag-remove" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Active Filters */}
              {hasActiveFilters && (
                <div className="active-filters">
                  <span className="active-filters-label">Active filters:</span>
                  {selectedCategory !== 'All' && (
                    <span className="active-filter-chip">
                      {selectedCategory}
                      <button onClick={() => setSelectedCategory('All')}><FaTimes /></button>
                    </span>
                  )}
                  {selectedTags.map(tag => (
                    <span key={tag} className="active-filter-chip">
                      {tag}
                      <button onClick={() => handleTagClick(tag)}><FaTimes /></button>
                    </span>
                  ))}
                  <button className="clear-filters-btn" onClick={clearFilters}>
                    Clear All
                  </button>
                </div>
              )}
            </div>

            {/* Results Count */}
            <div className="resources-results-info">
              <span className="results-count">
                Showing <strong>{filteredResources.length}</strong> of <strong>{resources.length}</strong> resources
              </span>
            </div>

            {/* Resources Section */}
            <section className="resources-section" aria-label="Resources list">
              {filteredResources.length === 0 ? (
                <div className="resources-empty-state">
                  <div className="empty-state-illustration">
                    <div className="empty-icon-wrapper">
                      <FaSearch className="empty-search-icon" />
                    </div>
                  </div>
                  <h3 className="empty-state-title">No Resources Found</h3>
                  <p className="empty-state-text">
                    {searchQuery 
                      ? `No resources match "${searchQuery}". Try a different search term.`
                      : 'No resources available for the selected filters.'
                    }
                  </p>
                  {hasActiveFilters && (
                    <button className="empty-state-btn" onClick={clearFilters}>
                      <FaTimes /> Clear Filters
                    </button>
                  )}
                </div>
              ) : viewMode === 'grid' ? (
                /* Grid View */
                <div className="resources-grid">
                  {filteredResources.map((r, index) => (
                    <ResourceCard
                      key={r._id}
                      resource={r}
                      onTagClick={handleTagClick}
                      bookmarks={bookmarks}
                      toggleBookmark={toggleBookmark}
                      animationDelay={index * 0.05}
                    />
                  ))}
                </div>
              ) : (
                /* Category View */
                <div className="resources-category-view">
                  {Object.entries(groupedResources).map(([category, categoryResources]) => {
                    const config = getCategoryConfig(category);
                    return (
                      <div key={category} className="category-group">
                        <div 
                          className="category-group-header"
                          style={{ '--category-color': config.color }}
                        >
                          <div 
                            className="category-group-icon"
                            style={{ background: config.gradient }}
                          >
                            {config.emoji}
                          </div>
                          <h2 className="category-group-title">{category}</h2>
                          <span className="category-group-count">
                            {categoryResources.length} resource{categoryResources.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="resources-grid">
                          {categoryResources.map((r, index) => (
                            <ResourceCard
                              key={r._id}
                              resource={r}
                              onTagClick={handleTagClick}
                              bookmarks={bookmarks}
                              toggleBookmark={toggleBookmark}
                              animationDelay={index * 0.05}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
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

export default ResourcesPage;