# Teacher Dropdown Implementation Summary

## Changes Made

### Backend Changes

#### 1. UserService.java
**Location**: `backend/src/main/java/com/example/CircuitHub/service/UserService.java`

**Added Method**:
```java
public List<User> getAllTeachers() {
    try {
        ApiFuture<QuerySnapshot> future = firestore.collection("users")
                .whereEqualTo("role", "teacher")
                .get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();
        return documents.stream()
                .map(doc -> doc.toObject(User.class))
                .collect(Collectors.toList());
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
        throw new RuntimeException("Error retrieving teachers: interrupted operation", e);
    } catch (ExecutionException e) {
        throw new RuntimeException("Error retrieving teachers: execution failed", e);
    }
}
```

**Added Imports**:
```java
import java.util.List;
import java.util.stream.Collectors;
```

#### 2. UserController.java
**Location**: `backend/src/main/java/com/example/CircuitHub/controller/UserController.java`

**Added Endpoint**:
```java
@GetMapping("/users/teachers")
public ResponseEntity<?> getAllTeachers() {
    try {
        System.out.println("GET All teachers requested");
        java.util.List<User> teachers = userService.getAllTeachers();
        return ResponseEntity.ok(teachers);
    } catch (Exception e) {
        System.err.println("Error fetching teachers: " + e.getMessage());
        e.printStackTrace();
        return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch teachers: " + e.getMessage()));
    }
}
```

**New API Endpoint**: `GET /api/users/teachers`
- Returns a list of all users with role "teacher"
- Response format: JSON array of User objects

---

### Frontend Changes

#### 1. requestform.jsx
**Location**: `src/pages/user/requestform.jsx`

**Key Changes**:

1. **Added State Variables**:
```javascript
const [teachers, setTeachers] = useState([]);
const [selectedTeacherId, setSelectedTeacherId] = useState("");
const [selectedTeacherName, setSelectedTeacherName] = useState("");
```

2. **Added Teacher Fetching**:
```javascript
const fetchTeachers = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/users/teachers");
      setTeachers(response.data);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      alert("Failed to load teachers. Please try again.");
    }
};
```

3. **Added Teacher Selection Handler**:
```javascript
const handleTeacherChange = (e) => {
    const teacherId = e.target.value;
    setSelectedTeacherId(teacherId);
    
    // Find the teacher's full name
    const teacher = teachers.find(t => t.uid === teacherId);
    if (teacher) {
      setSelectedTeacherName(`${teacher.firstName} ${teacher.lastName}`);
    } else {
      setSelectedTeacherName("");
    }
};
```

4. **Replaced Text Input with Dropdown**:
```jsx
<div className="input-row full-width">
  <label>Teacher Assigned: <span style={{color: 'red'}}>*</span></label>
  <select
      value={selectedTeacherId}
      onChange={handleTeacherChange}
      required
      style={{
        padding: "10px",
        borderRadius: "5px",
        border: "1px solid #ccc",
        fontSize: "14px",
      }}
  >
    <option value="">-- Select a Teacher --</option>
    {teachers.map((teacher) => (
        <option key={teacher.uid} value={teacher.uid}>
          {teacher.firstName} {teacher.lastName} {teacher.department ? `(${teacher.department})` : ''}
        </option>
    ))}
  </select>
  <small style={{ color: "#666", display: "block", marginTop: "5px" }}>
    Select the teacher who will approve this request.
  </small>
</div>
```

5. **Updated Request Data**:
```javascript
const requestData = {
  userId: user.uid,
  userName: user.displayName || user.email || "Unknown User",
  itemId: item.id,
  itemName: item.name,
  borrowDate,
  startTime: formatTime(
      Math.floor(startTimeNumeric),
      startTimeNumeric % 1 === 0.5 ? 30 : 0
  ),
  returnTime,
  reason,
  timeRange: formattedTimeRange,
  status: "Pending",
  createdAt: serverTimestamp(),

  // NEW FIELDS
  teacherId: selectedTeacherId,      // Teacher's UID
  teacherAssigned: selectedTeacherName,  // Teacher's full name
  groupMembers,
};
```

6. **Updated Submit Button Validation**:
```jsx
<button
    type="submit"
    className="submit-btn"
    disabled={
        !agree ||
        selectedItems.length === 0 ||
        returnTime.includes("Invalid") ||
        !selectedTeacherId  // Must select a teacher
    }
>
  Submit Request
</button>
```

7. **Updated Confirmation Modal**:
Shows selected teacher's name in the confirmation dialog before submitting.

---

## Features

### What This Implementation Provides:

1. **Teacher Selection**:
   - Users can select from a dropdown list of all registered teachers
   - Shows teacher's first name, last name, and department (if available)
   - Required field - cannot submit without selecting a teacher

2. **Data Storage**:
   - Stores both `teacherId` (UID) and `teacherAssigned` (full name) in Firestore
   - `teacherId` can be used to link to teacher profile or send notifications
   - `teacherAssigned` provides human-readable display name

3. **User Experience**:
   - Clean dropdown interface instead of manual text entry
   - Prevents typos and ensures valid teacher selection
   - Shows helpful message prompting user to select a teacher
   - Red asterisk indicates required field

4. **Error Handling**:
   - Alerts user if teachers fail to load
   - Console logs errors for debugging
   - Disables submit button if no teacher selected

---

## Testing Instructions

### Backend Testing:

1. **Test Teacher Endpoint**:
```bash
curl http://localhost:8080/api/users/teachers
```

Expected response:
```json
[
  {
    "uid": "teacher123",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "role": "teacher",
    "department": "HCS-DEPT",
    ...
  }
]
```

### Frontend Testing:

1. **Create Test Teachers**:
   - Register at least 2-3 users with role "teacher"
   - Ensure they have firstName, lastName, and optionally department

2. **Test Dropdown**:
   - Navigate to request form
   - Check if dropdown is populated with teachers
   - Select a teacher and verify the selection works
   - Try submitting without selecting a teacher (should be blocked)

3. **Submit Request**:
   - Complete the entire form including teacher selection
   - Submit the request
   - Check Firestore to verify both `teacherId` and `teacherAssigned` are saved

4. **Verify Data**:
In Firestore Console, check the `borrowRequests` collection:
```javascript
{
  teacherId: "abc123def456",  // Teacher's UID
  teacherAssigned: "John Doe",  // Teacher's display name
  ...
}
```

---

## Database Schema Update

### BorrowRequests Collection

**New Fields**:
```javascript
{
  // ... existing fields ...
  
  teacherId: string,          // NEW: Teacher's UID for lookup
  teacherAssigned: string,    // Teacher's full name (firstName + lastName)
  groupMembers: array,        // Array of group member names
  
  // ... rest of fields ...
}
```

---

## Next Steps / Future Enhancements

1. **Teacher Dashboard**:
   - Create a dashboard where teachers can see requests assigned to them
   - Filter requests by `teacherId` field

2. **Email Notifications**:
   - Use `teacherId` to fetch teacher's email
   - Send notification when request is submitted

3. **Department Filtering**:
   - Allow filtering teachers by department in dropdown
   - Group teachers by department

4. **Teacher Availability**:
   - Show if teacher is available/busy
   - Indicate number of pending requests per teacher

5. **Multi-Teacher Assignment**:
   - Allow selecting multiple teachers for approval
   - Implement approval workflow where any selected teacher can approve

---

## Troubleshooting

### Issue: Dropdown is empty
**Solution**: 
- Check if backend is running on port 8080
- Verify teachers exist in Firestore with role="teacher"
- Check browser console for fetch errors
- Verify CORS is configured correctly

### Issue: "Failed to load teachers"
**Solution**:
- Check backend logs for errors
- Verify Firestore connection
- Ensure UserService.getAllTeachers() is working correctly

### Issue: Teacher name not showing in confirmation
**Solution**:
- Verify `handleTeacherChange` is being called
- Check if teacher object has firstName and lastName
- Console.log the teachers array to debug

---

## API Documentation

### Get All Teachers

**Endpoint**: `GET /api/users/teachers`

**Description**: Retrieves all users with role "teacher"

**Request**: No parameters required

**Response**:
```json
[
  {
    "uid": "string",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "role": "teacher",
    "department": "string (optional)",
    "employeeId": "string (optional)",
    "createdAt": "string",
    "course": "string",
    "year": "string",
    "profileImageUrl": "string",
    "lateReturnCount": 0,
    "lastLateReturnDate": null
  }
]
```

**Status Codes**:
- 200: Success
- 500: Server error

---

## Files Modified

1. ✅ `backend/src/main/java/com/example/CircuitHub/service/UserService.java`
2. ✅ `backend/src/main/java/com/example/CircuitHub/controller/UserController.java`
3. ✅ `src/pages/user/requestform.jsx`

---

## Implementation Complete! 🎉

The teacher dropdown feature has been successfully implemented. Users can now:
- View all registered teachers in a dropdown
- Select the appropriate teacher for approval
- Submit requests with teacher information
- See teacher details (name and department)

The system ensures data integrity by storing both the teacher's ID and name, making it easy to implement future features like teacher dashboards and notifications.
