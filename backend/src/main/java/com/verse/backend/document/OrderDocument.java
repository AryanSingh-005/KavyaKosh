package com.verse.backend.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Document(collection = "marketplace_orders")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDocument {

    @Id
    private String id;

    @Indexed
    private String username;

    private List<OrderItem> items;
    private BigDecimal totalAmount;
    private String currency; // INR, USD

    private String stripePaymentIntentId;
    private String paymentStatus; // PENDING, COMPLETED, FAILED

    private String shippingAddress;

    @Builder.Default
    private Instant createdAt = Instant.now();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderItem {
        private Long itemId;
        private String name;
        private BigDecimal price;
        private Integer quantity;
    }
}
