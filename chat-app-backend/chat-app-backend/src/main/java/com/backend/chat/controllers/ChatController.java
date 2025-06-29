package com.backend.chat.controllers;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;

import com.backend.chat.entities.Message;
import com.backend.chat.entities.Room;
import com.backend.chat.payload.MessageRequest;
import com.backend.chat.payload.TypingNotification;
import com.backend.chat.repositories.RoomRepository;

@Controller
@CrossOrigin("http://localhost:5173")
public class ChatController {

	@Autowired
	private RoomRepository roomRepository;
	
	 @Autowired
	    private SimpMessagingTemplate messagingTemplate;
	
	@MessageMapping("/sendMessage/{roomId}")
	@SendTo("/topic/room/{roomId}")
	public Message sendMessage(@DestinationVariable String roomId, @RequestBody MessageRequest request) {
		System.out.println(request.getContent());
		Room room = roomRepository.findByRoomId(roomId);
		Message message = new Message();
		message.setSender(request.getSender());
		message.setContent(request.getContent());
		message.setTimestamp(LocalDateTime.now());
		
		if(room!=null) {
			room.getMessages().add(message);
			roomRepository.save(room);
		}
		return message;
	}
	
	 @MessageMapping("/typing/{roomId}")
	    public void handleTyping(@DestinationVariable String roomId, TypingNotification notification) {
		 System.out.println("Received typing notification: " + notification);
	        messagingTemplate.convertAndSend("/topic/typing/" + roomId, notification);
	    }
	
}
