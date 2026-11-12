package com.verse.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutResponseDTO {
    private String orderId;
    private String clientSecret; // Stripe PaymentIntent secret format (pi_test_xxx_secret_xxx)
    private BigDecimal totalAmount;       // Final amount after discount
    private BigDecimal originalAmount;    // Pre-discount subtotal
    private String currency;
    private String paymentStatus;
    private String message;
    /** 0 for FREE users, 10 for LITE, 20 for PRO */
    private int discountPercent;
    /** Monetary saving applied (originalAmount - totalAmount) */
    private BigDecimal discountApplied;
}

