# WildCats-CircuitHub Enhancement Implementation Guide

## Overview
This guide documents the enhancements made to the WildCats-CircuitHub borrowing system based on the manual borrower's slip requirements.

## New Features Implemented

### 1. **Two-Level Approval Workflow**
- **Teacher Approval**: Teachers must approve requests first
- **Lab Assistant Approval**: After teacher approval, lab assistants give final approval
- **Status Flow**: Pending → Teacher-Approved → Approved (Lab-Approved) → Returned

### 2. **Late Return Tracking**
- Tracks how many times a student returns items late
- Calculates days late automatically
- Stores in user profile for easy reference
- Admins can see student's late return history

### 3. **Room Number Tracking**
- Added `roomNumber` field to track where equipment will be used
- Added `labSection` field (e.g., "Laboratory Area 1")
- Helps trace equipment location

### 4. **Enhanced User Roles**
- **Student**: Can borrow items and submit requests
- **Teacher**: Can approve/reject student borrow requests
- **Lab Assistant**: Can give final approval after teacher approval
- **Admin**: Full system access

### 5. **Student Information in Forms**
- Automatically includes borrower's course and year level
- Pulled from user profile when creating requests
- Matches the manual borrower's slip format

---

## Backend Changes Made

### Modified Files:

#### 1. **BorrowRequest.java** (Model)
**Location**: `backend/src/main/java/com/example/CircuitHub/model/BorrowRequest.java`

**New Fields Added:**
```java
// Student info
private String borrowerCourse;  // Student's course
private String borrowerYear;    // Student's year level

// Room tracking
private String roomNumber;      // Room where equipment will be used
private String labSection;      // Laboratory section

// Approval workflow
private String teacherApprovedBy;      // Teacher who approved
private String teacherApprovedAt;      // Timestamp of teacher approval
private String labAssistantApprovedBy; // Lab assistant who approved
private String labAssistantApprovedAt; // Timestamp of lab approval

// Late return tracking
private Boolean isLate;              // Whether this return was late
private Integer daysLate;            // Number of days late
private String lateReturnNotes;      // Notes about late return
```

#### 2. **User.java** (Model)
**Location**: `backend/src/main/java/com/example/CircuitHub/model/User.java`

**New Fields Added:**
```java
// Late return tracking
private Integer lateReturnCount;      // Number of times user returned items late
private String lastLateReturnDate;    // Date of last late return

// Teacher-specific fields
private String department;            // Department for teachers
private String employeeId;            // Employee ID for teachers
```

**Updated Role Values:**
- `admin` - System administrator
- `student` - Regular student user
- `teacher` - Faculty member who approves requests
- `lab-assistant` - Lab staff who gives final approval

#### 3. **BorrowRequestService.java** (Service)
**Location**: `backend/src/main/java/com/example/CircuitHub/service/BorrowRequestService.java`

**New Methods:**
```java
// Get requests pending teacher approval
public List<BorrowRequest> getPendingTeacherApproval()

// Get requests pending lab assistant approval
public List<BorrowRequest> getPendingLabApproval()

// Teacher approval
public BorrowRequest teacherApprove(String requestId, String teacherId, String teacherName)

// Lab assistant approval
public BorrowRequest labApprove(String requestId, String labAssistantId, String labAssistantName)

// Get user's borrow history with late tracking
public Map<String, Object> getUserBorrowHistory(String userId)

// Update user's late return count (private method)
private void updateUserLateCount(String userId)
```

**Enhanced Logic:**
- Automatically fetches student's course and year when creating request
- Checks if return is late and updates user's late count
- Enforces two-level approval workflow

#### 4. **BorrowRequestController.java** (Controller)
**Location**: `backend/src/main/java/com/example/CircuitHub/controller/BorrowRequestController.java`

**New Endpoints:**
```java
// Get requests pending teacher approval
GET /api/requests/pending-teacher

// Get requests pending lab assistant approval
GET /api/requests/pending-lab

// Teacher approval
PUT /api/requests/{id}/teacher-approve
Body: { "teacherId": "...", "teacherName": "..." }

// Lab assistant approval
PUT /api/requests/{id}/lab-approve
Body: { "labAssistantId": "...", "labAssistantName": "..." }

// Get user's borrow history with late tracking
GET /api/requests/user/{userId}/history
```

#### 5. **UserService.java** (Service)
**Location**: `backend/src/main/java/com/example/CircuitHub/service/UserService.java`

**Changes:**
- Initializes `lateReturnCount` to 0 for new users
- Handles new fields (department, employeeId) for teachers
- Ensures late tracking fields are never null

---

## Frontend Changes Needed

### 1. **Update Registration/Signup** (`src/pages/user/register.jsx` or `src/pages/signup.jsx`)

Add role selection during registration:
```jsx
<select 
  value={role} 
  onChange={(e) => setRole(e.target.value)}
  required
>
  <option value="student">Student</option>
  <option value="teacher">Teacher</option>
  <option value="lab-assistant">Lab Assistant</option>
</select>
```

### 2. **Update Request Form** (`src/pages/user/requestform.jsx`)

Add room number field:
```jsx
<input
  type="text"
  placeholder="Room Number (e.g., Room 301)"
  value={roomNumber}
  onChange={(e) => setRoomNumber(e.target.value)}
  required
/>

<input
  type="text"
  placeholder="Lab Section (e.g., Laboratory Area 1)"
  value={labSection}
  onChange={(e) => setLabSection(e.target.value)}
  required
/>
```

### 3. **Create Teacher Dashboard** 

Create new file: `src/pages/teacher/teacher-dashboard.jsx`

Features needed:
- View all pending requests (status: "Pending")
- Show student info: name, course, year, room number
- Approve/Reject buttons
- See which requests have been approved

Example structure:
```jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

function TeacherDashboard() {
  const [pendingRequests, setPrerequisiteRequests] = useState([]);
  
  useEffect(() => {
    fetchPendingRequests();
  }, []);
  
  const fetchPendingRequests = async () => {
    const response = await axios.get('http://localhost:8080/api/requests/pending-teacher');
    setPendingRequests(response.data);
  };
  
  const approveRequest = async (requestId) => {
    await axios.put(`http://localhost:8080/api/requests/${requestId}/teacher-approve`, {
      teacherId: currentUser.uid,
      teacherName: currentUser.displayName
    });
    fetchPendingRequests(); // Refresh list
  };
  
  return (
    <div>
      <h2>Pending Approval Requests</h2>
      {pendingRequests.map(request => (
        <div key={request.id}>
          <p>Student: {request.borrowerName}</p>
          <p>Course: {request.borrowerCourse} - {request.borrowerYear}</p>
          <p>Room: {request.roomNumber}</p>
          <p>Item: {request.itemName}</p>
          <button onClick={() => approveRequest(request.id)}>Approve</button>
        </div>
      ))}
    </div>
  );
}
```

### 4. **Update Lab Assistant/Admin Dashboard** (`src/pages/admin/admin-requests.jsx`)

Add filter for requests that need lab approval:
```jsx
const fetchLabPendingRequests = async () => {
  const response = await axios.get('http://localhost:8080/api/requests/pending-lab');
  setLabPendingRequests(response.data);
};

const labApprove = async (requestId) => {
  await axios.put(`http://localhost:8080/api/requests/${requestId}/lab-approve`, {
    labAssistantId: currentUser.uid,
    labAssistantName: currentUser.displayName
  });
  fetchLabPendingRequests();
};
```

### 5. **Display Late Return Indicator**

In user profile or request history, show late return count:
```jsx
<div className="late-return-warning">
  {user.lateReturnCount > 0 && (
    <span className="warning-badge">
      ⚠️ Late Returns: {user.lateReturnCount}
    </span>
  )}
</div>
```

### 6. **Update Status Display**

Update status badges to show new statuses:
```jsx
const getStatusBadge = (status) => {
  switch(status) {
    case 'Pending':
      return <span className="badge badge-warning">Pending Teacher Approval</span>;
    case 'Teacher-Approved':
      return <span className="badge badge-info">Pending Lab Approval</span>;
    case 'Approved':
      return <span className="badge badge-success">Approved</span>;
    case 'Returned':
      return <span className="badge badge-secondary">Returned</span>;
    case 'Rejected':
      return <span className="badge badge-danger">Rejected</span>;
    default:
      return <span className="badge">{status}</span>;
  }
};
```

---

## API Endpoints Summary

### Request Management

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/requests` | Create new borrow request | Student |
| GET | `/api/requests` | Get all requests | Admin/Lab |
| GET | `/api/requests/pending-teacher` | Get requests needing teacher approval | Teacher |
| GET | `/api/requests/pending-lab` | Get requests needing lab approval | Lab Assistant |
| GET | `/api/requests/{id}` | Get specific request | All |
| GET | `/api/requests/user/{userId}` | Get user's requests | Owner/Admin |
| GET | `/api/requests/user/{userId}/history` | Get user's borrow history with late tracking | Owner/Admin |
| PUT | `/api/requests/{id}/teacher-approve` | Teacher approves request | Teacher |
| PUT | `/api/requests/{id}/lab-approve` | Lab assistant gives final approval | Lab Assistant |
| PUT | `/api/requests/{id}` | Update request status (return, reject) | Admin/Lab |
| DELETE | `/api/requests/{id}` | Delete request | Admin |

---

## Status Flow Diagram

```
Student submits request
        ↓
    [Pending] ← Waiting for teacher approval
        ↓
Teacher approves
        ↓
[Teacher-Approved] ← Waiting for lab assistant approval
        ↓
Lab Assistant approves
        ↓
    [Approved] ← Item is borrowed
        ↓
Student returns item
        ↓
    [Returned] ← Check if late, update user's late count
```

---

## Database Schema Changes

### BorrowRequests Collection
```javascript
{
  id: string,
  itemId: string,
  itemName: string,
  borrowerId: string,
  borrowerName: string,
  borrowerEmail: string,
  borrowerCourse: string,        // NEW
  borrowerYear: string,          // NEW
  roomNumber: string,            // NEW
  labSection: string,            // NEW
  requestDate: string,
  startDate: string,
  endDate: string,
  status: string,                // Pending, Teacher-Approved, Approved, Returned, Rejected
  purpose: string,
  description: string,
  itemCondition: string,
  teacherApprovedBy: string,     // NEW
  teacherApprovedAt: string,     // NEW
  labAssistantApprovedBy: string, // NEW
  labAssistantApprovedAt: string, // NEW
  isLate: boolean,               // NEW
  daysLate: number,              // NEW
  lateReturnNotes: string,       // NEW
  createdAt: string,
  updatedAt: string,
  returnedAt: string
}
```

### Users Collection
```javascript
{
  uid: string,
  firstName: string,
  lastName: string,
  email: string,
  role: string,                  // admin, student, teacher, lab-assistant
  course: string,
  year: string,
  profileImageUrl: string,
  lateReturnCount: number,       // NEW
  lastLateReturnDate: string,    // NEW
  department: string,            // NEW (for teachers)
  employeeId: string,            // NEW (for teachers)
  createdAt: string
}
```

---

## Testing Checklist

### Backend Testing
- [ ] Create a borrow request - should have status "Pending"
- [ ] Teacher approves request - status becomes "Teacher-Approved"
- [ ] Lab assistant approves request - status becomes "Approved"
- [ ] Return item on time - isLate should be false
- [ ] Return item late - isLate should be true, lateReturnCount increases
- [ ] Check user history - should show late return count
- [ ] Room number and lab section are saved correctly
- [ ] Student's course and year are auto-filled from profile

### Frontend Testing
- [ ] Registration allows role selection
- [ ] Request form has room number field
- [ ] Teacher dashboard shows pending requests
- [ ] Lab assistant dashboard shows teacher-approved requests
- [ ] Status badges display correctly
- [ ] Late return indicator shows on profiles
- [ ] Can't skip teacher approval to lab approval

---

## Next Steps

1. **Update Registration Page**
   - Add role selection dropdown
   - Add department and employee ID fields for teachers

2. **Update Request Form**
   - Add room number input
   - Add lab section input
   - Auto-fill student course and year

3. **Create Teacher Dashboard**
   - Create `src/pages/teacher/teacher-dashboard.jsx`
   - Show pending requests
   - Add approve/reject functionality

4. **Update Lab Assistant Dashboard**
   - Filter for teacher-approved requests
   - Add lab approval button
   - Show approval workflow status

5. **Add Late Return Display**
   - Show warning badge on user profiles
   - Display late count in request history
   - Alert admins of students with multiple late returns

6. **Update Routing**
   - Add teacher dashboard route
   - Protect routes based on roles
   - Redirect users to appropriate dashboards

7. **Styling**
   - Create CSS for teacher dashboard
   - Add warning colors for late returns
   - Style approval workflow indicators

---

## Code Snippets for Quick Implementation

### Role-Based Routing Example
```jsx
// In App.jsx or routing file
{user.role === 'teacher' && (
  <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
)}

{user.role === 'lab-assistant' && (
  <Route path="/lab/dashboard" element={<LabDashboard />} />
)}
```

### Late Return Warning Component
```jsx
function LateReturnBadge({ lateCount }) {
  if (lateCount === 0) return null;
  
  return (
    <div className={`late-badge ${lateCount > 3 ? 'severe' : 'warning'}`}>
      ⚠️ Late Returns: {lateCount}
      {lateCount > 3 && <span> - Action Required</span>}
    </div>
  );
}
```

### Request Status Timeline
```jsx
function ApprovalTimeline({ request }) {
  return (
    <div className="timeline">
      <div className="timeline-item completed">
        <span>Request Submitted</span>
        <small>{request.createdAt}</small>
      </div>
      
      {request.teacherApprovedBy && (
        <div className="timeline-item completed">
          <span>Teacher Approved by {request.teacherApprovedBy}</span>
          <small>{request.teacherApprovedAt}</small>
        </div>
      )}
      
      {request.labAssistantApprovedBy && (
        <div className="timeline-item completed">
          <span>Lab Approved by {request.labAssistantApprovedBy}</span>
          <small>{request.labAssistantApprovedAt}</small>
        </div>
      )}
      
      {request.returnedAt && (
        <div className={`timeline-item completed ${request.isLate ? 'late' : ''}`}>
          <span>Returned {request.isLate && '(LATE)'}</span>
          <small>{request.returnedAt}</small>
          {request.isLate && <small>Days late: {request.daysLate}</small>}
        </div>
      )}
    </div>
  );
}
```

---

## Contact & Support

If you encounter any issues during implementation:
1. Check the console for error messages
2. Verify API endpoints are responding correctly
3. Ensure Firebase collections have the new fields
4. Test with different user roles

Remember to rebuild the backend after making changes:
```bash
cd backend
./mvnw clean install
./mvnw spring-boot:run
```

Good luck with the implementation! 🚀
