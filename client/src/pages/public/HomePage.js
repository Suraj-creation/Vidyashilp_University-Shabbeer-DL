import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { FaCommentDots, FaTimes } from 'react-icons/fa';
import { 
  FaBookOpen, 
  FaArrowRight, 
  FaGraduationCap,
  FaUserTie, 
  FaBrain, 
  FaLaptopCode, 
  FaRocket, 
  FaExternalLinkAlt,
  FaCheckCircle,
  FaClock,
  FaVideo,
  FaCode,
  FaNetworkWired,
  FaCogs,
  FaDatabase,
  FaMicrochip
} from 'react-icons/fa';
import './PublicPages.css';
import './HomePage.css';

// =====================================================
// HOMEPAGE COMPONENT - Premium Landing Page
// =====================================================

const HomePage = () => {
  const [showFeedbackPrompt, setShowFeedbackPrompt] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  // Show feedback prompt after a delay
  useEffect(() => {
    // Small delay so it feels natural after page load
    const showTimer = setTimeout(() => setShowFeedbackPrompt(true), 1000);

    // Start fade-out at 15s, fully hide at 15.5s
    const fadeTimer = setTimeout(() => setFadeOut(true), 15500);
    const hideTimer = setTimeout(() => {
      setShowFeedbackPrompt(false);
      setFadeOut(false);
    }, 16000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  const dismissFeedbackPrompt = () => {
    setFadeOut(true);
    setTimeout(() => {
      setShowFeedbackPrompt(false);
      setFadeOut(false);
    }, 400);
  };

  // Course Statistics
  const courseStats = [
    { icon: <FaClock />, value: '15 Weeks', label: 'Duration' },
    { icon: <FaVideo />, value: '40+ Hours', label: 'Video Content' },
    { icon: <FaCode />, value: '15 Labs', label: 'Hands-on Projects' }
  ];

  // Learning Outcomes
  const learningOutcomes = [
    {
      icon: <FaBrain />,
      title: 'CLO-1: Fundamental Concepts',
      description: 'Explain the fundamental concepts and working principles of both shallow and deep neural networks, including biological inspiration and mathematical foundations.',
      skills: ['Neural Network Theory', 'Mathematical Foundations', 'Activation Functions']
    },
    {
      icon: <FaNetworkWired />,
      title: 'CLO-2: Model Application',
      description: 'Apply suitable neural network models to solve given tasks by selecting appropriate architectures (feed-forward, CNN, RNN) based on data characteristics.',
      skills: ['Architecture Selection', 'Problem Analysis', 'Model Design']
    },
    {
      icon: <FaLaptopCode />,
      title: 'CLO-3: Implementation',
      description: 'Implement Deep Learning based AI Systems for real-world datasets using modern frameworks like PyTorch, TensorFlow, and Keras through 15 comprehensive lab programs.',
      skills: ['PyTorch', 'TensorFlow', 'Keras', 'Python']
    },
    {
      icon: <FaRocket />,
      title: 'CLO-4: Optimization & Deployment',
      description: 'Optimize deep learning models for performance, memory efficiency, and deployment on edge devices using quantization, pruning, and knowledge distillation.',
      skills: ['Model Optimization', 'Edge Deployment', 'Performance Tuning']
    }
  ];

  // Course Modules
  const courseModules = [
    {
      number: '01',
      title: 'Introduction to Neural Networks',
      topics: ['Perceptrons', 'Feed-Forward Networks', 'Back-Propagation', 'Optimization (SGD, Adam, RMSProp)'],
      icon: <FaBrain />,
      color: '#667eea'
    },
    {
      number: '02',
      title: 'Convolutional Neural Networks',
      topics: ['CNN Architectures', 'AlexNet, VGG, ResNet', 'Transfer Learning', 'Feature Visualization'],
      icon: <FaNetworkWired />,
      color: '#f093fb'
    },
    {
      number: '03',
      title: 'Recurrent Neural Networks',
      topics: ['RNNs, LSTM, GRU', 'Attention Mechanisms', 'Seq2Seq Models', 'NLP Applications'],
      icon: <FaDatabase />,
      color: '#4facfe'
    },
    {
      number: '04',
      title: 'Autoencoders & GANs',
      topics: ['Variational Autoencoders', 'Generative Models', 'Image Generation', 'Anomaly Detection'],
      icon: <FaCogs />,
      color: '#43e97b'
    },
    {
      number: '05',
      title: 'Model Optimization',
      topics: ['Quantization', 'Pruning', 'Knowledge Distillation', 'Edge Deployment'],
      icon: <FaMicrochip />,
      color: '#fa709a'
    }
  ];

  return (
    <div className="public-page homepage-redesign">
      <Header />

      <main className="main-content">
        {/* ============================================
            PREMIUM HERO SECTION
        ============================================ */}
        <section className="premium-hero-section">
          {/* Animated Background */}
          <div className="hero-bg-container">
            <div className="gradient-orb orb-1"></div>
            <div className="gradient-orb orb-2"></div>
            <div className="gradient-orb orb-3"></div>
            <div className="neural-pattern"></div>
          </div>

          <div className="premium-hero-container">
            {/* Left Content */}
            <div className="hero-left-content">
              {/* Course Badge */}
              <div className="premium-course-badge">
                <span className="badge-icon">🎯</span>
                <span className="badge-text">
                  <strong>DATA302</strong> • Spring 2026 • Now Open
                </span>
                <span className="live-indicator">
                  <span className="pulse-dot"></span>
                  Live
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="premium-hero-title">
                Master <span className="gradient-text">Deep Learning</span>
                <br />
                From Theory to Production
              </h1>

              {/* Subtitle */}
              <p className="premium-hero-subtitle">
                Build, train, and deploy production-ready neural networks. 
                Learn CNNs, RNNs, Transformers, and cutting-edge optimization 
                techniques used by top tech companies.
              </p>

              {/* University Badge */}
              <div className="university-badge">
                <FaGraduationCap />
                <span>Vidyashilp University • School of Engineering & Technology</span>
              </div>

              {/* Stats Bar */}
              <div className="hero-stats-grid">
                {courseStats.map((stat, index) => (
                  <div key={index} className="hero-stat-card">
                    <span className="stat-icon-wrapper">{stat.icon}</span>
                    <div className="stat-content">
                      <span className="stat-value">{stat.value}</span>
                      <span className="stat-label">{stat.label}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="hero-cta-group">
                <Link to="/lectures" className="cta-primary-btn">
                  <FaGraduationCap />
                  <span>Explore Course</span>
                  <FaArrowRight className="arrow-icon" />
                </Link>

                <Link to="/admin/login" className="cta-tertiary-btn">
                  <span>Admin Portal</span>
                </Link>
              </div>
            </div>

            {/* Right Visual */}
            <div className="hero-right-visual">
              <div className="hero-visual-container">
                {/* Main Visual Card */}
                <div className="hero-main-visual">
                  <div className="visual-neural-animation">
                    <div className="neuron-layer layer-1">
                      <div className="neuron"></div>
                      <div className="neuron"></div>
                      <div className="neuron"></div>
                    </div>
                    <div className="connection-lines"></div>
                    <div className="neuron-layer layer-2">
                      <div className="neuron"></div>
                      <div className="neuron"></div>
                      <div className="neuron"></div>
                      <div className="neuron"></div>
                    </div>
                    <div className="connection-lines"></div>
                    <div className="neuron-layer layer-3">
                      <div className="neuron"></div>
                      <div className="neuron"></div>
                    </div>
                  </div>
                </div>

                {/* Floating Cards */}
                <div className="floating-card card-1">
                  <div className="fc-icon">🧠</div>
                  <span className="fc-text">Neural Networks</span>
                </div>

                <div className="floating-card card-2">
                  <div className="fc-icon">📊</div>
                  <span className="fc-text">Data Analytics</span>
                </div>

                <div className="floating-card card-3">
                  <div className="fc-icon">🚀</div>
                  <span className="fc-text">Production Deploy</span>
                </div>

                <div className="floating-card card-4">
                  <div className="fc-icon">⚡</div>
                  <span className="fc-text">PyTorch & TensorFlow</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
            INSTRUCTOR SPOTLIGHT SECTION
        ============================================ */}
        <section className="instructor-spotlight-section">
          <div className="section-container">
            <div className="instructor-spotlight-card">
              <div className="instructor-image-area">
                <div className="instructor-avatar">
                  <FaUserTie />
                </div>
                <div className="instructor-credentials">
                  <span className="credential-badge">
                    <FaGraduationCap /> Lead Instructor
                  </span>
                </div>
              </div>

              <div className="instructor-details">
                <h3 className="instructor-name">Dr. Shabbeer Basha</h3>
                <p className="instructor-title">Associate Professor, School of Engineering & Technology</p>
                <p className="instructor-affiliation">Vidyashilp University, Bangalore</p>
                
                <p className="instructor-bio">
                  Expert in Deep Learning with extensive research experience in computer vision, 
                  neural network optimization, and AI systems deployment. Published researcher 
                  with industry collaboration experience.
                </p>

                <a 
                  href="https://sites.google.com/site/shabbeerbashash" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="instructor-website-btn"
                >
                  Visit Profile <FaExternalLinkAlt />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
            LEARNING OUTCOMES SECTION
        ============================================ */}
        <section className="premium-clo-section">
          <div className="section-container">
            <div className="section-header-premium">
              <span className="section-badge-premium">Course Learning Outcomes</span>
              <h2 className="section-title-premium">What You'll Master</h2>
              <p className="section-subtitle-premium">
                Upon successful completion, you'll gain these industry-ready skills
              </p>
            </div>

            <div className="clo-cards-grid">
              {learningOutcomes.map((clo, index) => (
                <div 
                  key={index} 
                  className="premium-clo-card"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="clo-card-header">
                    <div className="clo-icon-wrapper">{clo.icon}</div>
                    <div className="clo-number">CLO-{index + 1}</div>
                  </div>
                  
                  <h3 className="clo-title">{clo.title.replace(`CLO-${index + 1}: `, '')}</h3>
                  <p className="clo-description">{clo.description}</p>
                  
                  <div className="clo-skills">
                    {clo.skills.map((skill, idx) => (
                      <span key={idx} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================
            COURSE MODULES SECTION
        ============================================ */}
        <section className="premium-modules-section">
          <div className="section-container">
            <div className="section-header-premium">
              <span className="section-badge-premium">Course Curriculum</span>
              <h2 className="section-title-premium">5 Comprehensive Modules</h2>
              <p className="section-subtitle-premium">
                A structured journey from neural network fundamentals to production deployment
              </p>
            </div>

            <div className="modules-timeline">
              {courseModules.map((module, index) => (
                <div 
                  key={index} 
                  className="module-timeline-card"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <div className="module-connector">
                    <div 
                      className="module-dot" 
                      style={{ background: module.color }}
                    ></div>
                    {index < courseModules.length - 1 && (
                      <div className="module-line"></div>
                    )}
                  </div>

                  <div className="module-content-card">
                    <div className="module-header">
                      <span 
                        className="module-number-badge"
                        style={{ background: module.color }}
                      >
                        {module.number}
                      </span>
                      <div 
                        className="module-icon-wrapper"
                        style={{ color: module.color }}
                      >
                        {module.icon}
                      </div>
                    </div>

                    <h4 className="module-title">{module.title}</h4>
                    
                    <ul className="module-topics">
                      {module.topics.map((topic, idx) => (
                        <li key={idx}>
                          <FaCheckCircle style={{ color: module.color }} />
                          {topic}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================
            FINAL CTA SECTION
        ============================================ */}
        <section className="final-cta-section">
          <div className="final-cta-container">
            <div className="final-cta-content">
              <h2>Ready to Master Deep Learning?</h2>
              <p>Start your journey with this comprehensive course today</p>
              
              <div className="final-cta-buttons">
                <Link to="/lectures" className="final-cta-primary">
                  <FaBookOpen />
                  <span>Start Learning Now</span>
                  <FaArrowRight />
                </Link>
                <Link to="/curriculum" className="final-cta-secondary">
                  View Full Curriculum
                </Link>
              </div>
            </div>

            <div className="final-cta-decoration">
              <div className="decoration-circle"></div>
              <div className="decoration-circle"></div>
              <div className="decoration-circle"></div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Floating Feedback Prompt */}
      {showFeedbackPrompt && (
        <div className={`feedback-floating-prompt ${fadeOut ? 'fade-out' : 'fade-in'}`}>
          <div className="feedback-prompt-icon">
            <FaCommentDots />
          </div>
          <div className="feedback-prompt-content">
            <p className="feedback-prompt-title">We'd love your feedback!</p>
            <p className="feedback-prompt-text">Help us improve by sharing your experience with the course.</p>
          </div>
          <button className="feedback-prompt-dismiss" onClick={dismissFeedbackPrompt} aria-label="Dismiss">
            <FaTimes />
          </button>
        </div>
      )}
    </div>
  );
};

export default HomePage;
