import React, { useState } from 'react';

const SettingsView = ({ userProfile, setUserProfile, setNotifications }) => {
    const [formState, setFormState] = useState({ ...userProfile });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        setUserProfile(formState);

        // Apply theme changes to document body
        if (formState.theme === 'Light Mode') {
            document.body.classList.add('theme-light');
            document.body.classList.remove('theme-dark');
        } else {
            document.body.classList.add('theme-dark');
            document.body.classList.remove('theme-light');
        }

        setNotifications(prev => [{
            id: Date.now().toString() + '-settings',
            type: 'success',
            title: 'Settings Saved',
            message: 'Your profile and preferences have been updated successfully.',
            time: 'Just now',
            read: false
        }, ...prev]);
    };

    return (
        <div className="fade-in" style={{ maxWidth: '600px' }}>
            <h1 style={{ marginBottom: '0.5rem', fontSize: '2.5rem' }}>Settings</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem', fontSize: '1.1rem' }}>Manage your account and preferences.</p>

            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                {/* Profile Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.5rem' }}>Profile</h3>
                    <div>
                        <label className="input-label">Username</label>
                        <input
                            type="text"
                            name="name"
                            className="input-base"
                            value={formState.name}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="input-label">Bio</label>
                        <textarea
                            name="bio"
                            className="input-base"
                            rows="3"
                            value={formState.bio}
                            onChange={handleChange}
                            style={{ resize: 'vertical' }}
                        ></textarea>
                    </div>
                </div>

                {/* Preferences Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.5rem' }}>Preferences</h3>
                    <div>
                        <label className="input-label">In-App Notifications</label>
                        <select name="notifications" className="input-base" value={formState.notifications} onChange={handleChange} style={{ appearance: 'none' }}>
                            <option>All activity</option>
                            <option>Mentions and assignments only</option>
                            <option>None</option>
                        </select>
                    </div>
                    <div className="flex gap-4">
                        <div style={{ flex: 1 }}>
                            <label className="input-label">Theme</label>
                            <select name="theme" className="input-base" value={formState.theme} onChange={handleChange} style={{ appearance: 'none' }}>
                                <option>System Default</option>
                                <option>Dark Mode</option>
                                <option>Light Mode</option>
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label className="input-label">Timezone</label>
                            <select name="timezone" className="input-base" value={formState.timezone} onChange={handleChange} style={{ appearance: 'none' }}>
                                <option>UTC (Universal Coordinated Time)</option>
                                <option>EST (Eastern Standard Time)</option>
                                <option>PST (Pacific Standard Time)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Danger Zone Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--panel-border)' }}>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--error-color)' }}>Danger Zone</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Irreversible actions regarding your account and data.</p>
                    <button className="btn btn-secondary" style={{ borderColor: 'var(--error-color)', color: 'var(--error-color)', alignSelf: 'flex-start' }}>Delete Account</button>
                </div>

                <div style={{ marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--panel-border)', display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
                </div>
            </div>
        </div>
    );
};

export default SettingsView;
