
import React, { useEffect, useState } from "react";
import chatIcon from "../assets/group.png";
import toast from "react-hot-toast";
import { createRoomApi, joinChatApi } from "../services/RoomService";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";
import ThemeToggle from "./ThemeToggle"; 

const JoinCreateChat = () => {
  const [detail, setDetail] = useState({
    roomId: "",
    userName: "",
  });

  const { setRoomId, setCurrentUser, setConnected } = useChatContext();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(true);

  function handleFormInput(event) {
    setDetail({
      ...detail,
      [event.target.name]: event.target.value,
    });
  }

  async function joinChat() {
    if (validateForm()) {
      try {
        const response = await joinChatApi(detail.roomId);
        toast.success("Joined room!");
        setRoomId(response.roomId);
        setCurrentUser(detail.userName);
        setConnected(true);
        navigate("/chat");
      } catch (error) {
        console.log(error);
        if (error.status === 400) {
          toast.error("Room not found");
        } else {
          toast.error("Error in joining room");
        }
      }
    }
  }

  async function createRoom() {
    if (validateForm()) {
      try {
        const response = await createRoomApi(detail.roomId);
        toast.success("Room created successfully!");
        setRoomId(response.roomId);
        setCurrentUser(detail.userName);
        setConnected(true);
        navigate("/chat");
      } catch (error) {
        if (error.status === 400) {
          toast.error("Room already exists");
        } else {
          toast.error("Error in creating room");
        }
      }
    }
  }

  function validateForm() {
    if (detail.roomId === "" || detail.userName === "") {
      toast.error("Invalid Input!");
      return false;
    }
    return true;
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-white dark:bg-gray-950">
      <div className="p-10 w-full flex flex-col gap-5 max-w-md rounded shadow
                      bg-gray-100 border border-gray-300
                      dark:bg-gray-900 dark:border-gray-700">

        <ThemeToggle />

        <div>
          <img src={chatIcon} className="w-24 mx-auto" />
        </div>

        <h1 className="text-center text-2xl font-semibold text-gray-800 dark:text-white">
          Join Room / Create Room
        </h1>

        {/* Name input */}
        <div>
          <label htmlFor="name" className="font-medium mb-2 block text-gray-700 dark:text-white">
            Your Name
          </label>
          <input
            onChange={handleFormInput}
            value={detail.userName}
            name="userName"
            id="name"
            placeholder="Enter your name"
            className="w-full px-4 py-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-500
                       bg-white text-gray-800 border-gray-300
                       dark:bg-gray-600 dark:text-white dark:border-gray-600"
          />
        </div>

        {/* Room ID input */}
        <div>
          <label htmlFor="roomId" className="font-medium mb-2 block text-gray-700 dark:text-white">
            Room ID / New Room ID
          </label>
          <input
            onChange={handleFormInput}
            value={detail.roomId}
            name="roomId"
            id="roomId"
            placeholder="Enter the room ID"
            className="w-full px-4 py-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-500
                       bg-white text-gray-800 border-gray-300
                       dark:bg-gray-600 dark:text-white dark:border-gray-600"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-6 mt-2">
          <button
            onClick={joinChat}
            className="px-3 py-2 font-bold rounded-full
                       text-white bg-blue-600 hover:bg-blue-800
                       dark:bg-blue-500 hover:dark:bg-blue-800"
          >
            Join Room
          </button>
          <button
            onClick={createRoom}
            className="px-3 py-2 font-bold rounded-full
                       text-white bg-orange-500 hover:bg-orange-700
                       dark:bg-orange-500 hover:dark:bg-orange-800"
          >
            Create Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinCreateChat;
