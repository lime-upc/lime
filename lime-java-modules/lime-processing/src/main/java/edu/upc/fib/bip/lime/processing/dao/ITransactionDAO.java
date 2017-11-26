package edu.upc.fib.bip.lime.processing.dao;

import edu.upc.fib.bip.lime.processing.model.Transaction;
import edu.upc.fib.bip.lime.processing.model.TransactionFilter;

import java.util.List;

/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 19.11.17
 */
public interface ITransactionDAO {

    /**
     * Creates new transaction in system
     * @param businessId
     * @param paymentAmount
     * @return
     */
    Transaction create(Integer businessId, Double paymentAmount);

    /**
     * Update transaction fields
     * @param transaction
     */
    void update(Transaction transaction);
    /**
     * Finds transaction by ID
     * @param transactionId
     * @return
     */
    Transaction findById(String transactionId);

    /**
     * Get list of transactions for given user
     * @param userId
     * @return
     */
    List<Transaction> getTransactionsByUser(Integer userId);
    List<Transaction> getTransactionsByUser(Integer userId, int offset, int limit);

    /**
     * Get list of transactions for given business
     * @param businessId
     * @return
     */
    List<Transaction> getTransactionsByBusiness(Integer businessId);
    List<Transaction> getTransactionsByBusiness(Integer businessId, int offset, int limit);

    List<Transaction> findTransactionsByFilter(TransactionFilter filter);
}
