import React, { useState, useEffect } from 'react';
import { 
  User, 
  BookOpen, 
  MessageSquare, 
  Calendar, 
  FileText, 
  Send, 
  Upload, 
  UserPlus, 
  Award, 
  LogOut, 
  GraduationCap, 
  ShieldCheck, 
  UserCheck,
  Edit2,
  X,
  Check
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);

  // Login Panel State
  const [loginRole, setLoginRole] = useState('student'); // 'student', 'cr', 'professor'
  const [loginForm, setLoginForm] = useState({
    name: '',
    enrollment: '',
    email: '',
    password: ''
  });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Application Navigation
  const [activeTab, setActiveTab] = useState('Dashboard');

  // Application Data
  const [assignments, setAssignments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [events, setEvents] = useState([]);
  const [resources, setResources] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [studentActionMsg, setStudentActionMsg] = useState({ text: '', type: '' });

  // Student Edit Modal State
  const [editingStudent, setEditingStudent] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', enrollment: '', division: 'A' });

  // Check saved session on initial load
  useEffect(() => {
    const savedToken = localStorage.getItem('cc_token');
    const savedUser = localStorage.getItem('cc_user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('cc_token');
        localStorage.removeItem('cc_user');
      }
    }
  }, []);

  // Fetch active section data
  useEffect(() => {
    if (!currentUser) return;

    const fetchData = async () => {
      try {
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        if (activeTab === 'Academics') {
          const res = await fetch(`${API_BASE}/academics/assignments`, { headers });
          if (res.ok) setAssignments(await res.json());
        } else if (activeTab === 'Social Hub') {
          const res = await fetch(`${API_BASE}/social/messages/general`, { headers });
          if (res.ok) setMessages(await res.json());
        } else if (activeTab === 'Events') {
          const res = await fetch(`${API_BASE}/events`, { headers });
          if (res.ok) setEvents(await res.json());
        } else if (activeTab === 'Resources') {
          const res = await fetch(`${API_BASE}/resources`, { headers });
          if (res.ok) setResources(await res.json());
        } else if (activeTab === 'Student Management' && currentUser.role === 'professor') {
          loadStudents();
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [activeTab, currentUser, token]);

  // Load Students List (Professor only)
  const loadStudents = async () => {
    try {
      const res = await fetch(`${API_BASE}/users/students`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStudentsList(data);
      }
    } catch (e) {
      console.error('Error fetching students:', e);
    }
  };

  // ---------------------------------------------------------
  // Authentication Handlers
  // ---------------------------------------------------------
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      const payload = {
        role: loginRole,
        name: loginForm.name,
        enrollment: loginForm.enrollment,
        email: loginForm.email,
        password: loginForm.password
      };

      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        setAuthError(data.message || 'Login failed. Please verify credentials.');
        setAuthLoading(false);
        return;
      }

      // Login Successful
      localStorage.setItem('cc_token', data.token);
      localStorage.setItem('cc_user', JSON.stringify(data));
      setToken(data.token);
      setCurrentUser(data);
      setActiveTab('Dashboard');
    } catch (err) {
      setAuthError('Connection error to backend server.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('cc_token');
    localStorage.removeItem('cc_user');
    setCurrentUser(null);
    setToken(null);
    setLoginForm({ name: '', enrollment: '', email: '', password: '' });
  };

  // ---------------------------------------------------------
  // Professor Student Management Handlers
  // ---------------------------------------------------------
  const handleAddStudent = async (e) => {
    e.preventDefault();
    const name = e.target.studentName.value;
    const enrollment = e.target.studentEnrollment.value;
    const isCR = e.target.isCR.checked;

    try {
      const res = await fetch(`${API_BASE}/users/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, enrollment, isCR })
      });

      const data = await res.json();
      if (!res.ok) {
        setStudentActionMsg({ text: data.message || 'Failed to add student', type: 'error' });
        return;
      }

      setStudentActionMsg({ text: data.message, type: 'success' });
      e.target.reset();
      loadStudents();
    } catch (e) {
      setStudentActionMsg({ text: 'Error adding student', type: 'error' });
    }
  };

  const handleToggleCR = async (studentId) => {
    try {
      const res = await fetch(`${API_BASE}/users/students/${studentId}/toggle-cr`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setStudentActionMsg({ text: data.message, type: 'success' });
        loadStudents();
      } else {
        setStudentActionMsg({ text: data.message || 'Failed to change role', type: 'error' });
      }
    } catch (e) {
      setStudentActionMsg({ text: 'Network error updating role', type: 'error' });
    }
  };

  const startEditStudent = (stud) => {
    setEditingStudent(stud);
    setEditFormData({
      name: stud.name,
      enrollment: stud.enrollment || '',
      division: stud.division || 'A'
    });
  };

  const handleSaveStudentEdit = async (e) => {
    e.preventDefault();
    if (!editingStudent) return;

    try {
      const res = await fetch(`${API_BASE}/users/students/${editingStudent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editFormData)
      });

      const data = await res.json();
      if (!res.ok) {
        setStudentActionMsg({ text: data.message || 'Failed to update student details', type: 'error' });
        return;
      }

      setStudentActionMsg({ text: data.message, type: 'success' });
      setEditingStudent(null);
      loadStudents();
    } catch (err) {
      setStudentActionMsg({ text: 'Network error updating student details', type: 'error' });
    }
  };

  // ---------------------------------------------------------
  // Portal Features Handlers
  // ---------------------------------------------------------
  const handleSendMessage = async (e) => {
    e.preventDefault();
    const content = e.target.message.value;
    if (!content) return;

    await fetch(`${API_BASE}/social/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        sender_id: currentUser.id || currentUser._id,
        channel: 'general',
        content
      })
    });

    e.target.reset();
    const res = await fetch(`${API_BASE}/social/messages/general`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) setMessages(await res.json());
  };

  const handleAddAssignment = async (e) => {
    e.preventDefault();
    const title = e.target.title.value;
    const due_date = e.target.dueDate.value;
    if (!title || !due_date) return;

    await fetch(`${API_BASE}/academics/assignments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title,
        description: 'Assigned via Professor Portal',
        due_date,
        professor_id: currentUser.id || currentUser._id
      })
    });

    e.target.reset();
    const res = await fetch(`${API_BASE}/academics/assignments`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) setAssignments(await res.json());
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    const title = e.target.title.value;
    const date = e.target.date.value;
    if (!title || !date) return;

    await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title,
        date,
        description: 'Organized by CR',
        created_by: currentUser.id || currentUser._id
      })
    });

    e.target.reset();
    const res = await fetch(`${API_BASE}/events`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) setEvents(await res.json());
  };

  const handleUploadResource = async (e) => {
    e.preventDefault();
    const fileInput = e.target.file;
    if (!fileInput.files[0]) return;

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('title', fileInput.files[0].name);
    formData.append('uploaded_by', currentUser.id || currentUser._id);

    await fetch(`${API_BASE}/resources`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    e.target.reset();
    const res = await fetch(`${API_BASE}/resources`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) setResources(await res.json());
  };

  // ---------------------------------------------------------
  // Render Login Panel if unauthenticated
  // ---------------------------------------------------------
  if (!currentUser) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <h2><GraduationCap size={28} color="#2563eb" /> Campus Connect</h2>
            <p>Access your university portal</p>
          </div>

          {/* 3 Role Options Selector */}
          <div className="role-tabs">
            <button
              type="button"
              className={`role-tab-btn ${loginRole === 'student' ? 'active' : ''}`}
              onClick={() => { setLoginRole('student'); setAuthError(''); }}
            >
              <User size={16} /> Student
            </button>
            <button
              type="button"
              className={`role-tab-btn ${loginRole === 'cr' ? 'active' : ''}`}
              onClick={() => { setLoginRole('cr'); setAuthError(''); }}
            >
              <Award size={16} /> CR
            </button>
            <button
              type="button"
              className={`role-tab-btn ${loginRole === 'professor' ? 'active' : ''}`}
              onClick={() => { setLoginRole('professor'); setAuthError(''); }}
            >
              <ShieldCheck size={16} /> Professor
            </button>
          </div>

          <form className="auth-form" onSubmit={handleLogin}>
            {authError && <div className="alert alert-error">{authError}</div>}

            {/* Student & CR: Name + Enrollment */}
            {(loginRole === 'student' || loginRole === 'cr') && (
              <>
                <div className="alert alert-info" style={{ fontSize: '0.82rem' }}>
                  Enter your enrolled <strong>Full Name</strong> and <strong>Enrollment ID</strong>.
                  {loginRole === 'cr' && ' Note: Only students designated as CR can log in here.'}
                </div>

                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={loginForm.name}
                    onChange={(e) => setLoginForm({ ...loginForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Enrollment Number</label>
                  <input
                    type="text"
                    className="form-control"
                    value={loginForm.enrollment}
                    onChange={(e) => setLoginForm({ ...loginForm, enrollment: e.target.value })}
                    required
                  />
                </div>
              </>
            )}

            {/* Professor: Email + Password */}
            {loginRole === 'professor' && (
              <>
                <div className="alert alert-info" style={{ fontSize: '0.82rem' }}>
                  Faculty Portal: Enter your institution email & password.
                </div>

                <div className="form-group">
                  <label>Faculty Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    required
                  />
                </div>
              </>
            )}

            <button type="submit" className="btn" style={{ width: '100%', marginTop: '10px' }} disabled={authLoading}>
              {authLoading ? 'Verifying...' : `Login as ${loginRole.toUpperCase()}`}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // Render Main Authenticated Dashboard
  // ---------------------------------------------------------
  const role = currentUser.role ? currentUser.role.toLowerCase() : 'student';

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return (
          <div className="card">
            <h3 className="card-title"><User size={20} color="#2563eb" /> Verified Profile</h3>
            <p style={{ marginBottom: '8px' }}><strong>Name:</strong> {currentUser.name}</p>
            {currentUser.enrollment && (
              <p style={{ marginBottom: '8px' }}><strong>Enrollment No:</strong> {currentUser.enrollment}</p>
            )}
            <p style={{ marginBottom: '8px' }}><strong>Email:</strong> {currentUser.email}</p>
            <p style={{ marginBottom: '8px' }}>
              <strong>Role:</strong>{' '}
              <span className={`badge-role-tag badge-${role}`}>{role.toUpperCase()}</span>
            </p>
            <p style={{ marginBottom: '8px' }}><strong>Department:</strong> {currentUser.department || 'Information Technology'}</p>
            <p><strong>Division:</strong> {currentUser.division || 'A'}</p>
          </div>
        );

      case 'Student Management':
        if (role !== 'professor') return <div className="alert alert-error">Access Restricted to Professors.</div>;
        return (
          <div>
            {studentActionMsg.text && (
              <div className={`alert alert-${studentActionMsg.type}`}>
                {studentActionMsg.text}
              </div>
            )}

            {/* Edit Student Modal / Inline Card */}
            {editingStudent && (
              <div className="card" style={{ border: '2px solid #3b82f6', background: '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h3 className="card-title" style={{ margin: 0 }}>
                    <Edit2 size={18} color="#2563eb" /> Edit Student Information
                  </h3>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setEditingStudent(null)}
                  >
                    <X size={16} /> Cancel
                  </button>
                </div>
                <form onSubmit={handleSaveStudentEdit}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px', gap: '15px' }}>
                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editFormData.name}
                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Enrollment Number</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editFormData.enrollment}
                        onChange={(e) => setEditFormData({ ...editFormData, enrollment: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Division</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editFormData.division}
                        onChange={(e) => setEditFormData({ ...editFormData, division: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                    <button type="submit" className="btn">
                      <Check size={16} /> Save Changes
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setEditingStudent(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Add New Student Form */}
            <div className="card">
              <h3 className="card-title"><UserPlus size={20} color="#2563eb" /> Register New Student</h3>
              <form onSubmit={handleAddStudent}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="form-group">
                    <label>Student Full Name</label>
                    <input type="text" name="studentName" className="form-control" required />
                  </div>
                  <div className="form-group">
                    <label>Enrollment Number</label>
                    <input type="text" name="studentEnrollment" className="form-control" required />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '10px 0 15px' }}>
                  <input type="checkbox" id="isCR" name="isCR" style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                  <label htmlFor="isCR" style={{ cursor: 'pointer', fontWeight: '500' }}>
                    Assign as Class Representative (CR)
                  </label>
                </div>

                <button type="submit" className="btn">
                  <UserPlus size={16} /> Add Student to Department
                </button>
              </form>
            </div>

            {/* Manage Enrolled Students Table */}
            <div className="card">
              <h3 className="card-title"><UserCheck size={20} color="#2563eb" /> Enrolled Students & CR Assignments</h3>
              {studentsList.length === 0 ? (
                <p style={{ color: '#64748b' }}>No students recorded yet.</p>
              ) : (
                <table className="students-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Enrollment No.</th>
                      <th>Current Role</th>
                      <th>Division</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentsList.map((stud) => (
                      <tr key={stud.id}>
                        <td style={{ fontWeight: 600 }}>{stud.name}</td>
                        <td>{stud.enrollment || 'N/A'}</td>
                        <td>
                          <span className={`badge-role-tag badge-${stud.role}`}>
                            {stud.role.toUpperCase()}
                          </span>
                        </td>
                        <td>{stud.division || 'A'}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => startEditStudent(stud)}
                            >
                              <Edit2 size={13} /> Edit
                            </button>
                            {stud.role === 'student' ? (
                              <button
                                type="button"
                                className="btn btn-warning btn-sm"
                                onClick={() => handleToggleCR(stud.id)}
                              >
                                <Award size={13} /> Promote to CR
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleToggleCR(stud.id)}
                              >
                                Demote to Student
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        );

      case 'Academics':
        return (
          <div>
            {role === 'professor' && (
              <div className="card">
                <h3 className="card-title">Assign New Work</h3>
                <form className="form-group" style={{ marginTop: '15px' }} onSubmit={handleAddAssignment}>
                  <div className="form-group">
                    <label>Assignment Title</label>
                    <input type="text" name="title" className="form-control" required />
                  </div>
                  <div className="form-group">
                    <label>Due Date</label>
                    <input type="date" name="dueDate" className="form-control" required />
                  </div>
                  <button type="submit" className="btn">Post Assignment</button>
                </form>
              </div>
            )}
            <div className="card">
              <h3 className="card-title">Pending Assignments</h3>
              {assignments.length === 0 ? <p style={{ marginTop: '10px', color: '#64748b' }}>No pending assignments.</p> : null}
              {assignments.map((task, i) => (
                <div key={i} className="list-item">
                  <div>
                    <h4>{task.title}</h4>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="badge">Active</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'Social Hub':
        return (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '70vh' }}>
            <h3 className="card-title">Department Discussion</h3>
            <div style={{ flex: 1, overflowY: 'auto', margin: '15px 0', border: '1px solid #e2e8f0', padding: '15px', borderRadius: '8px', background: '#f8fafc' }}>
              {messages.length === 0 ? <p style={{ color: '#64748b' }}>No messages yet.</p> : null}
              {messages.map((msg, i) => (
                <div key={i} style={{ marginBottom: '15px', background: 'white', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{msg.sender_name || 'Member'}</span>
                    <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p style={{ marginTop: '6px', color: '#334155' }}>{msg.content}</p>
                </div>
              ))}
            </div>
            <form style={{ display: 'flex', gap: '10px' }} onSubmit={handleSendMessage}>
              <input type="text" name="message" className="form-control" required />
              <button type="submit" className="btn"><Send size={16} /> Send</button>
            </form>
          </div>
        );

      case 'Events':
        return (
          <div>
            {(role === 'cr' || role === 'professor') && (
              <div className="card">
                <h3 className="card-title">Schedule New Event</h3>
                <form className="form-group" style={{ marginTop: '15px' }} onSubmit={handleAddEvent}>
                  <div className="form-group">
                    <label>Event Name / Title</label>
                    <input type="text" name="title" className="form-control" required />
                  </div>
                  <div className="form-group">
                    <label>Event Date</label>
                    <input type="date" name="date" className="form-control" required />
                  </div>
                  <button type="submit" className="btn">Add Event</button>
                </form>
              </div>
            )}
            <div className="card">
              <h3 className="card-title">Upcoming Campus Events</h3>
              {events.length === 0 ? <p style={{ marginTop: '10px', color: '#64748b' }}>No upcoming events.</p> : null}
              {events.map((evt, i) => (
                <div key={i} className="list-item">
                  <div>
                    <h4>{evt.title}</h4>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
                      Date: {new Date(evt.date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="badge">Event</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'Resources':
        return (
          <div>
            <div className="card">
              <h3 className="card-title">Upload Study Material</h3>
              <form className="form-group" style={{ marginTop: '15px', display: 'flex', gap: '10px' }} onSubmit={handleUploadResource}>
                <input type="file" name="file" className="form-control" required />
                <button type="submit" className="btn"><Upload size={16} /> Upload</button>
              </form>
            </div>
            <div className="card">
              <h3 className="card-title">Shared Course Materials</h3>
              {resources.length === 0 ? <p style={{ marginTop: '10px', color: '#64748b' }}>No materials uploaded yet.</p> : null}
              {resources.map((res, i) => (
                <div key={i} className="list-item">
                  <span style={{ fontWeight: 500 }}>{res.title}</span>
                  <a href={`http://localhost:5000${res.file_path}`} target="_blank" rel="noreferrer" className="badge">View File</a>
                </div>
              ))}
            </div>
          </div>
        );

      default: return null;
    }
  };

  const navItems = [
    { name: 'Dashboard', icon: User },
    ...(role === 'professor' ? [{ name: 'Student Management', icon: UserPlus }] : []),
    { name: 'Academics', icon: BookOpen },
    { name: 'Social Hub', icon: MessageSquare },
    { name: 'Events', icon: Calendar },
    { name: 'Resources', icon: FileText }
  ];

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <GraduationCap size={24} /> Campus Connect
        </div>

        <div className="user-profile-badge">
          <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>{currentUser.name}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <span className={`badge-role-tag badge-${role}`}>{role.toUpperCase()}</span>
            {currentUser.enrollment && (
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{currentUser.enrollment}</span>
            )}
          </div>
        </div>

        <div className="nav-menu">
          {navItems.map((item) => (
            <div 
              key={item.name} 
              className={`nav-item ${activeTab === item.name ? 'active' : ''}`}
              onClick={() => setActiveTab(item.name)}
            >
              <item.icon size={18} />
              {item.name}
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="main-content">
        <div className="header-title-bar">
          <h1 className="header-title">{activeTab}</h1>
        </div>
        {renderContent()}
      </div>
    </div>
  );
}