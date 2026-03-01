import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children, view, setView, searchQuery, setSearchQuery, userProfile, notifications, setNotifications, onLogout }) => {
    return (
        <div className="app-container flex">
            <Sidebar view={view} setView={setView} onLogout={onLogout} />
            <div className="main-wrapper flex-col" style={{ flex: 1, width: '100%' }}>
                <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} userProfile={userProfile} notifications={notifications} setNotifications={setNotifications} />
                <main className="content-area" style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
