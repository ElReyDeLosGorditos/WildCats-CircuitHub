package com.example.CircuitHub.service;

import com.example.CircuitHub.model.BorrowRequest;
import com.example.CircuitHub.model.Item;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.concurrent.ExecutionException;

/**
 * Service to validate item availability based on:
 * - Current item quantity
 * - Overlapping booking schedules
 * - Requested quantity vs available quantity
 * 
 * FIXED: Now properly handles multi-item requests and Pending-Teacher status
 */
@Service
public class ItemAvailabilityService {

    private final Firestore firestore;

    public ItemAvailabilityService() {
        this.firestore = FirestoreClient.getFirestore();
    }

    /**
     * Get availability calendar for an item over a date range
     * Returns a map of dates to available quantities
     */
    public Map<String, Object> getAvailabilityCalendar(
            String itemId,
            String startDateStr,
            String endDateStr) throws ExecutionException, InterruptedException {

        Map<String, Object> result = new HashMap<>();
        
        if (itemId == null || itemId.isEmpty()) {
            result.put("error", "Item ID is required");
            return result;
        }

        // Get item details
        Item item = getItem(itemId);
        if (item == null) {
            result.put("error", "Item not found");
            return result;
        }

        int totalQuantity = item.getQuantity();
        result.put("itemId", itemId);
        result.put("itemName", item.getName());
        result.put("totalQuantity", totalQuantity);

        // Parse date range
        LocalDate startDate;
        LocalDate endDate;
        try {
            startDate = LocalDate.parse(startDateStr);
            endDate = LocalDate.parse(endDateStr);
        } catch (DateTimeParseException e) {
            result.put("error", "Invalid date format. Expected YYYY-MM-DD");
            return result;
        }

        // Get all active bookings for this item
        List<BorrowRequest> activeBookings = getActiveBookingsForItem(itemId);

        // Calculate availability for each date
        Map<String, Integer> dateAvailability = new HashMap<>();
        LocalDate currentDate = startDate;
        
        while (!currentDate.isAfter(endDate)) {
            int bookedQuantity = calculateBookedQuantityForDate(activeBookings, currentDate, itemId);
            int availableQuantity = totalQuantity - bookedQuantity;
            dateAvailability.put(currentDate.toString(), availableQuantity);
            currentDate = currentDate.plusDays(1);
        }

        result.put("dateAvailability", dateAvailability);
        return result;
    }

    /**
     * Calculate how many items are booked on a specific date
     * ✅ FIXED: Now checks items array for multi-item requests
     */
    private int calculateBookedQuantityForDate(List<BorrowRequest> bookings, LocalDate date, String itemId) {
        int totalBooked = 0;
        
        for (BorrowRequest booking : bookings) {
            try {
                LocalDate bookingStart = parseDate(booking.getStartDate());
                LocalDate bookingEnd = parseDate(booking.getEndDate());
                
                // Check if date falls within booking period (inclusive)
                if (!date.isBefore(bookingStart) && !date.isAfter(bookingEnd)) {
                    // ✅ Check both legacy itemId and items array
                    int quantity = getRequestedQuantityForItem(booking, itemId);
                    totalBooked += quantity;
                }
            } catch (DateTimeParseException e) {
                System.err.println("Failed to parse dates for booking " + booking.getId());
            }
        }
        
        return totalBooked;
    }

    /**
     * ✅ NEW: Get requested quantity for a specific item from a request
     * Handles both legacy single-item and new multi-item requests
     */
    private int getRequestedQuantityForItem(BorrowRequest request, String itemId) {
        // Check items array first (multi-item requests)
        if (request.getItems() != null && !request.getItems().isEmpty()) {
            for (Map<String, String> item : request.getItems()) {
                String reqItemId = item.get("id");
                if (itemId.equals(reqItemId)) {
                    try {
                        Object qtyObj = item.get("quantity");
                        if (qtyObj instanceof String) {
                            return Integer.parseInt((String) qtyObj);
                        } else if (qtyObj instanceof Number) {
                            return ((Number) qtyObj).intValue();
                        }
                    } catch (Exception e) {
                        return 1; // Default
                    }
                    return 1; // Default if no quantity specified
                }
            }
            return 0; // Item not in this request
        }
        
        // Legacy single-item request
        if (itemId.equals(request.getItemId())) {
            Integer quantity = request.getRequestedQuantity();
            return (quantity != null && quantity > 0) ? quantity : 1;
        }
        
        return 0;
    }

    /**
     * Get all active bookings (Pending-Teacher, Teacher-Approved, Approved) for an item
     * ✅ FIXED: Now includes "Pending-Teacher" status and checks items array
     */
    private List<BorrowRequest> getActiveBookingsForItem(String itemId) throws ExecutionException, InterruptedException {
        // ✅ FIXED: Include all pending statuses
        List<String> activeStatuses = Arrays.asList("Pending", "Pending-Teacher", "Teacher-Approved", "Approved");
        List<BorrowRequest> activeBookings = new ArrayList<>();

        // Get ALL borrow requests (we'll filter by item ourselves)
        ApiFuture<QuerySnapshot> future = firestore.collection("borrowRequests").get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();

        for (QueryDocumentSnapshot doc : documents) {
            BorrowRequest booking = doc.toObject(BorrowRequest.class);
            
            // Only consider active statuses
            if (!activeStatuses.contains(booking.getStatus())) {
                continue;
            }

            // ✅ FIXED: Check if this request contains the item (either in itemId or items array)
            if (requestContainsItem(booking, itemId)) {
                activeBookings.add(booking);
            }
        }

        return activeBookings;
    }

    /**
     * ✅ NEW: Check if a request contains a specific item
     * Handles both legacy single-item and new multi-item requests
     */
    private boolean requestContainsItem(BorrowRequest request, String itemId) {
        // Check items array first (multi-item requests)
        if (request.getItems() != null && !request.getItems().isEmpty()) {
            for (Map<String, String> item : request.getItems()) {
                if (itemId.equals(item.get("id"))) {
                    return true;
                }
            }
        }
        
        // Check legacy itemId field
        if (itemId.equals(request.getItemId())) {
            return true;
        }
        
        return false;
    }

    /**
     * Main validation method - checks if the requested booking can be fulfilled
     * ✅ FIXED: Now properly handles multi-item requests and all pending statuses
     * 
     * @param itemId The item being requested
     * @param requestedQuantity How many items are requested
     * @param startDate When the borrowing starts
     * @param endDate When the borrowing ends
     * @param excludeRequestId Optional - exclude a specific request ID (for updates)
     * @return AvailabilityResult containing validation status and details
     */
    public AvailabilityResult checkAvailability(
            String itemId,
            Integer requestedQuantity,
            String startDate,
            String endDate,
            String excludeRequestId) throws ExecutionException, InterruptedException {

        // Validate inputs
        if (itemId == null || itemId.isEmpty()) {
            return new AvailabilityResult(false, "Item ID is required", 0, new ArrayList<>());
        }

        if (requestedQuantity == null || requestedQuantity <= 0) {
            return new AvailabilityResult(false, "Requested quantity must be at least 1", 0, new ArrayList<>());
        }

        if (startDate == null || endDate == null) {
            return new AvailabilityResult(false, "Start date and end date are required", 0, new ArrayList<>());
        }

        // Parse dates
        LocalDateTime requestStart;
        LocalDateTime requestEnd;
        try {
            requestStart = parseDateTime(startDate);
            requestEnd = parseDateTime(endDate);
        } catch (DateTimeParseException e) {
            return new AvailabilityResult(false, "Invalid date format. Expected ISO format.", 0, new ArrayList<>());
        }

        // Validate date logic
        if (requestEnd.isBefore(requestStart)) {
            return new AvailabilityResult(false, "End date must be after start date", 0, new ArrayList<>());
        }

        // Get item details
        Item item = getItem(itemId);
        if (item == null) {
            return new AvailabilityResult(false, "Item not found", 0, new ArrayList<>());
        }

        int totalItemQuantity = item.getQuantity();
        if (totalItemQuantity < requestedQuantity) {
            return new AvailabilityResult(
                false,
                String.format("Insufficient total quantity. Requested: %d, Total available: %d",
                    requestedQuantity, totalItemQuantity),
                totalItemQuantity,
                new ArrayList<>()
            );
        }

        // Get all overlapping bookings
        List<BorrowRequest> overlappingBookings = getOverlappingBookings(
            itemId, requestStart, requestEnd, excludeRequestId
        );

        System.out.println("🔍 Checking availability for item " + itemId + ": Found " + overlappingBookings.size() + " overlapping bookings");

        // Calculate how many items are already booked during this period
        int maxBookedDuringPeriod = calculateMaxBookedQuantity(overlappingBookings, itemId);
        
        // Available quantity is total minus the maximum booked
        int availableQuantity = totalItemQuantity - maxBookedDuringPeriod;

        System.out.println("📊 Availability calculation: Total=" + totalItemQuantity + 
                         ", Booked=" + maxBookedDuringPeriod + 
                         ", Available=" + availableQuantity + 
                         ", Requested=" + requestedQuantity);

        if (availableQuantity < requestedQuantity) {
            String message = String.format(
                "Insufficient available quantity during the requested period. " +
                "Requested: %d, Available: %d, Already booked: %d (from %d conflicting bookings)",
                requestedQuantity, availableQuantity, maxBookedDuringPeriod, overlappingBookings.size()
            );
            System.err.println("❌ " + message);
            return new AvailabilityResult(false, message, availableQuantity, overlappingBookings);
        }

        // Success!
        String message = String.format(
            "Item is available. Requested: %d, Available: %d, Total: %d",
            requestedQuantity, availableQuantity, totalItemQuantity
        );
        System.out.println("✅ " + message);
        return new AvailabilityResult(true, message, availableQuantity, overlappingBookings);
    }

    /**
     * Overloaded method without excludeRequestId (for new bookings)
     */
    public AvailabilityResult checkAvailability(
            String itemId,
            Integer requestedQuantity,
            String startDate,
            String endDate) throws ExecutionException, InterruptedException {
        return checkAvailability(itemId, requestedQuantity, startDate, endDate, null);
    }

    /**
     * Get overlapping bookings for an item within a time range
     * ✅ FIXED: Now checks items array and includes all pending statuses
     */
    private List<BorrowRequest> getOverlappingBookings(
            String itemId,
            LocalDateTime requestStart,
            LocalDateTime requestEnd,
            String excludeRequestId) throws ExecutionException, InterruptedException {

        List<BorrowRequest> overlapping = new ArrayList<>();

        // ✅ FIXED: Include all active statuses including Pending-Teacher
        List<String> activeStatuses = Arrays.asList("Pending", "Pending-Teacher", "Teacher-Approved", "Approved");

        // Get ALL requests (we need to check items array)
        ApiFuture<QuerySnapshot> future = firestore.collection("borrowRequests").get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();

        for (QueryDocumentSnapshot doc : documents) {
            BorrowRequest booking = doc.toObject(BorrowRequest.class);

            // Skip excluded request (for update scenarios)
            if (excludeRequestId != null && excludeRequestId.equals(booking.getId())) {
                continue;
            }

            // Only consider active bookings
            if (!activeStatuses.contains(booking.getStatus())) {
                continue;
            }

            // ✅ FIXED: Check if this request contains the item
            if (!requestContainsItem(booking, itemId)) {
                continue;
            }

            // Parse booking dates
            try {
                LocalDateTime bookingStart = parseDateTime(booking.getStartDate());
                LocalDateTime bookingEnd = parseDateTime(booking.getEndDate());

                // ✅ CRITICAL FIX: Check for TIME overlap, not just date overlap
                // Overlap occurs if: requestStart < bookingEnd AND requestEnd > bookingStart
                if (requestStart.isBefore(bookingEnd) && requestEnd.isAfter(bookingStart)) {
                    System.out.println("⚠️ Found overlapping booking: " + booking.getId() + 
                                     " (" + booking.getStatus() + ") - " + 
                                     bookingStart + " to " + bookingEnd);
                    overlapping.add(booking);
                }
            } catch (DateTimeParseException e) {
                System.err.println("Failed to parse dates for booking " + booking.getId() + ": " + e.getMessage());
            }
        }

        return overlapping;
    }

    /**
     * Calculate the maximum quantity booked at any point during overlapping bookings
     * ✅ FIXED: Now properly sums quantities for the specific item
     */
    private int calculateMaxBookedQuantity(List<BorrowRequest> overlappingBookings, String itemId) {
        if (overlappingBookings.isEmpty()) {
            return 0;
        }

        // Sum all overlapping quantities for this specific item
        int totalBooked = 0;
        for (BorrowRequest booking : overlappingBookings) {
            int quantity = getRequestedQuantityForItem(booking, itemId);
            totalBooked += quantity;
            System.out.println("  📦 Request " + booking.getId() + " books " + quantity + " of item " + itemId);
        }

        return totalBooked;
    }

    /**
     * Get item from Firestore
     * ✅ FIXED: Ensure ID is set
     */
    private Item getItem(String itemId) throws ExecutionException, InterruptedException {
        DocumentReference docRef = firestore.collection("items").document(itemId);
        ApiFuture<DocumentSnapshot> future = docRef.get();
        DocumentSnapshot document = future.get();

        if (document.exists()) {
            Item item = document.toObject(Item.class);
            if (item != null && (item.getId() == null || item.getId().isEmpty())) {
                item.setId(document.getId());
            }
            return item;
        }
        return null;
    }

    /**
     * Parse date string to LocalDate (for date-only operations)
     */
    private LocalDate parseDate(String dateStr) {
        if (dateStr == null) {
            throw new DateTimeParseException("Date string is null", "", 0);
        }

        try {
            // Try parsing as LocalDateTime first
            return LocalDateTime.parse(dateStr, DateTimeFormatter.ISO_DATE_TIME).toLocalDate();
        } catch (DateTimeParseException e) {
            try {
                // Try parsing as LocalDate
                return LocalDate.parse(dateStr);
            } catch (DateTimeParseException e2) {
                throw new DateTimeParseException("Unable to parse date: " + dateStr, dateStr, 0);
            }
        }
    }

    /**
     * Parse date string to LocalDateTime
     * Supports multiple formats
     */
    private LocalDateTime parseDateTime(String dateStr) {
        if (dateStr == null) {
            throw new DateTimeParseException("Date string is null", "", 0);
        }

        // Try ISO 8601 format first
        try {
            return LocalDateTime.parse(dateStr, DateTimeFormatter.ISO_DATE_TIME);
        } catch (DateTimeParseException e) {
            // Try other common formats
            try {
                return LocalDateTime.parse(dateStr, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            } catch (DateTimeParseException e2) {
                // If just date, assume start of day
                try {
                    return LocalDateTime.parse(dateStr + "T00:00:00");
                } catch (DateTimeParseException e3) {
                    throw new DateTimeParseException("Unable to parse date: " + dateStr, dateStr, 0);
                }
            }
        }
    }

    /**
     * Result class containing availability check results
     */
    public static class AvailabilityResult {
        private final boolean available;
        private final String message;
        private final int availableQuantity;
        private final List<BorrowRequest> conflictingBookings;

        public AvailabilityResult(boolean available, String message, int availableQuantity, List<BorrowRequest> conflictingBookings) {
            this.available = available;
            this.message = message;
            this.availableQuantity = availableQuantity;
            this.conflictingBookings = conflictingBookings;
        }

        public boolean isAvailable() {
            return available;
        }

        public String getMessage() {
            return message;
        }

        public int getAvailableQuantity() {
            return availableQuantity;
        }

        public List<BorrowRequest> getConflictingBookings() {
            return conflictingBookings;
        }

        public Map<String, Object> toMap() {
            Map<String, Object> map = new HashMap<>();
            map.put("available", available);
            map.put("message", message);
            map.put("availableQuantity", availableQuantity);
            map.put("conflictingBookingsCount", conflictingBookings.size());
            return map;
        }
    }
}
