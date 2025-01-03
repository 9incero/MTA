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

    // const handleSend = async () => {
    //     if (!input.trim() || isSending) return;

    //     const userMessage = { role: 'user', content: input };
    //     setMessages([...messages, userMessage]);
    //     setIsSending(true);
    //     console.log('ww', currentUser);
    //     try {
    //         // Flask 백엔드의 '/chatting' 엔드포인트로 user message만 전송
    //         const response = await axios.post(
    //             process.env.REACT_APP_ENDPOINT + '/chatting',
    //             { userMessage, currentUser },
    //             {
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                 },
    //             }
    //         );
    //         // 응답 데이터 확인
    //         console.log("Response Data:", response.data);

    //         // 첫 번째 항목에 접근하여 content를 가져오기
    //         const lastMessage = response.data[response.data.length - 1];
    //         const botMessage = { role: 'assistant', content: lastMessage.content };
    //         setMessages((prevMessages) => [...prevMessages, botMessage]);
    //     } catch (error) {
    //         console.error('Error:', error);
    //     } finally {
    //         setInput('');
    //         setIsSending(false);
    //     }
    // };

    const handleSend = async () => {
        if (!input.trim() || isSending) return;

        const userMessage = { role: 'user', content: input };
        setMessages([...messages, userMessage]);
        setIsSending(true);

        // 로딩 상태 추가
        setMessages((prevMessages) => [
            ...prevMessages,
            { role: 'assistant', content: '로딩 중...' },
        ]);

        try {
            console.log('ww', currentUser);
            // Flask 백엔드의 '/chatting' 엔드포인트로 user message만 전송
            const response = await axios.post(
                process.env.REACT_APP_ENDPOINT + '/chatting',
                { userMessage, currentUser },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
            // 응답 데이터 확인
            console.log("Response Data:", response.data);

            // 첫 번째 항목에 접근하여 content를 가져오기
            const lastMessage = response.data[response.data.length - 1];
            const botMessage = { role: 'assistant', content: lastMessage.content };
            setMessages((prevMessages) => {
                // 로딩 중 메시지를 제거하고 새 메시지를 추가
                const updatedMessages = [...prevMessages];
                updatedMessages.pop(); // 마지막 "로딩 중..." 메시지 제거
                return [...updatedMessages, botMessage];
            });
        } catch (error) {
            console.error('Error:', error);
            setMessages((prevMessages) => [
                ...prevMessages.slice(0, -1), // "로딩 중..." 메시지 제거
                { role: 'assistant', content: '오류가 발생했습니다. 다시 시도해주세요.' },
            ]);
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
