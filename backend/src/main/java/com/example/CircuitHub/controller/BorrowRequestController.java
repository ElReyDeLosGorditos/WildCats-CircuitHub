package com.example.CircuitHub.controller;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

import com.example.CircuitHub.security.RoleAuthorization;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
import com.example.CircuitHub.service.ItemAvailabilityService;

@RestController
@RequestMapping("/api/requests")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"}, allowCredentials = "true")
public class BorrowRequestController {

    private final BorrowRequestService borrowRequestService;
    private final ItemAvailabilityService availabilityService;

    public BorrowRequestController(BorrowRequestService borrowRequestService, ItemAvailabilityService availabilityService) {
        this.borrowRequestService = borrowRequestService;
        this.availabilityService = availabilityService;
    }

    // Get availability calendar for an item over a date range
    @RoleAuthorization.AuthenticatedOnly
    @GetMapping("/availability-calendar")
    public ResponseEntity<?> getAvailabilityCalendar(
            @RequestParam String itemId,
            @RequestParam String startDate,
            @RequestParam String endDate) throws ExecutionException, InterruptedException {
        try {
            Map<String, Object> calendar = availabilityService.getAvailabilityCalendar(itemId, startDate, endDate);
            return ResponseEntity.ok(calendar);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Error fetching availability calendar: " + e.getMessage()
            ));
        }
    }

    // Check item availability (doesn't create a request, just validates)
    @RoleAuthorization.AuthenticatedOnly
    @PostMapping("/check-availability")
    public ResponseEntity<?> checkAvailability(@RequestBody Map<String, Object> requestData) throws ExecutionException, InterruptedException {
        try {
            String itemId = (String) requestData.get("itemId");
            Integer requestedQuantity = requestData.get("requestedQuantity") != null
                ? ((Number) requestData.get("requestedQuantity")).intValue()
                : 1;
            String startDate = (String) requestData.get("startDate");
            String endDate = (String) requestData.get("endDate");

            ItemAvailabilityService.AvailabilityResult result = availabilityService.checkAvailability(
                itemId, requestedQuantity, startDate, endDate
            );

            return ResponseEntity.ok(result.toMap());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "available", false,
                "message", "Error checking availability: " + e.getMessage()
            ));
        }
    }

    // Students can create requests
    @RoleAuthorization.AuthenticatedOnly
    @PostMapping
    public ResponseEntity<?> createRequest(@RequestBody BorrowRequest request) throws ExecutionException, InterruptedException {
        try {
            // Verify the user is creating a request for themselves
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String currentUserId = auth.getName();

            if (!currentUserId.equals(request.getBorrowerId())) {
                return ResponseEntity.status(403).body(Map.of("error", "You can only create requests for yourself"));
            }

            BorrowRequest createdRequest = borrowRequestService.createRequest(request);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Borrow request submitted successfully and pending teacher approval",
                "request", createdRequest
            ));
        } catch (IllegalArgumentException e) {
            // Handle validation errors with 400 Bad Request
            System.err.println("❌ Validation error: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage(),
                "success", false
            ));
        } catch (RuntimeException e) {
            // Handle business logic errors with 400 Bad Request
            System.err.println("❌ Business logic error: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage(),
                "success", false
            ));
        } catch (Exception e) {
            // Handle unexpected errors with 500 Internal Server Error
            System.err.println("❌ Unexpected error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "An unexpected error occurred. Please try again.",
                "details", e.getMessage(),
                "success", false
            ));
        }
    }

    // Staff can view all requests, students see only their own
    @RoleAuthorization.AuthenticatedOnly
    @GetMapping
    public ResponseEntity<?> getAllRequests(@RequestParam(required = false) String status) throws ExecutionException, InterruptedException {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = auth.getName();
        boolean isStaff = auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") ||
                          a.getAuthority().equals("ROLE_TEACHER") ||
                          a.getAuthority().equals("ROLE_LAB_ASSISTANT"));

        List<BorrowRequest> requests;

        if (isStaff) {
            if (status != null && !status.equalsIgnoreCase("All")) {
                requests = borrowRequestService.getRequestsByStatus(status);
            } else {
                requests = borrowRequestService.getAllRequests();
            }
        } else {
            // Students see only their own requests
            requests = borrowRequestService.getRequestsByBorrowerId(currentUserId);
        }

        return ResponseEntity.ok(requests);
    }

    // Teachers can view pending teacher approvals
    @RoleAuthorization.AdminOrTeacher
    @GetMapping("/pending-teacher")
    public ResponseEntity<?> getPendingTeacherApproval() throws ExecutionException, InterruptedException {
        List<BorrowRequest> requests = borrowRequestService.getPendingTeacherApproval();
        return ResponseEntity.ok(requests);
    }

    // Lab assistants can view pending lab approvals
    @RoleAuthorization.AdminOrLabAssistant
    @GetMapping("/pending-lab")
    public ResponseEntity<?> getPendingLabApproval() throws ExecutionException, InterruptedException {
        List<BorrowRequest> requests = borrowRequestService.getPendingLabApproval();
        return ResponseEntity.ok(requests);
    }

    @RoleAuthorization.AuthenticatedOnly
    @GetMapping("/{id}")
    public ResponseEntity<?> getRequestById(@PathVariable String id) throws ExecutionException, InterruptedException {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = auth.getName();
        boolean isStaff = auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") ||
                          a.getAuthority().equals("ROLE_TEACHER") ||
                          a.getAuthority().equals("ROLE_LAB_ASSISTANT"));

        BorrowRequest request = borrowRequestService.getRequestById(id);

        if (request == null) {
            return ResponseEntity.notFound().build();
        }

        // Users can only see their own requests unless they're staff
        if (!isStaff && !currentUserId.equals(request.getBorrowerId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        }

        return ResponseEntity.ok(request);
    }

    @RoleAuthorization.AuthenticatedOnly
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserRequests(@PathVariable String userId) throws ExecutionException, InterruptedException {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = auth.getName();
        boolean isStaff = auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") ||
                          a.getAuthority().equals("ROLE_TEACHER") ||
                          a.getAuthority().equals("ROLE_LAB_ASSISTANT"));

        // Users can only view their own requests unless they're staff
        if (!isStaff && !currentUserId.equals(userId)) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        }

        List<BorrowRequest> userRequests = borrowRequestService.getRequestsByBorrowerId(userId);
        return ResponseEntity.ok(userRequests);
    }

    @RoleAuthorization.AuthenticatedOnly
    @GetMapping("/user/{userId}/history")
    public ResponseEntity<?> getUserBorrowHistory(@PathVariable String userId) throws ExecutionException, InterruptedException {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = auth.getName();
        boolean isStaff = auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") ||
                          a.getAuthority().equals("ROLE_TEACHER") ||
                          a.getAuthority().equals("ROLE_LAB_ASSISTANT"));

        if (!isStaff && !currentUserId.equals(userId)) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        }

        Map<String, Object> history = borrowRequestService.getUserBorrowHistory(userId);
        return ResponseEntity.ok(history);
    }

    // Only teachers can approve at teacher level
    @RoleAuthorization.AdminOrTeacher
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

    // Only lab assistants can approve at lab level
    @RoleAuthorization.AdminOrLabAssistant
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

    // Staff can update request status
    @RoleAuthorization.StaffOnly
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

    // Staff or request owner can delete
    @RoleAuthorization.AuthenticatedOnly
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRequest(@PathVariable String id) throws ExecutionException, InterruptedException {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = auth.getName();
        boolean isStaff = auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") ||
                          a.getAuthority().equals("ROLE_TEACHER") ||
                          a.getAuthority().equals("ROLE_LAB_ASSISTANT"));

        BorrowRequest request = borrowRequestService.getRequestById(id);
        if (request != null && !isStaff && !currentUserId.equals(request.getBorrowerId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        }

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
