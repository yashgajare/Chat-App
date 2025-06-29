package com.backend.chat.repositories;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.backend.chat.entities.Room;

@Repository
public interface RoomRepository extends MongoRepository<Room, String> {

	Room findByRoomId(String roomId);
	
}

