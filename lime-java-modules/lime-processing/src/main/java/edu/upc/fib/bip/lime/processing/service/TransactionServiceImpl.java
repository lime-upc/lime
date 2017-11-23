package edu.upc.fib.bip.lime.processing.service;

import edu.upc.fib.bip.lime.processing.dao.ITransactionDAO;
import edu.upc.fib.bip.lime.processing.dao.IUserBalanceDAO;
import edu.upc.fib.bip.lime.processing.model.Transaction;
import edu.upc.fib.bip.lime.processing.model.TransactionStatus;
import edu.upc.fib.bip.lime.processing.model.TransactionType;
import edu.upc.fib.bip.lime.processing.model.UserBalance;
import edu.upc.fib.bip.lime.processing.web.protocol.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 19.11.17
 */
@Service
public class TransactionServiceImpl implements ITransactionService {

    @Autowired
    private ITransactionDAO transactionDAO;

    @Autowired
    private IUserBalanceDAO userBalanceDAO;

    @Autowired
    private IPaybackService paybackService;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional
    public CreateTransactionResponse createTransaction(int businessId, Double paymentAmount) {
        Transaction transaction = transactionDAO.create(businessId, paymentAmount);
        eventPublisher.publishEvent(new TransactionEvent(transaction.getTransactionId()));
        return CreateTransactionResponse.builder()
            .transactionId(transaction.getTransactionId())
            .build();
    }

    @Override
    @Transactional
    public ScanQrCodeResponse scanQrCode(String transactionId, int userId) {
        Optional<UserBalance> userBalance = userBalanceDAO.findByUser(userId);
        if (!userBalance.isPresent()) {
            userBalanceDAO.createUserBalance(userId);
        }
        Transaction transaction = transactionDAO.findById(transactionId);
        transaction.setStatus(TransactionStatus.SCANNED);
        transaction.setUserId(userId);
        eventPublisher.publishEvent(new TransactionEvent(transactionId));
        transactionDAO.update(transaction);
        return ScanQrCodeResponse.builder()
            .build();
    }

    @Override
    @Transactional(rollbackFor = IllegalStateException.class)
    public UserConfirmsResponse userConfirms(String transactionId, boolean confirmed) {
        Transaction transaction = transactionDAO.findById(transactionId);
        eventPublisher.publishEvent(new TransactionEvent(transactionId));
        transaction.setStatus(TransactionStatus.PROCESSING);
        transaction.setType(TransactionType.VIRTUAL_MONEY);

        if (confirmed) {
            userBalanceDAO.substractPointsFromUserBalance(transaction.getUserId(), transaction.getPaymentAmount());
            transaction.setStatus(TransactionStatus.COMPLETED);
        } else {
            transaction.setStatus(TransactionStatus.DISCARDED);
        }
        transactionDAO.update(transaction);
        return UserConfirmsResponse.builder().build();
    }

    @Override
    @Transactional
    public GetPaybackResponse getPayback(String transactionId) {
        Transaction transaction = transactionDAO.findById(transactionId);
        eventPublisher.publishEvent(new TransactionEvent(transactionId));
        transaction.setType(TransactionType.REAL_MONEY);
        transaction.setStatus(TransactionStatus.PROCESSING);
        transaction.setPaybackAmount(paybackService.computePaybackFor(transaction));
        transactionDAO.update(transaction);
        return GetPaybackResponse.builder().build();
    }

    @Override
    @Transactional
    public BusinessConfirmsResponse confirmTransaction(String transactionId, boolean confirmed) {
        Transaction transaction = transactionDAO.findById(transactionId);
        eventPublisher.publishEvent(new TransactionEvent(transactionId));
        if (confirmed) {
            userBalanceDAO.addPointsToUserBalance(transaction.getUserId(), transaction.getPaybackAmount());
            transaction.setStatus(TransactionStatus.COMPLETED);
        } else {
            transaction.setStatus(TransactionStatus.DISCARDED);
        }
        transactionDAO.update(transaction);
        return BusinessConfirmsResponse.builder().build();
    }

    @Override
    public GetTransactionInfoResponse getTransactionInfo(String transactionId) {
        return GetTransactionInfoResponse.of(transactionDAO.findById(transactionId));
    }

    @TransactionalEventListener(fallbackExecution = true, phase = TransactionPhase.AFTER_ROLLBACK)
    public void rollbackTransaction(TransactionEvent transactionEvent) {
        Transaction transaction = transactionDAO.findById(transactionEvent.getTransactionId());
        transaction.setStatus(TransactionStatus.FAILED);
        transactionDAO.update(transaction);

        if (transaction.getUserId() == null) {
            return;
        }
        // we need to make sure that user current balance is unchanged
        List<Transaction> successfulTransactions = transactionDAO.getTransactionsByUser(transaction.getUserId()).stream()
            .filter(t -> t.getStatus() == TransactionStatus.COMPLETED)
            .collect(Collectors.toList());
        double allPayback = successfulTransactions.stream()
            .filter(t -> t.getType() == TransactionType.REAL_MONEY)
            .mapToDouble(Transaction::getPaybackAmount)
            .sum();
        double realPayments = successfulTransactions.stream()
            .filter(t -> t.getType() == TransactionType.VIRTUAL_MONEY)
            .mapToDouble(Transaction::getPaymentAmount)
            .sum();
        userBalanceDAO.setUserBalance(transaction.getUserId(), allPayback - realPayments);
    }

    public static class TransactionEvent {
        private String transactionId;

        public TransactionEvent(String transactionId) {
            this.transactionId = transactionId;
        }

        public String getTransactionId() {
            return transactionId;
        }
    }
}
