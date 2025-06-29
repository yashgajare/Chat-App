package com.backend.chat.services;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.backend.chat.entities.Message;
import com.backend.chat.entities.Room;
import com.backend.chat.repositories.RoomRepository;

@Service
public class RoomService {
	
	@Autowired
	private RoomRepository roomRepository;
	
	public Room createRoom(String roomId) {
		
		if(roomRepository.findByRoomId(roomId)!=null) {
			return null;
		}
		
		Room room = new Room();
		room.setRoomId(roomId);
		roomRepository.save(room);
		return room;	
	}
	
	public Room getRoom(String roomId) {
		if(roomId==null) return null;
		
		Room room = roomRepository.findByRoomId(roomId);
		if(room!=null) {
			return room;
		}
		
		return null;
	}
	
	public List<Message> getMessages(String roomId, int page, int size){
		if(roomId==null) {
			return null;
		}
		
		Room room = roomRepository.findByRoomId(roomId);
		List<Message> messages = new ArrayList<>();
		
		if(room!=null) {
			messages = room.getMessages();
			int start = Math.max(0, messages.size() - (page+1)*size);
			int end = Math.min(messages.size(), start+size);
			List<Message> paginatedMessages = messages.subList(start, end);
			
			return paginatedMessages; 
		}
		return null;
	}
}
