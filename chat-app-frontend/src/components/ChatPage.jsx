import React, { useEffect, useRef, useState } from "react";
import { MdAttachFile, MdSend } from "react-icons/md";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";
import SockJS from "sockjs-client";
import { baseURL } from "../config/AxiosHelper";
import { Stomp } from "@stomp/stompjs";
import toast from "react-hot-toast";
import { getMessagesApi } from "../services/RoomService";
import { timeAgo } from "../config/helper";
import CryptoJS from "crypto-js";

// ... same imports
const ChatPage = () => {
  const {
    roomId,
    currentUser,
    connected,
    setConnected,
    setRoomId,
    setCurrentUser,
  } = useChatContext();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const inputRef = useRef(null);
  const chatBoxRef = useRef(null);
  const [stompClient, setStompClient] = useState(null);

  const [typingUser, setTypingUser] = useState("");
  const typingTimeoutRef = useRef(null);

  const secretKey = import.meta.env.VITE_SECRET_KEY;

  useEffect(() => {
    if (!connected) navigate("/");
  }, [connected, roomId, currentUser]);

  useEffect(() => {
    async function loadMessages() {
      try {
        const messageRecieved = await getMessagesApi(roomId);
        const decryptedMessages = messageRecieved.map((msg)=>{
        const decrypted = decryptMessage(msg.content);
        return {
          ...msg,
          content: decrypted,
        };
      });
        setMessages(decryptedMessages);
      } catch (error) {
        console.log(error);
      }
    }
    if (connected) loadMessages();
  }, [connected, roomId]);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scroll({
        top: chatBoxRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  function handleLogout() {
    stompClient.disconnect();
    setConnected(false);
    setRoomId("");
    setCurrentUser("");
    navigate("/");
  }

  useEffect(() => {
    const connectWebSocket = () => {
      const socket = new SockJS(`${baseURL}/chat`);
      const client = Stomp.over(socket);

      client.connect({}, () => {
        setStompClient(client);
        toast.success("Connected");

        // 🔔 Subscribe to chat messages
        client.subscribe(`/topic/room/${roomId}`, (message) => {
          const newMessage = JSON.parse(message.body);
          const decryptedMessage = {
            ...newMessage,
            content: decryptMessage(newMessage.content),
          };
          setMessages((prev) => [...prev, decryptedMessage]);
        });

        // 👀 Subscribe to typing notifications
        client.subscribe(`/topic/typing/${roomId}`, (msg) => {
          const typingInfo = JSON.parse(msg.body);
          console.log(typingInfo);
          if (typingInfo.sender !== currentUser) {
            console.log(typingInfo.sender);
            console.log(currentUser);
            setTypingUser(typingInfo.sender);

            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
              setTypingUser(null);
            }, 2000); // Hide typing after 2 seconds
          }
        });
      });
    };

    if (connected) connectWebSocket();
  }, [roomId]);

  const encryptMessage = (text) => {
    return CryptoJS.AES.encrypt(text, secretKey).toString();
  };

  const decryptMessage = (cipher) => {
    const bytes = CryptoJS.AES.decrypt(cipher, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  };

  const sendMessage = async () => {
    if (stompClient && connected && input.trim()) {

      const encryptedContent = encryptMessage(input);

      const message = {
        sender: currentUser,
        content: encryptedContent,
        roomId: roomId,
      };
      stompClient.send(
        `/app/sendMessage/${roomId}`,
        {},
        JSON.stringify(message)
      );
      setInput("");
    }
  };

  const typingTimer = useRef(null);
  const sendTypingNotification = async () => {
    if (typingTimer.current) return;
    typingTimer.current = setTimeout(() => (typingTimer.current = null), 1000);

    if (stompClient && stompClient.connected) {
      const typingPayload = {
        sender: currentUser,
        roomId: roomId,
        typing: true,
      };
      stompClient.send(
        `/app/typing/${roomId}`,
        {},
        JSON.stringify(typingPayload)
      );
    }
  };

  return (
    <div>
      {/* Header */}
      <header
        className="flex justify-around items-center py-5 fixed w-full z-10 
        bg-gray-100 text-gray-900 border-b border-gray-300 
        dark:bg-gray-900 dark:text-white dark:border-gray-700"
      >
        <div>
          <h1 className="text-xl font-semibold">
            Room: <span>{roomId}</span>
          </h1>
        </div>
        <div>
          <h1 className="text-xl font-semibold">
            User: <span>{currentUser}</span>
          </h1>
        </div>
        <div>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-700 text-white px-3 py-2 rounded-full"
          >
            Leave Room
          </button>
        </div>
      </header>

      {/* Chat Body */}

      <main
        ref={chatBoxRef}
        className="pt-20 px-6 w-[60%] bg-gray-300 shadownpm install tailwind-scrollbar-hide
 dark:bg-slate-800 mx-auto h-[calc(100vh-6rem)] overflow-y-scroll scrollbar-hide"
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={` flex ${
              message.sender === currentUser ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`p-3 my-2 max-w-xs rounded-2xl shadow-sm border
              ${
                message.sender === currentUser
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-900 border-gray-300 dark:bg-white dark:text-black"
              }
              dark:border-black`}
            >
              <div className="flex flex-row items-center">
                <img
                  className="h-10 w-10 rounded-full"
                  src={"https://avatar.iran.liara.run/public/27"}
                  alt=""
                />
                <div className="flex flex-col pl-2">
                  <p className="text-sm font-bold">{message.sender}</p>
                  <p>{message.content}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-800">
                    {timeAgo(message.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </main>
      {typingUser && (
        <div className="text-center text-sm font-bold italic text-gray-700 dark:text-white">
          {typingUser} is typing...
        </div>
      )}

      {/* Input Section */}
      <div className="bottom-2 fixed w-full h-16">
        <div
          className="bg-gray-100 text-black border border-gray-300 rounded-full pr-8 
                        flex items-center justify-between gap-4 h-full w-[60%] mx-auto 
                        dark:bg-slate-700 dark:text-white dark:border-slate-600"
        >
          <input
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              sendTypingNotification();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            type="text"
            placeholder="Type your message here..."
            className="bg-white text-black border border-gray-300 px-4 py-2 rounded-full w-full h-full
                       focus:outline-none 
                       dark:bg-gray-800 dark:text-white dark:border-gray-700"
          />
          <div className="flex gap-2">
            <button className="bg-purple-600 h-10 w-10 flex justify-center items-center rounded-full text-white">
              <MdAttachFile size={20} />
            </button>
            <button
              onClick={sendMessage}
              className="bg-green-600 h-10 w-10 flex justify-center items-center rounded-full text-white"
            >
              <MdSend size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
