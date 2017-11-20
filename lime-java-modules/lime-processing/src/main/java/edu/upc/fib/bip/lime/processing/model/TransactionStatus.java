package edu.upc.fib.bip.lime.processing.model;

import com.fasterxml.jackson.annotation.JsonValue;

/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 19.11.17
 */
public enum TransactionStatus {
    NEW(0),
    SCANNED(1),
    PROCESSING(2),
    COMPLETED(3),
    FAILED(4),
    DISCARDED(5);

    private int dbId;

    TransactionStatus(int dbId) {
        this.dbId = dbId;
    }

    public int getDbId() {
        return dbId;
    }

    @JsonValue
    public String stringValue() {
        return name().toLowerCase();
    }

    public static TransactionStatus fromDbValue(int dbId) {
        for (TransactionStatus transactionStatus : values()) {
            if (transactionStatus.dbId == dbId) {
                return transactionStatus;
            }
        }
        return null;
    }
}
