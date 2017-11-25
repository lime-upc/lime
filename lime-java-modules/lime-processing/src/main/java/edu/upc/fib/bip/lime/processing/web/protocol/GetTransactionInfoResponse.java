package edu.upc.fib.bip.lime.processing.web.protocol;

import edu.upc.fib.bip.lime.processing.model.Transaction;
import edu.upc.fib.bip.lime.processing.model.TransactionStatus;
import edu.upc.fib.bip.lime.processing.model.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 19.11.17
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GetTransactionInfoResponse {

    private Double amount;
    private Double payback;
    private TransactionStatus status;
    private TransactionType type;
    private Integer businessId;
    private Integer userId;
    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;

    public static GetTransactionInfoResponse of(Transaction transaction) {
        return builder()
            .amount(transaction.getPaymentAmount())
            .payback(transaction.getPaybackAmount())
            .businessId(transaction.getBusinessId())
            .userId(transaction.getUserId())
            .status(transaction.getStatus())
            .type(transaction.getType())
            .startedAt(transaction.getStartedAt())
            .finishedAt(transaction.getFinishedAt())
            .build();
    }
}
