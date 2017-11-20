package edu.upc.fib.bip.lime.processing.service;

import edu.upc.fib.bip.lime.processing.model.Transaction;
import edu.upc.fib.bip.lime.processing.web.protocol.*;
import org.springframework.transaction.annotation.Transactional;

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
    CreateTransactionResponse createTransaction(int businessId, Double paymentAmount);

    /**
     * This method should be called when QR code is scanned
     * from Mobile App
     * @param transactionId
     * @param userId
     * @return
     */
    ScanQrCodeResponse scanQrCode(String transactionId, int userId);

    /**
     * This method should be called when user tries to pay
     * with Virtual Money
     * @param transactionId
     * @return
     */
    UserConfirmsResponse userConfirms(String transactionId, boolean confirm);

    /**
     * This method should be called when user pays with Real Money
     * @param transactionId
     * @return
     */
    GetPaybackResponse getPayback(String transactionId);

    /**
     * This method is called when Business owner confirms
     * transaction on confirmation page
     * @param transactionId
     * @param approved
     * @return
     */
    BusinessConfirmsResponse confirmTransaction(String transactionId, boolean approved);

    /**
     * This method may be called at any time to get actual transaction info
     * @param transactionId
     * @return
     */
    GetTransactionInfoResponse getTransactionInfo(String transactionId);
}
