package edu.upc.fib.bip.lime.processing.model;

import com.fasterxml.jackson.annotation.JsonValue;

/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 19.11.17
 */
public enum TransactionType {
    NONE(0),
    VIRTUAL_MONEY(1),
    REAL_MONEY(2);

    private int dbId;

    TransactionType(int dbId) {
        this.dbId = dbId;
    }

    public int getDbId() {
        return dbId;
    }

    @JsonValue
    public String stringValue() {
        return name().toLowerCase();
    }

    public static TransactionType fromDbValue(int dbId) {
        for (TransactionType transactionType : values()) {
            if (transactionType.dbId == dbId) {
                return transactionType;
            }
        }
        return null;
    }
}
