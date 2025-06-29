package com.backend.chat.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.backend.chat.entities.Message;
import com.backend.chat.entities.Room;
import com.backend.chat.services.RoomService;

@RestController
@RequestMapping("/api/v1/rooms")
@CrossOrigin("http://localhost:5173")
public class RoomController {

	@Autowired
	private RoomService roomService;
	
	//create room
	@PostMapping
	public ResponseEntity<?> createRoom(@RequestBody String roomId){
		
		try {
			
			if(roomId==null) {
				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Room Id is null");
			}
			
			Room room = roomService.createRoom(roomId);
			
			if(room!=null) {
				return ResponseEntity.status(HttpStatus.CREATED).body(room);
			}
			
		} catch (Exception e) {
			System.out.println("Exception: "+ e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Room already existed");
	}
	
	//get room
	@GetMapping("/{roomId}")
	public ResponseEntity<?> joinRoom(@PathVariable String roomId){
		
		try {
			if(roomId==null) {
				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Room Id is null");
			}
			
			Room room = roomService.getRoom(roomId);
			if(room!=null) {
				return ResponseEntity.ok(room);
			}
		} catch (Exception e) {
			System.out.println("Exception: "+ e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Room not found");
	}
	
	//get messages
	@GetMapping("/{roomId}/messages")
	public ResponseEntity<List<Message>> getMessages(@PathVariable String roomId, 
			@RequestParam(value="page", defaultValue = "0", required = false) int page, 
			@RequestParam(value="size", defaultValue = "20", required = false) int size){
		
		try {
			List<Message> messages = roomService.getMessages(roomId, page, size);
			
			if(messages!=null) {
				return ResponseEntity.ok(messages);
			}
			
		} catch (Exception e) {
			System.out.println("Exception: "+ e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
		
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
		
	}
	
}
