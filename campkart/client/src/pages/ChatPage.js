import React, { useEffect, useState } from 'react';
import API from '../api';
import './ChatPage.css';

const ChatPage = () => {
    const [chats, setChats] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const user = JSON.parse(localStorage.getItem('campkart-user') || '{}');

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const { data } = await API.get('/chat');
                setChats(data);
                if (data.length > 0) setActiveChat(data[0]);
            } catch (err) {
                console.error('Error fetching chats', err);
            }
        };
        fetchChats();
    }, []);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeChat) return;

        try {
            const receiver = activeChat.participants.find(p => p._id !== user._id);
            const res = await API.post('/chat', {
                receiverId: receiver._id,
                productId: activeChat.productId?._id,
                message: newMessage
            });
            
            // Optimization: API might return whole chat, but let's just push for UI speed
            const sentMsg = {
                sender: user._id,
                content: newMessage,
                timestamp: new Date()
            };
            
            const updatedChat = {
                ...activeChat,
                messages: [...activeChat.messages, sentMsg]
            };
            
            setActiveChat(updatedChat);
            setChats(chats.map(c => c._id === activeChat._id ? updatedChat : c));
            setNewMessage('');
        } catch (err) {
            console.error('Error sending message', err);
            alert('Could not send message. Please try again.');
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-sidebar">
                <header><h3>Messages</h3></header>
                <div className="chat-list">
                    {chats.map(chat => {
                        const otherUser = chat.participants.find(p => p._id !== user._id);
                        return (
                            <div 
                                key={chat._id} 
                                className={`chat-item ${activeChat?._id === chat._id ? 'active' : ''}`}
                                onClick={() => setActiveChat(chat)}
                            >
                                <div className="chat-avatar">{otherUser?.name[0].toUpperCase()}</div>
                                <div className="chat-info">
                                    <strong>{otherUser?.name}</strong>
                                    <p>{chat.productId?.title || 'General Chat'}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <main className="chat-window">
                {activeChat ? (
                    <>
                        <header className="chat-header">
                            <div className="header-user">
                                <h3>{activeChat.participants.find(p => p._id !== user._id)?.name}</h3>
                                <span>{activeChat.productId?.title}</span>
                            </div>
                        </header>
                        
                        <div className="message-area">
                            {activeChat.messages.map((msg, idx) => (
                                <div key={idx} className={`message ${msg.sender === user._id ? 'sent' : 'received'}`}>
                                    <div className="message-content">{msg.content}</div>
                                    <div className="message-time">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                </div>
                            ))}
                        </div>

                        <form className="chat-input" onSubmit={sendMessage}>
                            <input 
                                type="text" 
                                placeholder="Type a message..." 
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <button type="submit">Send</button>
                        </form>
                    </>
                ) : (
                    <div className="no-chat">Select a conversation to start chatting</div>
                )}
            </main>
        </div>
    );
};

export default ChatPage;
