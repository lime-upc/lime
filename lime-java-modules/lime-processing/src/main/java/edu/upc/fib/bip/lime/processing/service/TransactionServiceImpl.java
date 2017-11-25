package edu.upc.fib.bip.lime.processing.service;

import edu.upc.fib.bip.lime.processing.dao.ITransactionDAO;
import edu.upc.fib.bip.lime.processing.dao.IUserBalanceDAO;
import edu.upc.fib.bip.lime.processing.model.Transaction;
import edu.upc.fib.bip.lime.processing.model.TransactionStatus;
import edu.upc.fib.bip.lime.processing.model.TransactionType;
import edu.upc.fib.bip.lime.processing.model.UserBalance;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.time.LocalDateTime;
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
    public String createTransaction(int businessId, Double paymentAmount) {
        Transaction transaction = transactionDAO.create(businessId, paymentAmount);
        eventPublisher.publishEvent(new TransactionEvent(transaction));
        return transaction.getTransactionId();
    }

    @Override
    @Transactional(rollbackFor = IllegalStateException.class)
    public Transaction userConfirms(String transactionId, Integer userId, boolean confirmed) {
        Transaction transaction = transactionDAO.findById(transactionId);
        eventPublisher.publishEvent(new TransactionEvent(transaction));
        transaction.setStatus(TransactionStatus.PROCESSING);
        transaction.setType(TransactionType.VIRTUAL_MONEY);
        transaction.setUserId(userId);

        if (confirmed) {
            createUserBalanceIfNeeded(userId);
            userBalanceDAO.substractPointsFromUserBalance(transaction.getUserId(), transaction.getPaymentAmount());
            transaction.setStatus(TransactionStatus.COMPLETED);
        } else {
            transaction.setStatus(TransactionStatus.DISCARDED);
        }
        transaction.setFinishedAt(LocalDateTime.now());
        transactionDAO.update(transaction);
        return transaction;
    }

    @Override
    @Transactional
    public Transaction getPayback(String transactionId, Integer userId) {
        Transaction transaction = transactionDAO.findById(transactionId);
        eventPublisher.publishEvent(new TransactionEvent(transaction));
        transaction.setType(TransactionType.REAL_MONEY);
        transaction.setStatus(TransactionStatus.PROCESSING);
        transaction.setPaybackAmount(paybackService.computePaybackFor(transaction));
        transaction.setUserId(userId);
        transactionDAO.update(transaction);
        return transaction;
    }

    @Override
    @Transactional
    public Transaction businessConfirms(String transactionId, boolean confirmed) {
        Transaction transaction = transactionDAO.findById(transactionId);
        eventPublisher.publishEvent(new TransactionEvent(transaction));
        if (confirmed) {
            createUserBalanceIfNeeded(transaction.getUserId());
            userBalanceDAO.addPointsToUserBalance(transaction.getUserId(), transaction.getPaybackAmount());
            transaction.setStatus(TransactionStatus.COMPLETED);
        } else {
            transaction.setStatus(TransactionStatus.DISCARDED);
        }
        transaction.setFinishedAt(LocalDateTime.now());
        transactionDAO.update(transaction);
        return transaction;
    }

    @Override
    public Optional<Transaction> getTransactionInfo(String transactionId) {
        return Optional.ofNullable(transactionDAO.findById(transactionId));
    }

    private void createUserBalanceIfNeeded(int userId) {
        if (!userBalanceDAO.findByUser(userId).isPresent()) {
            userBalanceDAO.createUserBalance(userId);
        }
    }

    @TransactionalEventListener(fallbackExecution = true, phase = TransactionPhase.AFTER_ROLLBACK)
    public void rollbackTransaction(TransactionEvent transactionEvent) {
        Transaction transaction = transactionEvent.getTransaction();
        transaction.setStatus(TransactionStatus.FAILED);
        transaction.setFinishedAt(LocalDateTime.now());
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

    @Getter
    @Setter
    @AllArgsConstructor
    public static class TransactionEvent {
        private Transaction transaction;
    }
}
