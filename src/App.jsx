import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import IdeationForm from './components/IdeationForm';
import RoadmapView from './components/RoadmapView';
import LoginView from './components/LoginView';
import SettingsView from './components/SettingsView';
import { generateRoadmap } from './utils/mockDataEngine';
import { generateAiRoadmap } from './utils/aiDataEngine';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const saved = localStorage.getItem('c2c_auth');
    return saved ? JSON.parse(saved) : false;
  });

  const [roadmaps, setRoadmaps] = useState(() => {
    const saved = localStorage.getItem('c2c_roadmaps');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeRoadmapId, setActiveRoadmapId] = useState(null);
  const [view, setView] = useState('dashboard'); // dashboard, ideation, roadmap
  const [isGenerating, setIsGenerating] = useState(false);

  // Check for Shared Roadmap Links on Mount
  useEffect(() => {
    const handleSharedLink = async () => {
      const query = new URLSearchParams(window.location.search);
      const shareId = query.get('share');
      if (shareId && isAuthenticated) {
        try {
          const response = await fetch(`http://localhost:5000/api/shared-roadmap/${shareId}`);
          if (response.ok) {
            const data = await response.json();
            const sharedRoadmap = data.roadmap;

            // Check if we already have this roadmap locally to avoid duplicates
            setRoadmaps(prev => {
              if (prev.some(r => r.id === sharedRoadmap.id)) return prev;
              return [sharedRoadmap, ...prev];
            });

            setActiveRoadmapId(sharedRoadmap.id);
            setView('roadmap');

            // Notification
            setNotifications(prev => [{
              id: Date.now().toString() + '-join',
              type: 'system',
              title: 'Joined Shared Roadmap',
              message: `You successfully joined the ${sharedRoadmap.ideaName} project.`,
              time: 'Just now',
              read: false
            }, ...prev]);

          } else {
            setNotifications(prev => [{
              id: Date.now().toString() + '-join-err',
              type: 'error',
              title: 'Invalid Link',
              message: "The shared roadmap link is invalid or has expired.",
              time: 'Just now',
              read: false
            }, ...prev]);
          }
        } catch (error) {
          console.error("Failed to load shared roadmap:", error);
        } finally {
          // Clean the URL so it doesn't infinite loop on refresh
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    };

    handleSharedLink();
  }, [isAuthenticated]); // Rerun if they log in through the gated screen

  // Global Shell State
  const [searchQuery, setSearchQuery] = useState('');

  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('c2c_profile');
    return saved ? JSON.parse(saved) : { name: 'Builder', bio: 'Building the next big thing.', theme: 'System Default', timezone: 'UTC' };
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('c2c_notifications');
    return saved ? JSON.parse(saved) : [
      { id: 'welcome', type: 'system', title: 'Welcome to C2C', message: 'Your Execution platform is ready.', time: 'Just now', read: false }
    ];
  });

  // Save to LocalStorage whenever these state pieces change
  useEffect(() => {
    localStorage.setItem('c2c_auth', JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('c2c_roadmaps', JSON.stringify(roadmaps));
  }, [roadmaps]);

  useEffect(() => {
    localStorage.setItem('c2c_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('c2c_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Find the exact active roadmap object (if any)
  const activeRoadmap = roadmaps.find(r => r.id === activeRoadmapId);

  const handleIdeaSubmit = async (formData) => {
    setIsGenerating(true);
    let generated;

    try {
      // Attempt generative AI real-time payload via secure backend
      generated = await generateAiRoadmap(formData);

      setNotifications(prev => [{
        id: Date.now().toString() + '-ai-notif',
        type: 'success',
        title: 'AI Roadmap Generated',
        message: `Your custom AI plan for "${formData.ideaName || formData.idea}" has been structured.`,
        time: 'Just now',
        read: false
      }, ...prev]);

    } catch (error) {
      console.error("AI Generation Error: falling back to mock engine", error);
      generated = generateRoadmap(formData);
      generated.id = Date.now().toString();

      setNotifications(prev => [{
        id: Date.now().toString() + '-error-notif',
        type: 'error',
        title: 'AI Roadmap Failed',
        message: `There was an issue contacting Gemini. Falling back to the generic offline engine.`,
        time: 'Just now',
        read: false
      }, ...prev]);
    }

    setRoadmaps(prev => [generated, ...prev]);
    setActiveRoadmapId(generated.id);
    setView('roadmap');
    setIsGenerating(false);
  };

  const handleUpdateRoadmap = (updatedRoadmap) => {
    setRoadmaps(prev => prev.map(r => r.id === updatedRoadmap.id ? updatedRoadmap : r));
  };

  const handleOpenRoadmap = (id) => {
    setActiveRoadmapId(id);
    setView('roadmap');
  };

  // Calculate totals across all roadmaps
  const totalIdeas = roadmaps.length;
  const activeCount = roadmaps.filter(r => r.milestones.some(m => m.progress < 100)).length;
  const completedTasks = roadmaps.reduce((total, r) => {
    return total + r.milestones.reduce((acc, m) => acc + m.tasks.filter(t => t.completed).length, 0);
  }, 0);

  if (!isAuthenticated) {
    return <LoginView onLogin={(user) => {
      setIsAuthenticated(true);
      if (user) {
        setUserProfile(prev => ({ ...prev, name: user.name, email: user.email }));
      }
    }} />;
  }

  return (
    <Layout
      view={view}
      setView={setView}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      userProfile={userProfile}
      notifications={notifications}
      setNotifications={setNotifications}
      onLogout={() => setIsAuthenticated(false)}
    >
      <div className="dashboard-content" style={{ paddingBottom: '4rem', animation: 'fadeIn 0.5s ease-out' }}>
        {view === 'dashboard' && (
          <div className="fade-in">
            <h1 style={{ marginBottom: '0.5rem', fontSize: '2.5rem' }}>Dashboard</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem', fontSize: '1.1rem' }}>Welcome to C2C. Select an option from the sidebar to get started.</p>

            <div className="flex gap-4" style={{ marginBottom: '2rem', flexWrap: 'wrap' }}>
              <div className="glass-panel" style={{ flex: '1 1 200px', padding: '1.5rem', borderTop: '4px solid var(--accent-blue)' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Ideas</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{totalIdeas}</div>
              </div>
              <div className="glass-panel" style={{ flex: '1 1 200px', padding: '1.5rem', borderTop: '4px solid var(--accent-purple)' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Active Roadmaps</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{activeCount}</div>
              </div>
              <div className="glass-panel" style={{ flex: '1 1 200px', padding: '1.5rem', borderTop: '4px solid var(--success-color)' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Tasks Completed</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{completedTasks}</div>
              </div>
            </div>

            <button className="btn btn-primary" onClick={() => setView('ideation')} style={{ marginBottom: '2rem' }}>Create New Idea Roadmap</button>

            {roadmaps.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Recent Roadmaps</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  {roadmaps
                    .filter(r => r.ideaName.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(roadmap => (
                      <div
                        key={roadmap.id}
                        className="glass-panel flex-col justify-between"
                        style={{ padding: '1.5rem', cursor: 'pointer', borderLeft: '4px solid var(--accent-blue)', transition: 'all 0.3s ease', transform: 'scale(1)', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', minHeight: '150px' }}
                        onClick={() => handleOpenRoadmap(roadmap.id)}
                        onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px) scale(1.01)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.4)'; e.currentTarget.style.borderColor = 'var(--accent-purple)'; }}
                        onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)'; e.currentTarget.style.borderColor = 'var(--accent-blue)'; }}
                      >
                        <div style={{ flex: 1 }}>
                          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', transition: 'color 0.3s ease', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{roadmap.ideaName}</h3>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{roadmap.totalWeeks} Weeks Total</span>
                        </div>
                        <div className="flex items-center justify-between" style={{ marginTop: '1rem' }}>
                          <div style={{ fontWeight: 'bold', color: 'var(--accent-purple)', fontSize: '1.2rem' }}>
                            {Math.round(roadmap.milestones.reduce((acc, m) => acc + m.progress, 0) / roadmap.milestones.length)}%
                          </div>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                            {roadmap.milestones.length} Phases
                          </span>
                        </div>
                      </div>
                    ))}

                  {/* Empty state for search if no roadmaps match */}
                  {searchQuery && roadmaps.filter(r => r.ideaName.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                    <div style={{ gridColumn: '1 / -1', color: 'var(--text-secondary)', padding: '2rem 0', fontStyle: 'italic' }}>
                      No roadmaps found matching "{searchQuery}"
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {view === 'ideation' && (
          <div className="fade-in">
            <h1 style={{ marginBottom: '0.5rem', fontSize: '2.5rem' }}>Start your journey</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem', fontSize: '1.1rem' }}>Define an objective to build an execution plan.</p>
            <IdeationForm onSubmit={handleIdeaSubmit} isGenerating={isGenerating} />
          </div>
        )}

        {view === 'roadmap' && activeRoadmap ? (
          <div className="fade-in">
            <div className="flex justify-between items-center" style={{ marginBottom: '2rem', maxWidth: '900px', margin: '0 auto 2rem' }}>
              <h1 style={{ fontSize: '2.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>{activeRoadmap.ideaName}</h1>
              <button className="btn btn-secondary" onClick={() => setView('ideation')}>Start New Idea</button>
            </div>
            <RoadmapView roadmap={activeRoadmap} onUpdate={handleUpdateRoadmap} setNotifications={setNotifications} />
          </div>
        ) : (view === 'roadmap' && !activeRoadmap && (
          <div className="fade-in">
            <h1 style={{ marginBottom: '0.5rem', fontSize: '2.5rem' }}>Execution Roadmaps</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem', fontSize: '1.1rem' }}>You don't have any active roadmaps selected.</p>
            <button className="btn btn-primary" onClick={() => setView('dashboard')}>View Dashboard</button>
          </div>
        ))}

        {view === 'settings' && (
          <SettingsView
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            setNotifications={setNotifications}
          />
        )}
      </div>
    </Layout>
  );
}

export default App;
