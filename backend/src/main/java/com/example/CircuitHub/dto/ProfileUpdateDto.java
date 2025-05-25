package com.example.CircuitHub.dto;

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

    // No-argument constructor
    public ProfileUpdateDto() {}

    // All-argument constructor
    public ProfileUpdateDto(String uid, String firstName, String lastName, String course, String year) {
        this.uid = uid;
        this.firstName = firstName;
        this.lastName = lastName;
        this.course = course;
        this.year = year;
    }

    // Getters and Setters
    public String getUid() {
        return uid;
    }

    public void setUid(String uid) {
        this.uid = uid;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getCourse() {
        return course;
    }

    public void setCourse(String course) {
        this.course = course;
    }

    public String getYear() {
        return year;
    }

    public void setYear(String year) {
        this.year = year;
    }
}