import React from 'react';
import { Home, Lightbulb, CheckSquare, Settings, LogOut } from 'lucide-react';

const Sidebar = ({ view, setView, onLogout }) => {
    const getItemStyle = (itemView) => {
        const isActive = view === itemView;
        return {
            color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
            textDecoration: 'none',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            background: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
        };
    };

    return (
        <aside className="glass-panel flex-col" style={{ width: '250px', height: '100vh', padding: '1.5rem', borderRadius: 0, borderRight: '1px solid var(--panel-border)' }}>
            <div className="logo text-gradient" style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2.5rem' }}>
                C2C
            </div>

            <nav className="flex-col gap-4" style={{ flex: 1 }}>
                <a onClick={(e) => { e.preventDefault(); setView('dashboard'); }} className={`nav-item flex items-center gap-4 ${view === 'dashboard' ? 'active' : ''}`} style={getItemStyle('dashboard')}>
                    <Home size={20} />
                    <span>Dashboard</span>
                </a>
                <a onClick={(e) => { e.preventDefault(); setView('ideation'); }} className={`nav-item flex items-center gap-4 ${view === 'ideation' ? 'active' : ''}`} style={getItemStyle('ideation')}>
                    <Lightbulb size={20} />
                    <span>New Idea</span>
                </a>
                <a onClick={(e) => { e.preventDefault(); setView('roadmap'); }} className={`nav-item flex items-center gap-4 ${view === 'roadmap' ? 'active' : ''}`} style={getItemStyle('roadmap')}>
                    <CheckSquare size={20} />
                    <span>Roadmaps</span>
                </a>
            </nav>

            <div className="sidebar-footer" style={{ marginTop: 'auto' }}>
                <a onClick={(e) => { e.preventDefault(); setView('settings'); }} className={`nav-item flex items-center gap-4 ${view === 'settings' ? 'active' : ''}`} style={getItemStyle('settings')}>
                    <Settings size={20} />
                    <span>Settings</span>
                </a>
                <a onClick={(e) => { e.preventDefault(); if (onLogout) onLogout(); }} className="nav-item flex items-center gap-4" style={{ ...getItemStyle('logout'), color: '#ef4444', marginTop: '0.5rem' }}>
                    <LogOut size={20} />
                    <span>Logout</span>
                </a>
            </div>
        </aside>
    );
};

export default Sidebar;
