package edu.upc.fib.bip.lime.processing.service;

import edu.upc.fib.bip.lime.processing.model.Transaction;
import edu.upc.fib.bip.lime.processing.model.TransactionFilter;
import edu.upc.fib.bip.lime.processing.web.protocol.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Interface for processing
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 19.11.17
 */
public interface ITransactionService {

    /**
     * This method creates new transaction;
     * should be available only from business owner page.
     * @param businessId
     * @param paymentAmount
     * @return
     */
    String createTransaction(int businessId, Double paymentAmount);

    /**
     * This method should be called when user tries to pay
     * with Virtual Money
     * @param transactionId
     * @param userId
     * @return
     */
    Transaction userConfirms(String transactionId, Integer userId, boolean confirm);

    /**
     * This method should be called when user pays with Real Money
     * @param transactionId
     * @param userId
     * @return
     */
    Transaction getPayback(String transactionId, Integer userId);

    /**
     * This method is called when Business owner confirms
     * transaction on confirmation page
     * @param transactionId
     * @param approved
     * @return
     */
    Transaction businessConfirms(String transactionId, boolean approved);

    /**
     * This method may be called at any time to get actual transaction info
     * @param transactionId
     * @return
     */
    Optional<Transaction> getTransactionInfo(String transactionId);

    /**
     * Finds all transactions by given filter
     * @param filter
     * @return
     */
    List<Transaction> findTransactionsByFilter(TransactionFilter filter);
}
