package edu.upc.fib.bip.lime.analytics.app.model;

import edu.upc.fib.bip.lime.analytics.app.model.Transaction;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 24.12.17
 */
@AllArgsConstructor
@Getter
public class UserTransactionModel {
    private User user;
    private Transaction transaction;
}
