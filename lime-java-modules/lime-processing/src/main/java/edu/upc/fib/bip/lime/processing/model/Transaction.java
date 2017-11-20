package edu.upc.fib.bip.lime.processing.model;

import edu.upc.fib.bip.lime.processing.utils.TransactionIdGenerator;
import lombok.*;

/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 19.11.17
 */
@Getter
@Setter
public class Transaction {

    private final String transactionId;
    private Integer userId;
    private Integer businessId;
    private Double paymentAmount;
    private Double paybackAmount;
    private TransactionStatus status;
    private TransactionType type;

    public Transaction() {
        this(TransactionIdGenerator.get());
    }

    public Transaction(String transactionId) {
        this.transactionId = transactionId;
    }
}
