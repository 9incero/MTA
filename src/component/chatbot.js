import React, { useState, useRef, useEffect } from "react";
import { FaArrowCircleUp } from "react-icons/fa";
import './modulestyle/chatbot.css'; // 추가: CSS 파일을 import

const Chatbot = ({ user, setUserlyrics, userlyrics }) => {
    const [messages, setMessages] = useState([{ role: "bot", content: "안녕하세요! 저는 음악챗봇이에요. 그룹 이름을 알려줄래요?" }]);
    const [input, setInput] = useState("");
    const [userName, setUserName] = useState(null); // 사용자 이름 저장
    const [isSettingName, setIsSettingName] = useState(true); // 이름 설정 중 여부
    const [isSending, setIsSending] = useState(false); // 메시지 전송 중 상태
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null); // ✅ 입력창에 접근하기 위한 useRef

    useEffect(() => {
        // isSending이 false로 바뀔 때마다 포커스
        if (!isSending) {
            inputRef.current.focus();
        }
    }, [isSending]);

    // 사용자 이름을 서버에 설정하는 함수
    const setUserNameOnServer = async (name) => {
        setMessages((prevMessages) => [...prevMessages, { role: "user", content: name }]);

        try {
            const response = await fetch(process.env.REACT_APP_ENDPOINT + "/set_user_name", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userName: name, currentUser: user }),
            });

            const data = await response.json();

            if (response.ok) {
                // console.log(data)
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
                    body: JSON.stringify({ user_id: userName, currentUser: user })  // 🚀 user_id 추가
                });

                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

                const data = await response.json();
                // console.log("First question response:", data);

                setMessages((prevMessages) => [...prevMessages, { role: "bot", content: data[0].content }]);
                inputRef.current.focus(); // ✅ 엔터 후 포커스 복원


            } catch (error) {
                console.error("Error fetching first question:", error);
            }
        };

        fetchFirstQuestion();
    }, [userName]);  // 🚀 username이 설정된 이후 실행

    const sendMessage = async () => {
        if (!input.trim()) return;

        if (isSettingName) {
            await setUserNameOnServer(input);
            setInput("");
        } else {
            const userMessage = { role: "user", content: input };
            setMessages((prevMessages) => [...prevMessages, userMessage]);
            setIsSending(true);
            setInput("");
            // "로딩 중..." 메시지 추가
            setMessages((prevMessages) => [...prevMessages, { role: "bot", content: "로딩 중..." }]);


            try {
                const response = await fetch(process.env.REACT_APP_ENDPOINT + "/chat/response", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ message: input, user_id: userName, currentUser: user })
                });

                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

                const file = await response.json();

                //suno 링크만
                const urlRegex = /(https?:\/\/[^\s]+)/;
                if ((file[0] !== undefined && file[0] !== null) && urlRegex.test(String(file[0]['content']))) {
                    await new Promise((resolve) => {
                        setMessages((prevMessages) => {
                            const updatedMessages = [...prevMessages];
                            updatedMessages.pop(); // "로딩 중..." 제거
                            resolve();
                            return [...updatedMessages, {
                                role: "bot", content:
                                    <a href={file[0]['content']} target="_blank" rel="noopener noreferrer">
                                        {file[0]['content']}
                                    </a>
                            }];
                        });
                    });

                    // 이후 "로딩 중..." 추가
                    setMessages((prevMessages) => [...prevMessages, { role: "bot", content: "로딩 중..." }]);

                }


                const questionResponse = await fetch(process.env.REACT_APP_ENDPOINT + "/chat/question", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ user_id: userName, currentUser: user })
                });

                if (!questionResponse.ok) throw new Error(`HTTP error! Status: ${questionResponse.status}`);

                const data = await questionResponse.json();

                setMessages((prevMessages) => {
                    const updatedMessages = [...prevMessages];
                    updatedMessages.pop(); // "로딩 중..." 제거
                    return [...updatedMessages, ...data];
                });

                //가사 인식
                if ((data[0] !== undefined && data[0] !== null) && (data[0]['lyrics'] == 1)) {
                    // setUserlyrics(data[0]['suno']);
                    const replacedLyrics = data[0]['suno']
                        .split('\n')
                        .map((line, index) => (
                            <React.Fragment key={index}>
                                {line}
                                <br />
                            </React.Fragment>
                        ));

                    setUserlyrics(replacedLyrics);

                }
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

        // setInput(""); // 입력 초기화

    };

    const handleSubmit = (e) => {
        e.preventDefault();
        sendMessage();
    };
    const handleKeyDown = (e) => {

        if (e.code === "Space") {
            e.stopPropagation();  // ✅ 스페이스바 입력이 상위 컴포넌트로 전파되는 것 방지
        }
    };

    // 자동 스크롤
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="chatbot-container">
            <h2 style={{ textAlign: "center" }}>비토</h2>
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
