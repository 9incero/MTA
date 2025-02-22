import React, { useState, useRef, useEffect } from "react";
import { FaArrowCircleUp } from "react-icons/fa";
import './modulestyle/chatbot.css'; // 추가: CSS 파일을 import

const Chatbot = (user) => {
    const [messages, setMessages] = useState([{ role: "bot", content: "안녕하세요! 저는 음악 챗봇이에요. 먼저, 어떻게 부르면 될까요?" }]);
    const [input, setInput] = useState("");
    const [userName, setUserName] = useState(null); // 사용자 이름 저장
    const [isSettingName, setIsSettingName] = useState(true); // 이름 설정 중 여부
    const [isSending, setIsSending] = useState(false); // 메시지 전송 중 상태
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null); // ✅ 입력창에 접근하기 위한 useRef
    const [currentUser, setCurrentUser] = useState(user);

    useEffect(() => {
        setCurrentUser(user);
        console.log("user가 변경되어 currentUser가 업데이트되었습니다:", user);
    }, [user]); // user가 변경될 때마다 실행

    // 사용자 이름을 서버에 설정하는 함수
    const setUserNameOnServer = async (name) => {
        setMessages((prevMessages) => [...prevMessages, { role: "user", content: name }]);

        try {
            const response = await fetch(process.env.REACT_APP_ENDPOINT + "/set_user_name", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userName: name, currentUser: currentUser.user }),
            });

            const data = await response.json();
            if (response.ok) {
                setUserName(data["userName"]);
                setMessages((prevMessages) => [...prevMessages, { role: "bot", content: data["userName"] }]);
                setIsSettingName(false);
            }
        } catch (error) {
            console.error("Error setting user name:", error);
            setMessages((prevMessages) => [...prevMessages, { role: "bot", content: "이름을 설정하는 중 오류가 발생했습니다. 다시 시도해주세요." }]);
        }
    };

    useEffect(() => {
        if (!userName) return;  // 🚀 username이 없으면 실행하지 않음

        const fetchFirstQuestion = async () => {
            try {
                const response = await fetch(process.env.REACT_APP_ENDPOINT + "/chat/question", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ user_id: userName, currentUser: currentUser.user })  // 🚀 user_id 추가
                });

                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

                const data = await response.json();
                console.log("First question response:", data);

                setMessages((prevMessages) => [...prevMessages, { role: "bot", content: data[0].content }]);

            } catch (error) {
                console.error("Error fetching first question:", error);
            }
        };

        fetchFirstQuestion();
    }, [userName]);  // 🚀 username이 설정된 이후 실행

    const sendMessage = async () => {
        if (!input.trim()) return;

        if (isSettingName) {
            setUserNameOnServer(input);
        } else {
            const userMessage = { role: "user", content: input };
            setMessages((prevMessages) => [...prevMessages, userMessage]);
            setIsSending(true);

            // "로딩 중..." 메시지 추가
            setMessages((prevMessages) => [...prevMessages, { role: "bot", content: "로딩 중..." }]);

            try {
                const response = await fetch(process.env.REACT_APP_ENDPOINT + "/chat/response", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ message: input, user_id: userName, currentUser: currentUser.user })
                });

                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

                const questionResponse = await fetch(process.env.REACT_APP_ENDPOINT + "/chat/question", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ user_id: userName, currentUser: currentUser.user })
                });

                if (!questionResponse.ok) throw new Error(`HTTP error! Status: ${questionResponse.status}`);

                const data = await questionResponse.json();

                setMessages((prevMessages) => {
                    const updatedMessages = [...prevMessages];
                    updatedMessages.pop(); // "로딩 중..." 메시지 제거
                    return [...updatedMessages, ...data];
                });
            } catch (error) {
                console.error("Error:", error);
                setMessages((prevMessages) => {
                    const updatedMessages = [...prevMessages];
                    updatedMessages.pop(); // "로딩 중..." 제거
                    return [...updatedMessages, { role: "bot", content: "오류가 발생했습니다. 다시 시도해주세요." }];
                });
            } finally {
                setIsSending(false);
                inputRef.current.focus(); // ✅ 엔터 후 포커스 복원
            }
        }

        setInput(""); // 입력 초기화
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        sendMessage();
    };
    const handleKeyDown = (e) => {

        if (e.key === " ") {
            e.preventDefault();
            e.stopPropagation();  // ✅ 스페이스바 입력이 상위 컴포넌트로 전파되는 것 방지
        }
    };
    // 자동 스크롤
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="chatbot-container">
            <h2 style={{ textAlign: "center" }}>Music Chatbot</h2>
            <div className="messages-container">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`message ${msg.role === "user" ? "user-message" : "bot-message"}`}>
                        <p style={{ margin: "0px" }}>{msg.content}</p>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form className="input-container" onSubmit={handleSubmit}>
                <input
                    type="text"
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={isSettingName ? "이름을 입력해주세요" : "음악에 대해 이야기해보세요"}
                    onKeyDown={handleKeyDown}
                    disabled={isSending}
                />
                <button type="submit" className="send-button" disabled={isSending}>
                    <FaArrowCircleUp />
                </button>
            </form>
        </div>
    );
};

export default Chatbot;
