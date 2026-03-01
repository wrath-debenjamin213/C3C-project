import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Send, MessageSquare } from 'lucide-react';

let socket;

const TeamChat = ({ roadmapId, username: propUsername }) => {
    const defaultProfile = { name: 'Builder' };
    const savedProfile = localStorage.getItem('c2c_profile');
    const profile = savedProfile ? JSON.parse(savedProfile) : defaultProfile;
    const username = propUsername || profile.name || 'Builder';

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        // Initialize socket connection
        socket = io('http://localhost:5000');

        // Join the specific roadmap room
        socket.emit('join_roadmap', roadmapId);

        // Listen for incoming messages
        socket.on('receive_message', (data) => {
            setMessages((prev) => [...prev, data]);
        });

        // Cleanup on unmount
        return () => {
            socket.disconnect();
        };
    }, [roadmapId]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (input.trim() !== '') {
            const messageData = {
                roadmapId,
                sender: username,
                text: input,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            // Display locally immediately
            setMessages((prev) => [...prev, messageData]);

            // Broadcast to others
            socket.emit('send_message', messageData);

            setInput('');
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '400px', backgroundColor: 'var(--panel-bg)', borderRadius: '8px', border: '1px solid var(--panel-border)', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--panel-border)', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                <MessageSquare size={18} color="var(--accent-blue)" />
                <h3 style={{ margin: 0, fontSize: '1rem' }}>Team Discussion</h3>
            </div>

            {/* Message Area */}
            <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {messages.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '2rem', fontSize: '0.9rem' }}>
                        No messages yet. Start the conversation!
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isMe = msg.sender === username;
                        return (
                            <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', padding: '0 4px' }}>
                                    {isMe ? 'You' : msg.sender} • {msg.time}
                                </div>
                                <div style={{
                                    padding: '0.75rem 1rem',
                                    borderRadius: '12px',
                                    backgroundColor: isMe ? 'var(--accent-blue)' : 'var(--panel-border)',
                                    color: isMe ? 'white' : 'var(--text-primary)',
                                    maxWidth: '85%',
                                    wordBreak: 'break-word',
                                    borderBottomRightRadius: isMe ? '4px' : '12px',
                                    borderBottomLeftRadius: isMe ? '12px' : '4px'
                                }}>
                                    {msg.text}
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={sendMessage} style={{ padding: '1rem', borderTop: '1px solid var(--panel-border)', display: 'flex', gap: '0.5rem' }}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    style={{
                        flex: 1,
                        padding: '0.75rem 1rem',
                        backgroundColor: 'var(--bg-dark)',
                        border: '1px solid var(--panel-border)',
                        borderRadius: '24px',
                        color: 'var(--text-primary)',
                        outline: 'none'
                    }}
                />
                <button
                    type="submit"
                    disabled={!input.trim()}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: input.trim() ? 'var(--accent-blue)' : 'var(--panel-border)',
                        border: 'none',
                        color: 'white',
                        cursor: input.trim() ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <Send size={18} style={{ marginLeft: '2px' }} />
                </button>
            </form>
        </div>
    );
};

export default TeamChat;
