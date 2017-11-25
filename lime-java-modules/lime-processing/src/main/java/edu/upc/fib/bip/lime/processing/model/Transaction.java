package edu.upc.fib.bip.lime.processing.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import edu.upc.fib.bip.lime.processing.utils.TransactionIdGenerator;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

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
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime startedAt;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime finishedAt;

    public Transaction() {
        this(TransactionIdGenerator.get());
    }

    public Transaction(String transactionId) {
        this.transactionId = transactionId;
    }


    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        Transaction that = (Transaction) o;

        if (!transactionId.equals(that.transactionId)) return false;
        if (userId != null ? !userId.equals(that.userId) : that.userId != null) return false;
        if (!businessId.equals(that.businessId)) return false;
        if (!paymentAmount.equals(that.paymentAmount)) return false;
        if (paybackAmount != null ? !paybackAmount.equals(that.paybackAmount) : that.paybackAmount != null)
            return false;
        if (status != that.status) return false;
        if (type != that.type) return false;
        if (startedAt != null
            ? ChronoUnit.SECONDS.between(startedAt, that.startedAt) >= 1
            : that.startedAt != null) return false;
        return finishedAt != null
            ? ChronoUnit.SECONDS.between(finishedAt, that.finishedAt) < 1
            : that.finishedAt == null;
    }

    @Override
    public int hashCode() {
        int result = transactionId.hashCode();
        result = 31 * result + (userId != null ? userId.hashCode() : 0);
        result = 31 * result + businessId.hashCode();
        result = 31 * result + paymentAmount.hashCode();
        result = 31 * result + (paybackAmount != null ? paybackAmount.hashCode() : 0);
        result = 31 * result + (status != null ? status.hashCode() : 0);
        result = 31 * result + (type != null ? type.hashCode() : 0);
        result = 31 * result + (startedAt != null ? startedAt.hashCode() : 0);
        result = 31 * result + (finishedAt != null ? finishedAt.hashCode() : 0);
        return result;
    }
}
