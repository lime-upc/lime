package edu.upc.fib.bip.lime.analytics.app.repository;

import edu.upc.fib.bip.lime.transactions.Transaction;

import java.util.List;

/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 27.12.17
 */
public interface TransactionRepository {

    List<Transaction> findByBoEmail(String boEmail);
}
