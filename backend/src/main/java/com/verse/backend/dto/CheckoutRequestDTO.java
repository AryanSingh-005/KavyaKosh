package com.verse.backend.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class CheckoutRequestDTO {
    @NotEmpty(message = "Items list cannot be empty")
    private List<CheckoutItem> items;

    private String shippingAddress;
    private String currency = "INR";

    @Data
    public static class CheckoutItem {
        private Long itemId;
        private String name;
        private BigDecimal price;
        private Integer quantity = 1;
    }
}
