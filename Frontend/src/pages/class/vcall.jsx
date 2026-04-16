import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";

export default function ClassCall() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const localVideo = useRef();
  const remoteVideo = useRef();
  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
  const API_URL = import.meta.env.VITE_API_URL ; 
  const socketRef = useRef();
  const pcRef = useRef();
  const streamRef = useRef();
  const iceQueueRef = useRef([]);
  const user = JSON.parse(localStorage.getItem("userInfo"));
  const [isMuted, setIsMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typingUsers, setTypingUsers] = useState([]);
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
    });
    socketRef.current = socket;

    async function initCall() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        streamRef.current = stream;
        localVideo.current.srcObject = stream;

        const pc = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });
        pcRef.current = pc;

        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        pc.ontrack = (event) => {
          if (remoteVideo.current) {
            remoteVideo.current.srcObject = event.streams[0];
          }
        };

        pc.onicecandidate = e => {
          if (e.candidate) {
            socket.emit("ice-candidate", { roomId, candidate: e.candidate });
          }
        };

        socket.emit("join-room", roomId);

        socket.on("create-offer", async () => {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("offer", { roomId, offer });
        });

        socket.on("wait-offer", () => {
          console.log("Waiting for offer from peer...");
        });

        socket.on("offer", async ({ offer }) => {
          await pc.setRemoteDescription(offer);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit("answer", { roomId, answer });
        });

        socket.on("answer", async ({ answer }) => {
          await pc.setRemoteDescription(answer);
          flushIceQueue();
        });

        socket.on("ice-candidate", async ({ candidate }) => {
          if (!candidate) return;
          const pc = pcRef.current;
          if (!pc.remoteDescription) {
            iceQueueRef.current.push(candidate);
          } else {
            await pc.addIceCandidate(candidate);
          }
        });

        socket.on("peer-left", () => {
          remoteVideo.current.srcObject = null;
          pcRef.current?.close();
        });
        socketRef.current.on("end-call", () => {
          alert("Class has ended by instructor!");
          streamRef.current?.getTracks().forEach(track => track.stop());
          pcRef.current?.close();
          navigate("/");
        });

      } catch (err) {
        console.error("Failed to start call:", err);
        alert("Failed to access camera/mic");
      }
    }

    function flushIceQueue() {
      const pc = pcRef.current;
      iceQueueRef.current.forEach(async c => {
        try {
          await pc.addIceCandidate(c);
        } catch {}
      });
      iceQueueRef.current = [];
    }

    initCall();

    return () => {
      socket.off("create-offer");
      socket.off("wait-offer");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("peer-left");

      pcRef.current?.close();
      streamRef.current?.getTracks().forEach(t => t.stop());
      socket.disconnect();
    };
  }, [roomId]);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);

    socketRef.current.emit("join-class", {
      roomId,
      user,
    });

    socketRef.current.on("receive-message-class", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socketRef.current.on("system-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socketRef.current.on("typing", (userId) => {
      if (userId === user._id) return;

      setTypingUsers((prev) => {
        if (prev.includes(userId)) return prev;
        return [...prev, userId];
      });
    });

    socketRef.current.on("stop-typing", (userId) => {
      setTypingUsers((prev) => prev.filter((id) => id !== userId));
    });

    return () => {
      socketRef.current.emit("leave-class", { roomId, user });
      socketRef.current.disconnect();
    };
  }, [roomId]);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!text.trim()) return;

    const msg = {
      roomId,
      sender: user.username,
      senderId: user._id,
      message: text,
      type: "text",
    };

    socketRef.current.emit("send-message-class", msg);

    setMessages((prev) => [...prev, msg]);
    setText("");
  };

  const toggleMute = () => {
    const audioTrack = streamRef.current?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    }
  };

  const toggleCamera = () => {
    const videoTrack = streamRef.current?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setCameraOn(videoTrack.enabled);
    }
  };


  const leaveCall = () => navigate("/");

  
  const endClass = async () => {
    try {
      socketRef.current.emit("end-call", roomId);

      streamRef.current?.getTracks().forEach(track => track.stop());

      pcRef.current?.close();

      await fetch(`${API_URL}/instructor/online-class/completed/${roomId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      alert("Class ended and points awarded to learners!");
      navigate("/"); 
    } catch (err) {
      console.error("Failed to end class:", err);
    }
  };
  return (
     <div className="h-screen flex bg-gray-900">
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center p-4 bg-gray-800 text-white">
          <h1>Room: {roomId}</h1>
          <div className="flex gap-2">
            <button onClick={leaveCall} className="bg-red-600 px-4 py-2 rounded">
              Leave
            </button>
            {user.role === "instructor" && (
              <button
                onClick={endClass}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white"
              >
                End Class & Award Points
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 grid grid-cols-2 gap-4 p-4">
          <video ref={localVideo} autoPlay muted className="w-full h-full bg-black" />
          <video ref={remoteVideo} autoPlay className="w-full h-full bg-black" />
        </div>

        <div className="flex justify-center gap-4 p-4 bg-gray-800">
          <button onClick={toggleMute} className="bg-gray-700 px-4 py-2 rounded">
            {isMuted ? "Unmute" : "Mute"}
          </button>
          <button onClick={toggleCamera} className="bg-gray-700 px-4 py-2 rounded">
            {cameraOn ? "Camera Off" : "Camera On"}
          </button>
        </div>
      </div>

     <div className="w-[360px] bg-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-700 font-semibold text-white bg-red-800">
          Class Chat
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-100">
          {messages.map((msg, index) => {
            if (msg.type === "system") {
              return (
                <div key={index} className="text-center text-xs text-gray-500">
                  {msg.message}
                </div>
              );
            }

            const isMe = msg.senderId === user._id;

            return (
              <div
                key={index}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`px-3 py-2 max-w-[80%] break-words text-sm leading-relaxed ${
                    isMe
                      ? "bg-red-800 text-white rounded-lg rounded-br-none"
                      : "bg-white border rounded-lg rounded-bl-none"
                  }`}
                >
                  {!isMe && (
                    <p className="text-xs font-semibold text-gray-600 mb-1">
                      {msg.sender}
                    </p>
                  )}
                  {msg.message}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef}></div>
        </div>

        <div className="h-6 px-3 text-xs text-gray-400 bg-gray-800 flex items-center">
          {typingUsers.length > 0 &&
            `${typingUsers.length} user(s) typing...`}
        </div>

        <div className="p-3 border-t border-gray-700 bg-gray-800 flex gap-2">
          <input
            value={text}
            onChange={(e) => {
              setText(e.target.value);

              socketRef.current.emit("typing", {
                chatId: roomId,
                userId: user._id,
              });

              clearTimeout(typingTimeoutRef.current);

              typingTimeoutRef.current = setTimeout(() => {
                socketRef.current.emit("stop-typing", {
                  chatId: roomId,
                  userId: user._id,
                });
              }, 1500);
            }}
            placeholder="Type message..."
            className="flex-1 px-3 py-2 rounded bg-gray-700 text-white placeholder-gray-400 outline-none"
          />

          <button
            onClick={sendMessage}
            className="bg-red-800 hover:bg-red-700 text-white px-4 rounded"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}