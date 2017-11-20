package edu.upc.fib.bip.lime.processing.utils;

import java.util.UUID;

/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 19.11.17
 */
public class TransactionIdGenerator {

    public static String get() {
        return UUID.randomUUID().toString();
    }
}
