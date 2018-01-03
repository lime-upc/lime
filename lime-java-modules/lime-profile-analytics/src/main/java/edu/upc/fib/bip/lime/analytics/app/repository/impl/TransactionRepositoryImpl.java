package edu.upc.fib.bip.lime.analytics.app.repository.impl;

import com.mongodb.client.MongoCollection;
import edu.upc.fib.bip.lime.analytics.app.repository.TransactionRepository;
import edu.upc.fib.bip.lime.transactions.Transaction;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import static com.mongodb.client.model.Filters.eq;

/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 27.12.17
 */
public class TransactionRepositoryImpl extends MongoRepository implements TransactionRepository {

    private final MongoCollection<Transaction> transactions;

    public TransactionRepositoryImpl(String dbUrl,
                                     String dbName,
                                     String transactionsCollectionName) {
        super(dbUrl, dbName);
        this.transactions =
            database.getCollection(transactionsCollectionName, Transaction.class);
    }

    @Override
    public List<Transaction> findByBoEmail(String boEmail) {
        return StreamSupport.stream(transactions.find(eq("bo_email", boEmail)).spliterator(), false)
            .collect(Collectors.toList());
    }
}
