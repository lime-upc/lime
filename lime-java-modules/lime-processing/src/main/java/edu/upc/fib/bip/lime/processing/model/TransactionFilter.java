package edu.upc.fib.bip.lime.processing.model;

import lombok.*;

import java.time.LocalDateTime;

/**
 * @author Maksim Samoylov <samoylov@loyaltyplant.com>
 * @since 25.11.17
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionFilter {
    private Integer businessId;
    private Integer userId;
    private LocalDateTime from;
    private LocalDateTime to;
}
