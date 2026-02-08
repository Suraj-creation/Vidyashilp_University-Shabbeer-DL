import React, { useState, useEffect, useCallback } from 'react';
import { FaUsers, FaSearch, FaSync, FaGoogle, FaEnvelope, FaCalendarAlt, FaClock, FaUserCheck, FaUserTimes, FaTrash } from 'react-icons/fa';
import { authAPI } from '../../services/api';
import { useToast, useConfirm } from '../../context/ToastContext';
import './ManagerPage.css';

const UserManager = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    googleUsers: 0,
    localUsers: 0,
    verifiedUsers: 0
  });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await authAPI.getAllUsers();
      const userData = response.data.data || response.data.users || [];
      setUsers(userData);
      
      // Calculate stats
      setStats({
        total: userData.length,
        googleUsers: userData.filter(u => u.authProvider === 'google').length,
        localUsers: userData.filter(u => u.authProvider === 'local').length,
        verifiedUsers: userData.filter(u => u.isEmailVerified).length
      });
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDeleteUser = async (userId, userName) => {
    const ok = await confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`);
    if (!ok) {
      return;
    }

    try {
      await authAPI.deleteUser(userId);
      setUsers(users.filter(u => u._id !== userId));
      // Update stats
      setStats(prev => ({
        ...prev,
        total: prev.total - 1
      }));
    } catch (err) {
      console.error('Error deleting user:', err);
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="manager-page">
      <div className="manager-header">
        <div className="header-content">
          <h1><FaUsers /> User Management</h1>
          <p>View and manage all registered users</p>
        </div>
        <button className="refresh-btn" onClick={fetchUsers} disabled={loading}>
          <FaSync className={loading ? 'spinning' : ''} /> Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">
            <FaUsers />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Users</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon google">
            <FaGoogle />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.googleUsers}</span>
            <span className="stat-label">Google Users</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon local">
            <FaEnvelope />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.localUsers}</span>
            <span className="stat-label">Email Users</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon verified">
            <FaUserCheck />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.verifiedUsers}</span>
            <span className="stat-label">Verified</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-section">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="table-container">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="empty-state">
            <FaUsers className="empty-icon" />
            <h3>No users found</h3>
            <p>{searchTerm ? 'Try adjusting your search' : 'No users have registered yet'}</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Auth Provider</th>
                <th>Status</th>
                <th>Registered</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className="user-cell">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="user-avatar" />
                      ) : (
                        <div className="user-avatar-placeholder">
                          {user.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                      )}
                      <span className="user-name">{user.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="email-cell">{user.email}</span>
                  </td>
                  <td>
                    <span className={`auth-badge ${user.authProvider}`}>
                      {user.authProvider === 'google' ? (
                        <><FaGoogle /> Google</>
                      ) : (
                        <><FaEnvelope /> Email</>
                      )}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${user.isEmailVerified ? 'verified' : 'unverified'}`}>
                      {user.isEmailVerified ? (
                        <><FaUserCheck /> Verified</>
                      ) : (
                        <><FaUserTimes /> Unverified</>
                      )}
                    </span>
                  </td>
                  <td>
                    <div className="date-cell">
                      <FaCalendarAlt />
                      <span>{formatDate(user.createdAt)}</span>
                    </div>
                  </td>
                  <td>
                    <div className="date-cell">
                      <FaClock />
                      <span>{formatDate(user.lastLogin)}</span>
                    </div>
                  </td>
                  <td>
                    <button 
                      className="action-btn delete"
                      onClick={() => handleDeleteUser(user._id, user.name)}
                      title="Delete user"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <style jsx="true">{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.05));
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .stat-icon.total { background: rgba(99, 102, 241, 0.2); color: #6366f1; }
        .stat-icon.google { background: rgba(234, 67, 53, 0.2); color: #ea4335; }
        .stat-icon.local { background: rgba(52, 168, 83, 0.2); color: #34a853; }
        .stat-icon.verified { background: rgba(16, 185, 129, 0.2); color: #10b981; }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: #e2e8f0;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #94a3b8;
        }

        .search-section {
          margin-bottom: 20px;
        }

        .search-box {
          position: relative;
          max-width: 400px;
        }

        .search-box input {
          width: 100%;
          padding: 12px 12px 12px 45px;
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: 8px;
          color: #e2e8f0;
          font-size: 0.95rem;
        }

        .search-box input:focus {
          outline: none;
          border-color: #6366f1;
        }

        .search-icon {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
        }

        .user-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid rgba(99, 102, 241, 0.3);
        }

        .user-avatar-placeholder {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 1.1rem;
        }

        .user-name {
          font-weight: 500;
          color: #e2e8f0;
        }

        .email-cell {
          color: #94a3b8;
          font-size: 0.9rem;
        }

        .auth-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .auth-badge.google {
          background: rgba(234, 67, 53, 0.15);
          color: #ea4335;
          border: 1px solid rgba(234, 67, 53, 0.3);
        }

        .auth-badge.local {
          background: rgba(52, 168, 83, 0.15);
          color: #34a853;
          border: 1px solid rgba(52, 168, 83, 0.3);
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .status-badge.verified {
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .status-badge.unverified {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
          border: 1px solid rgba(245, 158, 11, 0.3);
        }

        .date-cell {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #94a3b8;
          font-size: 0.85rem;
        }

        .date-cell svg {
          color: #64748b;
        }

        .action-btn {
          padding: 8px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .action-btn.delete {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }

        .action-btn.delete:hover {
          background: rgba(239, 68, 68, 0.3);
        }

        .refresh-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .refresh-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
        }

        .refresh-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .loading-state, .empty-state {
          padding: 60px 20px;
          text-align: center;
          color: #94a3b8;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(99, 102, 241, 0.2);
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }

        .empty-icon {
          font-size: 3rem;
          color: #475569;
          margin-bottom: 15px;
        }

        .empty-state h3 {
          color: #e2e8f0;
          margin-bottom: 8px;
        }

        .error-message {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
          padding: 15px 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .data-table {
            font-size: 0.85rem;
          }

          .user-avatar, .user-avatar-placeholder {
            width: 32px;
            height: 32px;
          }
        }
      `}</style>
    </div>
  );
};

export default UserManager;
