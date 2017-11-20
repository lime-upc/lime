package edu.upc.fib.bip.lime.processing.dao;

import edu.upc.fib.bip.lime.processing.model.Transaction;
import edu.upc.fib.bip.lime.processing.model.TransactionStatus;
import edu.upc.fib.bip.lime.processing.model.TransactionType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 19.11.17
 */
@Repository
public class TransactionDAOImpl implements ITransactionDAO {

    private static final RowMapper<Transaction> ROW_MAPPER = (resultSet, i) -> {
        Transaction transaction = new Transaction(resultSet.getString("TransactionID"));
        transaction.setType(TransactionType.fromDbValue(resultSet.getInt("Type")));
        transaction.setStatus(TransactionStatus.fromDbValue(resultSet.getInt("Status")));
        transaction.setUserId(resultSet.getInt("UserID"));
        transaction.setBusinessId(resultSet.getInt("BusinessID"));
        transaction.setPaymentAmount(resultSet.getDouble("PaymentAmount"));
        transaction.setPaybackAmount(resultSet.getDouble("Payback"));
        return transaction;
    };

    @Autowired
    private JdbcTemplate sql;

    @Override
    public Transaction create(Integer businessId, Double paymentAmount) {
        Transaction transaction = new Transaction();
        transaction.setBusinessId(businessId);
        transaction.setPaymentAmount(paymentAmount);
        transaction.setStatus(TransactionStatus.NEW);
        sql.update("INSERT INTO Transactions(TransactionID, BusinessID, PaymentAmount, Status) VALUES (?, ?, ?, ?)",
            transaction.getTransactionId(),
            transaction.getBusinessId(),
            transaction.getPaymentAmount(),
            transaction.getStatus().getDbId());
        return transaction;
    }

    @Override
    public void update(Transaction transaction) {
        sql.update("UPDATE Transactions SET UserID = ?, Type = ?, Status = ?, Payback = ? WHERE TransactionID = ?",
            transaction.getUserId(),
            transaction.getType().getDbId(),
            transaction.getStatus().getDbId(),
            transaction.getPaybackAmount(),
            transaction.getTransactionId());
    }

    @Override
    public Transaction findById(String transactionId) {
        List<Transaction> transaction =
            sql.query("SELECT * FROM Transactions WHERE TransactionID = ?", ROW_MAPPER, transactionId);
        if (transaction.isEmpty()) {
            return null;
        }
        return transaction.get(0);
    }

    @Override
    public List<Transaction> getTransactionsByUser(Integer userId) {
        return getTransactionsByUser(userId, 0, Integer.MAX_VALUE);
    }

    @Override
    public List<Transaction> getTransactionsByUser(Integer userId, int offset, int limit) {
        return sql.query("SELECT * FROM Transactions WHERE userId = ? LIMIT ?, ?", ROW_MAPPER,
            userId, offset, limit);
    }

    @Override
    public List<Transaction> getTransactionsByBusiness(Integer businessId) {
        return getTransactionsByBusiness(businessId, 0, Integer.MAX_VALUE);
    }

    @Override
    public List<Transaction> getTransactionsByBusiness(Integer businessId, int offset, int limit) {
        return sql.query("SELECT * FROM Transactions WHERE businessId = ? LIMIT ?, ?", ROW_MAPPER,
            businessId, offset, limit);
    }
}
