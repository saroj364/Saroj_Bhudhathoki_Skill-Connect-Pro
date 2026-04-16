import { useEffect, useState, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import Navbar from "../../components/UserComponents/Navbar";

export default function FreelancerChatList() {
  const API_URL = import.meta.env.VITE_API_URL;
  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("userInfo"));

  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const selectedChatRef = useRef(null);

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);

    socketRef.current.emit("register-user", user._id);

    socketRef.current.on("receive-message", (msg) => {
      const chatId =
        typeof msg.chat === "object" ? msg.chat._id : msg.chat;

      if (selectedChatRef.current?._id === chatId) {
        setMessages((prev) => {
          if (msg.tempId) {
            const index = prev.findIndex((m) => m._id === msg.tempId);
            if (index !== -1) {
              const updated = [...prev];
              updated[index] = msg;
              return updated;
            }
          }

          if (prev.some((m) => m._id === msg._id)) return prev;

          const filtered = prev.filter(
            (m) =>
              !(
                m.temp &&
                m.message === msg.message &&
                m.type === msg.type
              )
          );

          return [...filtered, msg];
        });
      }

      setChats((prev) =>
        prev.map((c) =>
          c._id === chatId
            ? {
                ...c,
                lastMessage: {
                  message:
                    msg.message ||
                    (msg.type === "hire-request"
                      ? "Hire Request"
                      : ""),
                },
              }
            : c
        )
      );
    });

    socketRef.current.on("typing", (userId) => {
      if (userId !== user._id) setIsTyping(true);
    });

    socketRef.current.on("stop-typing", (userId) => {
      if (userId !== user._id) setIsTyping(false);
    });

    return () => socketRef.current.disconnect();
  }, []);

  useEffect(() => {
    if (!selectedChat || !socketRef.current) return;

    socketRef.current.emit("join-chat", selectedChat._id);
    fetchMessages(selectedChat._id);
  }, [selectedChat]);

  const fetchChats = async () => {
    try {
      const res = await axios.get(`${API_URL}/users/chat`, authHeader);
      setChats(res.data.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const res = await axios.get(
        `${API_URL}/users/chat/${chatId}`,
        authHeader
      );
      setMessages(res.data.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  const sendMessage = (payload = null, type = "text") => {
    if (!selectedChat || !socketRef.current) return;
    if (type === "text" && !text.trim()) return;

    const tempId = `temp-${Date.now()}`;

    const tempMsg = {
      _id: tempId,
      sender: { _id: user._id, username: user.username },
      message: type === "text" ? text : "",
      type,
      payload,
      chat: selectedChat._id,
      temp: true,
    };

    setMessages((prev) => [...prev, tempMsg]);

    socketRef.current.emit("send-message", {
      chatId: selectedChat._id,
      senderId: user._id,
      text: type === "text" ? text : undefined,
      type,
      payload,
      tempId,
    });

    if (type === "text") setText("");
  };

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      <Navbar />
      <div className="h-screen flex bg-gray-100">

        <div className="w-1/3 bg-white border-r overflow-y-auto">
          <h2 className="p-4 text-xl font-bold border-b">Chats</h2>

          {chats.map((chat) => {
            const otherUser = chat.participants.find(
              (p) => p._id !== user._id
            );

            return (
              <div
                key={chat._id}
                onClick={() => setSelectedChat(chat)}
                className={`p-4 cursor-pointer border-b ${
                  selectedChat?._id === chat._id
                    ? "bg-gray-200"
                    : ""
                }`}
              >
                <p className="font-semibold">
                  {otherUser?.username}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {chat.lastMessage?.message || "No messages"}
                </p>
              </div>
            );
          })}
        </div>

        <div className="flex-1 flex flex-col">
          {!selectedChat ? (
            <div className="flex items-center justify-center h-full">
              Select a chat
            </div>
          ) : (
            <>
              <div className="p-4 border-b bg-white font-semibold">
                {
                  selectedChat.participants.find(
                    (p) => p._id !== user._id
                  )?.username
                }
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {messages.map((msg) => {
                  const senderId =
                    typeof msg.sender === "object"
                      ? msg.sender._id
                      : msg.sender;

                  return (
                    <div
                      key={msg._id}
                      className={`flex ${
                        senderId === user._id
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`px-4 py-2 rounded-lg max-w-xs ${
                          senderId === user._id
                            ? "bg-red-800 text-white"
                            : "bg-white border"
                        }`}
                      >
                        {msg.type === "hire-request" ? (
                          <>
                            <p><b>Title: {msg.payload.title}</b></p>
                            <p>Budget: Rs. {msg.payload.budget}</p>
                            <p>Description: {msg.payload.description}</p>
                          </>
                        ) : (
                          <>
                            {msg.message}
                            {msg.temp && (
                              <p className="text-xs opacity-70 mt-1">
                                Sending...
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef}></div>
              </div>

              <div className="h-5 px-4 text-sm text-gray-500">
                {isTyping && "Typing..."}
              </div>

              <div className="p-4 border-t bg-white flex gap-2">
                <input
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);

                    if (!socketRef.current || !selectedChat) return;

                    socketRef.current.emit("typing", {
                      chatId: selectedChat._id,
                      userId: user._id,
                    });

                    clearTimeout(typingTimeoutRef.current);
                    typingTimeoutRef.current = setTimeout(() => {
                      socketRef.current.emit("stop-typing", {
                        chatId: selectedChat._id,
                        userId: user._id,
                      });
                    }, 1500);
                  }}
                  className="flex-1 border px-3 py-2 rounded"
                  placeholder="Type message..."
                />

                <button
                  onClick={() => sendMessage()}
                  className="bg-red-800 text-white px-4 py-2 rounded"
                >
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}