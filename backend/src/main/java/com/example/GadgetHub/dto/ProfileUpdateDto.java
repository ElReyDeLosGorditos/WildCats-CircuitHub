package com.example.GadgetHub.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProfileUpdateDto {
    private String uid;
    private String firstName;
    private String lastName;
    private String course;
    private String year;
}