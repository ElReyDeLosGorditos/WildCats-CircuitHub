package com.example.GadgetHub.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FirebaseUserDto {
    private String uid;
    private String email;
    private String firstName;
    private String lastName;
}