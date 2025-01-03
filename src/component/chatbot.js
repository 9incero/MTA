// src/ChatBot.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaArrowCircleUp } from "react-icons/fa";
import './modulestyle/chatbot.css'; // 추가: CSS 파일을 import



const ChatBot = (user) => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [isSending, setIsSending] = useState(false);
    const messagesContainerRef = useRef(null); // 스크롤 위치를 조정할 참조 생성
    const messagesEndRef = useRef(null); // 스크롤 끝 지점 참조 생성
    const [currentUser, setCurrentUser] = useState(user);

    useEffect(() => {
        setCurrentUser(user);
        console.log("user가 변경되어 currentUser가 업데이트되었습니다:", user);
    }, [user]); // user가 변경될 때마다 실행


    const handleInputChange = (e) => setInput(e.target.value);
    const handleSend = async () => {
        if (!input.trim() || isSending) return;

        const userMessage = { role: 'user', content: input };
        setMessages([...messages, userMessage]);
        setIsSending(true);
        console.log('Current User:', currentUser);

        try {
            // Flask 백엔드의 '/chatting' 엔드포인트로 user message 전송
            const response = await axios({
                method: 'post',
                url: process.env.REACT_APP_ENDPOINT + '/chatting',
                data: { userMessage, currentUser },
                headers: {
                    'Content-Type': 'application/json',
                },
                responseType: 'stream', // 스트리밍 응답 처리
            });

            // 스트리밍 데이터를 처리
            const reader = response.data.getReader();
            const decoder = new TextDecoder();

            let done = false;

            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;

                if (value) {
                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split('\n').filter((line) => line.startsWith('data:'));

                    for (const line of lines) {
                        const data = JSON.parse(line.replace('data: ', '').trim());
                        const botMessage = { role: 'assistant', content: data.content };
                        setMessages((prevMessages) => [...prevMessages, botMessage]); // 메시지 추가
                    }
                }
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setInput('');
            setIsSending(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.repeat) {
            e.preventDefault();
            e.stopPropagation();
            handleSend();
        }
    };

    useEffect(() => {
        // 메시지가 업데이트될 때마다 스크롤을 아래로 이동
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);


    return (<div className="chatbot-container">
        <h2 style={{ textAlign: 'center' }}>Music Chatbot</h2>
        <div ref={messagesContainerRef} className="messages-container">
            {messages.map((msg, idx) => (
                <div key={idx} className={`message ${msg.role === 'user' ? 'user-message' : 'bot-message'}`}>
                    <p style={{ margin: '0px' }}>{msg.content}</p>
                </div>
            ))}
            <div ref={messagesEndRef} />
        </div>
        <div className="input-container">
            <input
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="음악에 대해 이야기해보세요"
                onKeyDown={(e) => {
                    if (e.key === ' ') {
                        e.stopPropagation();
                    }
                    if (e.key === 'Enter') {
                        handleKeyDown(e);
                    }
                }}
            />
            <button onClick={handleKeyDown} className="send-button">
                <FaArrowCircleUp />
            </button>
        </div>
    </div>
    );
};

export default ChatBot;
