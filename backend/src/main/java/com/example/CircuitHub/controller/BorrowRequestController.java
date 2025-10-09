package com.example.CircuitHub.controller;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.CircuitHub.model.BorrowRequest;
import com.example.CircuitHub.service.BorrowRequestService;

@RestController
@RequestMapping("/api/requests")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"}, allowCredentials = "true")
public class BorrowRequestController {

    private final BorrowRequestService borrowRequestService;

    public BorrowRequestController(BorrowRequestService borrowRequestService) {
        this.borrowRequestService = borrowRequestService;
    }

    @PostMapping
    public ResponseEntity<?> createRequest(@RequestBody BorrowRequest request) throws ExecutionException, InterruptedException {
        BorrowRequest createdRequest = borrowRequestService.createRequest(request);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Borrow request submitted successfully and pending teacher approval",
            "request", createdRequest
        ));
    }

    @GetMapping
    public ResponseEntity<?> getAllRequests(@RequestParam(required = false) String status) throws ExecutionException, InterruptedException {
        List<BorrowRequest> requests;
        
        if (status != null && !status.equalsIgnoreCase("All")) {
            requests = borrowRequestService.getRequestsByStatus(status);
        } else {
            requests = borrowRequestService.getAllRequests();
        }
        
        return ResponseEntity.ok(requests);
    }
    
    // NEW: Get requests pending teacher approval
    @GetMapping("/pending-teacher")
    public ResponseEntity<?> getPendingTeacherApproval() throws ExecutionException, InterruptedException {
        List<BorrowRequest> requests = borrowRequestService.getPendingTeacherApproval();
        return ResponseEntity.ok(requests);
    }
    
    // NEW: Get requests pending lab assistant approval
    @GetMapping("/pending-lab")
    public ResponseEntity<?> getPendingLabApproval() throws ExecutionException, InterruptedException {
        List<BorrowRequest> requests = borrowRequestService.getPendingLabApproval();
        return ResponseEntity.ok(requests);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getRequestById(@PathVariable String id) throws ExecutionException, InterruptedException {
        BorrowRequest request = borrowRequestService.getRequestById(id);
        
        if (request == null) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(request);
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserRequests(@PathVariable String userId) throws ExecutionException, InterruptedException {
        List<BorrowRequest> userRequests = borrowRequestService.getRequestsByBorrowerId(userId);
        return ResponseEntity.ok(userRequests);
    }
    
    // NEW: Get user's borrow history with late return tracking
    @GetMapping("/user/{userId}/history")
    public ResponseEntity<?> getUserBorrowHistory(@PathVariable String userId) throws ExecutionException, InterruptedException {
        Map<String, Object> history = borrowRequestService.getUserBorrowHistory(userId);
        return ResponseEntity.ok(history);
    }

    // NEW: Teacher approval endpoint
    @PutMapping("/{id}/teacher-approve")
    public ResponseEntity<?> teacherApprove(
            @PathVariable String id, 
            @RequestBody Map<String, String> approvalData) throws ExecutionException, InterruptedException {
        
        String teacherId = approvalData.get("teacherId");
        String teacherName = approvalData.get("teacherName");
        
        if (teacherId == null || teacherName == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Teacher ID and name are required"
            ));
        }
        
        try {
            BorrowRequest updatedRequest = borrowRequestService.teacherApprove(id, teacherId, teacherName);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Request approved by teacher. Awaiting lab assistant approval.",
                "request", updatedRequest
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage()
            ));
        }
    }
    
    // NEW: Lab assistant approval endpoint
    @PutMapping("/{id}/lab-approve")
    public ResponseEntity<?> labApprove(
            @PathVariable String id, 
            @RequestBody Map<String, String> approvalData) throws ExecutionException, InterruptedException {
        
        String labAssistantId = approvalData.get("labAssistantId");
        String labAssistantName = approvalData.get("labAssistantName");
        
        if (labAssistantId == null || labAssistantName == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Lab assistant ID and name are required"
            ));
        }
        
        try {
            BorrowRequest updatedRequest = borrowRequestService.labApprove(id, labAssistantId, labAssistantName);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Request fully approved. Item is now borrowed.",
                "request", updatedRequest
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage()
            ));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateRequest(@PathVariable String id, @RequestBody Map<String, String> updateData) throws ExecutionException, InterruptedException {
        String status = updateData.get("status");
        
        if (status == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Status field is required"
            ));
        }
        
        try {
            BorrowRequest updatedRequest = borrowRequestService.updateStatus(id, status);
            
            String message = "Request status updated successfully";
            if ("Returned".equals(status) && Boolean.TRUE.equals(updatedRequest.getIsLate())) {
                message = "Item returned late. Late return has been recorded.";
            }
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", message,
                "request", updatedRequest
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRequest(@PathVariable String id) throws ExecutionException, InterruptedException {
        boolean deleted = borrowRequestService.deleteRequest(id);
        
        if (deleted) {
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Request deleted successfully"
            ));
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
