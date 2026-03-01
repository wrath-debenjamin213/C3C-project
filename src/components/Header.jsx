import React, { useState } from 'react';
import { Bell, Search, Info } from 'lucide-react';

const Header = ({ searchQuery, setSearchQuery, userProfile, notifications, setNotifications }) => {
    const [showNotifs, setShowNotifs] = useState(false);

    // Derive avatar initial
    const initial = userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'B';

    // Check if there are any unread notifications
    const hasUnread = notifications?.some(n => !n.read) || false;

    const markAllRead = () => {
        if (setNotifications && notifications) {
            setNotifications(notifications.map(n => ({ ...n, read: true })));
        }
    };

    return (
        <header className="flex justify-between items-center" style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--panel-border)', backdropFilter: 'blur(10px)', background: 'rgba(13, 17, 23, 0.8)', position: 'sticky', top: 0, zIndex: 10 }}>
            <div>
                <h2 style={{ fontSize: '1.25rem' }}>Good evening, {userProfile?.name || 'Builder'}</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Let's turn ideas into reality.</p>
            </div>

            <div className="flex items-center gap-6">
                <div className="search-bar flex items-center gap-2" style={{ background: 'var(--panel-bg)', border: '1px solid var(--panel-border)', borderRadius: '20px', padding: '0.4rem 1rem' }}>
                    <Search size={16} style={{ color: 'var(--text-secondary)' }} />
                    <input
                        type="text"
                        placeholder="Search ideas..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', fontSize: '0.9rem', width: '150px' }}
                    />
                </div>

                <div style={{ position: 'relative' }}>
                    <button className="btn btn-secondary" style={{ padding: '0.5rem', borderRadius: '50%', position: 'relative', background: 'transparent', border: '1px solid var(--panel-border)' }} onClick={() => setShowNotifs(!showNotifs)}>
                        <Bell size={18} />
                        {hasUnread && <span style={{ position: 'absolute', top: 0, right: 0, width: '8px', height: '8px', background: 'var(--danger-color)', borderRadius: '50%' }}></span>}
                    </button>

                    {showNotifs && (
                        <div className="glass-panel flex-col gap-2 fade-in" style={{ position: 'absolute', top: '120%', right: '0', width: '320px', padding: '1rem', zIndex: 50, background: 'var(--bg-secondary)', border: '1px solid var(--panel-border)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.5rem' }}>
                                <h4 style={{ margin: 0, fontSize: '1.05rem' }}>Notifications</h4>
                                {hasUnread && <span onClick={markAllRead} style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', cursor: 'pointer', fontWeight: 500 }} className="hover-text-gradient">Mark all read</span>}
                            </div>

                            <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '0.25rem' }}>
                                {notifications && notifications.length > 0 ? notifications.map(notif => (
                                    <div key={notif.id} style={{ padding: '0.75rem', background: notif.read ? 'rgba(255,255,255,0.02)' : 'rgba(59, 130, 246, 0.05)', borderLeft: notif.read ? '3px solid var(--panel-border)' : '3px solid var(--accent-blue)', borderRadius: '6px', opacity: notif.read ? 0.7 : 1 }}>
                                        <p style={{ fontSize: '0.85rem', margin: 0, color: 'var(--text-primary)' }}><strong>{notif.title}:</strong> {notif.message}</p>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.25rem' }}>{notif.time}</span>
                                    </div>
                                )) : (
                                    <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                        <Info size={16} />
                                        You're all caught up!
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {initial}
                </div>
            </div>
        </header>
    );
};

export default Header;
