package com.verse.backend.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubscribeRequestDTO {
    /** LITE or PRO */
    private String tier;
    /** Simulated Stripe payment method token from the frontend form */
    private String paymentMethodId;
}
