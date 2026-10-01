import React, { useState, useEffect } from 'react';
import { User, BookOpen, MessageSquare, Calendar, FileText, Send, Upload } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [role, setRole] = useState('student'); // 'student', 'cr', 'professor'
  
  // Data States
  const [userData, setUserData] = useState({ name: 'Krish Patel', email: 'krish@example.com', department: 'Information Technology', division: 'A' });
  const [assignments, setAssignments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [events, setEvents] = useState([]);
  const [resources, setResources] = useState([]);

  // Fetch Data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (activeTab === 'Academics') {
          const res = await fetch(`${API_BASE}/academics/assignments`);
          if (res.ok) setAssignments(await res.json());
        } else if (activeTab === 'Social Hub') {
          const res = await fetch(`${API_BASE}/social/messages/general`);
          if (res.ok) setMessages(await res.json());
        } else if (activeTab === 'Events') {
          const res = await fetch(`${API_BASE}/events`);
          if (res.ok) setEvents(await res.json());
        } else if (activeTab === 'Resources') {
          const res = await fetch(`${API_BASE}/resources`);
          if (res.ok) setResources(await res.json());
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [activeTab]);

  // 1. Post a new message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    const content = e.target.message.value;
    if (!content) return;
    
    // Simulating sending a message as Krish (ID: 1)
    await fetch(`${API_BASE}/social/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender_id: 1, channel: 'general', content })
    });
    
    e.target.reset();
    const res = await fetch(`${API_BASE}/social/messages/general`);
    if (res.ok) setMessages(await res.json());
  };

  // 2. Post a new assignment (Professor)
  const handleAddAssignment = async (e) => {
    e.preventDefault();
    const title = e.target.title.value;
    const due_date = e.target.dueDate.value;
    if (!title || !due_date) return;

    await fetch(`${API_BASE}/academics/assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description: 'Added via portal', due_date, professor_id: 3 }) // Hardcoded to Prof ID 3
    });

    e.target.reset();
    const res = await fetch(`${API_BASE}/academics/assignments`);
    if (res.ok) setAssignments(await res.json());
  };

  // 3. Post a new event (CR)
  const handleAddEvent = async (e) => {
    e.preventDefault();
    const title = e.target.title.value;
    const date = e.target.date.value;
    if (!title || !date) return;

    await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, date, description: 'Added via portal', created_by: 2 }) // Hardcoded to CR ID 2
    });

    e.target.reset();
    const res = await fetch(`${API_BASE}/events`);
    if (res.ok) setEvents(await res.json());
  };

  // 4. Upload a resource file
  const handleUploadResource = async (e) => {
    e.preventDefault();
    const fileInput = e.target.file;
    if (!fileInput.files[0]) return;

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('title', fileInput.files[0].name); // Use the original file name as the title
    formData.append('uploaded_by', 3); 

    await fetch(`${API_BASE}/resources`, {
      method: 'POST',
      body: formData // No Content-Type header needed for FormData; the browser sets it automatically
    });

    e.target.reset();
    const res = await fetch(`${API_BASE}/resources`);
    if (res.ok) setResources(await res.json());
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return (
          <div className="card">
            <h3 style={{ marginBottom: '15px' }}>Personal Details</h3>
            <p><strong>Name:</strong> {userData.name}</p>
            <p><strong>Email:</strong> {userData.email}</p>
            <p><strong>Department:</strong> {userData.department}</p>
            <p><strong>Division:</strong> {userData.division}</p>
          </div>
        );
      
      case 'Academics':
        return (
          <div>
            {role === 'professor' && (
              <div className="card">
                <h3>Assign New Work</h3>
                <form className="form-group" style={{ marginTop: '15px' }} onSubmit={handleAddAssignment}>
                  <input type="text" name="title" placeholder="Assignment Title" className="form-control" style={{ marginBottom: '10px' }} required />
                  <input type="date" name="dueDate" className="form-control" style={{ marginBottom: '10px' }} required />
                  <button type="submit" className="btn">Post Assignment</button>
                </form>
              </div>
            )}
            <div className="card">
              <h3>Pending Assignments</h3>
              {assignments.length === 0 ? <p style={{ marginTop: '10px' }}>No pending assignments.</p> : null}
              {assignments.map((task, i) => (
                <div key={i} className="list-item">
                  <h4>{task.title}</h4>
                  <p style={{ color: '#4b5563', fontSize: '0.9rem' }}>
                    Due: {new Date(task.due_date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'Social Hub':
        return (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '70vh' }}>
            <h3>General Communication</h3>
            <div style={{ flex: 1, overflowY: 'auto', margin: '20px 0', border: '1px solid #e5e7eb', padding: '15px', borderRadius: '4px' }}>
              {messages.length === 0 ? <p>No messages yet.</p> : null}
              {messages.map((msg, i) => (
                <div key={i} style={{ marginBottom: '15px' }}>
                  <span style={{ fontWeight: 'bold' }}>{msg.sender_name || 'User'}</span>
                  <span style={{ color: '#6b7280', fontSize: '0.8rem', marginLeft: '10px' }}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                  <p style={{ marginTop: '5px' }}>{msg.content}</p>
                </div>
              ))}
            </div>
            <form style={{ display: 'flex', gap: '10px' }} onSubmit={handleSendMessage}>
              <input type="text" name="message" placeholder="Type a message..." className="form-control" required />
              <button type="submit" className="btn" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Send size={16} /> Send</button>
            </form>
          </div>
        );

      case 'Events':
        return (
          <div>
            {role === 'cr' && (
              <div className="card">
                <h3>Create Event</h3>
                <form className="form-group" style={{ marginTop: '15px' }} onSubmit={handleAddEvent}>
                  <input type="text" name="title" placeholder="Event Name" className="form-control" style={{ marginBottom: '10px' }} required />
                  <input type="date" name="date" className="form-control" style={{ marginBottom: '10px' }} required />
                  <button type="submit" className="btn">Add Event</button>
                </form>
              </div>
            )}
            <div className="card">
              <h3>Upcoming Events</h3>
              {events.length === 0 ? <p style={{ marginTop: '10px' }}>No upcoming events.</p> : null}
              {events.map((evt, i) => (
                <div key={i} className="list-item">
                  <h4>{evt.title}</h4>
                  <p style={{ color: '#4b5563', fontSize: '0.9rem' }}>
                    {new Date(evt.date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'Resources':
        return (
          <div>
            <div className="card">
              <h3>Upload Study Material</h3>
              <form className="form-group" style={{ marginTop: '15px', display: 'flex', gap: '10px' }} onSubmit={handleUploadResource}>
                <input type="file" name="file" className="form-control" required />
                <button type="submit" className="btn" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Upload size={16} /> Upload</button>
              </form>
            </div>
            <div className="card">
              <h3>Shared Materials</h3>
              {resources.length === 0 ? <p style={{ marginTop: '10px' }}>No materials uploaded yet.</p> : null}
              {resources.map((res, i) => (
                <div key={i} className="list-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{res.title}</span>
                  <a href={`http://localhost:5000${res.file_path}`} target="_blank" rel="noreferrer" className="badge" style={{ textDecoration: 'none' }}>View File</a>
                </div>
              ))}
            </div>
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="sidebar-header">Campus Connect</div>
        <div className="nav-menu">
          {[
            { name: 'Dashboard', icon: User },
            { name: 'Academics', icon: BookOpen },
            { name: 'Social Hub', icon: MessageSquare },
            { name: 'Events', icon: Calendar },
            { name: 'Resources', icon: FileText }
          ].map((item) => (
            <div 
              key={item.name} 
              className={`nav-item ${activeTab === item.name ? 'active' : ''}`}
              onClick={() => setActiveTab(item.name)}
            >
              <item.icon size={20} />
              {item.name}
            </div>
          ))}
        </div>
        <div className="role-selector">
          <label>Test UI as:</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="student">Student</option>
            <option value="cr">Class Representative (CR)</option>
            <option value="professor">Professor</option>
          </select>
        </div>
      </div>
      
      <div className="main-content">
        <h1 className="header-title">{activeTab}</h1>
        {renderContent()}
      </div>
    </div>
  );
}