package com.example.backend.controller;

import com.example.backend.dto.common.UserDTO;
import com.example.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*") // For development, in production restrict to your frontend domain
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @GetMapping("/{id}")
    public UserDTO getUser(@PathVariable String id) {
        // Logic to retrieve user by ID
        return new UserDTO();
    }

    @PostMapping
    public void createUser(@RequestBody UserDTO userDTO) {
        // Logic to create a new user
    }

    @PutMapping("/{id}")
    public void updateUser(@PathVariable String id, @RequestBody UserDTO userDTO) {
        // Logic to update an existing user
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable String id) {
        // Logic to delete a user
    }
    

}
