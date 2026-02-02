import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStudentAuth } from '../../context/StudentAuthContext';

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshStudent } = useStudentAuth();
  const [status, setStatus] = useState('Processing...');

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (error) {
        setStatus('Authentication failed');
        setTimeout(() => navigate('/login?error=' + error), 1500);
        return;
      }

      if (token) {
        setStatus('Saving your session...');
        // Store the token
        localStorage.setItem('studentToken', token);
        
        // Small delay to ensure token is saved
        await new Promise(resolve => setTimeout(resolve, 100));
        
        setStatus('Loading your profile...');
        // Refresh student data
        try {
          await refreshStudent();
          setStatus('Success! Redirecting...');
          // Redirect to home page
          setTimeout(() => navigate('/'), 500);
        } catch (err) {
          console.error('Failed to load profile:', err);
          setStatus('Redirecting...');
          setTimeout(() => navigate('/'), 500);
        }
      } else {
        setStatus('No token received');
        setTimeout(() => navigate('/login?error=no_token'), 1500);
      }
    };

    handleCallback();
  }, [searchParams, navigate, refreshStudent]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #0f0a1f 0%, #1a1035 50%, #0d1b2a 100%)'
    }}>
      <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔄</div>
      <h2 style={{ color: '#a78bfa', marginBottom: '10px' }}>Completing Google Sign-in...</h2>
      <p style={{ color: '#94a3b8' }}>{status}</p>
    </div>
  );
};

export default GoogleCallback;
