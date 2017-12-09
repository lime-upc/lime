package edu.upc.fib.bip.lime;

import com.mongodb.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.codecs.configuration.CodecRegistry;
import org.bson.codecs.pojo.PojoCodecProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static org.bson.codecs.configuration.CodecRegistries.fromProviders;
import static org.bson.codecs.configuration.CodecRegistries.fromRegistries;

/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 02.12.17
 */
public class TransactionGenerator {

    private static final Logger LOGGER = LoggerFactory.getLogger(TransactionGenerator.class);
    private static final int DEFAULT_DATA_SIZE = 2000;

    private static final String USER_EMAIL_FORMAT = "test-%d@lime.com";
    private static final String BO_EMAIL_FORMAT = "bo-%d@lime.com";
    private static final Random RANDOM = new Random();
    private static final DateTimeFormatter DTF = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    private static final LocalDate DATE = Optional.ofNullable(System.getProperty("date"))
        .map(LocalDate::parse)
        .orElse(LocalDate.now());
    private static final boolean DROP_EXISTING_DATA = Optional.ofNullable(System.getProperty("dropExisting"))
        .map(Boolean::parseBoolean)
        .orElse(true);
    private static final int SIZE = Optional.ofNullable(System.getProperty("size"))
        .map(Integer::parseInt)
        .orElse(DEFAULT_DATA_SIZE);

    public static void main(String[] args) {
        LOGGER.info("Transaction generator started");

        LOGGER.info("{} transactions will be generated", SIZE);
        LOGGER.info("Date {} will be used for data generation", DTF.format(DATE));
        LOGGER.info("All transactions will be dropped before generation - {}", DROP_EXISTING_DATA);

        CodecRegistry pojoCodecRegistry = fromRegistries(MongoClient.getDefaultCodecRegistry(),
            fromProviders(PojoCodecProvider.builder().automatic(true).build()));

        MongoClient mongoClient = new MongoClient("mongodb:27017");
        MongoDatabase database = mongoClient.getDatabase("lime")
            .withCodecRegistry(pojoCodecRegistry);

        String transactionsCollectionName = "transactions";

        MongoCollection<Transaction> transactions =
            database.getCollection(transactionsCollectionName, Transaction.class);

        if (DROP_EXISTING_DATA) {
            LOGGER.info("Any existing data in collection [{}] will be dropped", transactionsCollectionName);
            transactions.drop();
        } else {
            LOGGER.info("Any existing data in collection [{}] will be saved", transactionsCollectionName);
        }

        long beforeGenerationCount = transactions.count();

        List<Transaction> transactionList = generate(SIZE);

        LOGGER.info("Inserting {} transactions to collection [{}]", transactionList.size(), transactionsCollectionName);
        transactions.insertMany(transactionList);
        LOGGER.info("{} transactions generated, checking", SIZE);

        if (transactions.count() - beforeGenerationCount != SIZE) {
            throw new IllegalStateException("Data was not generated");
        }

        LOGGER.info("Transaction generator finished");
    }

    private static List<Transaction> generate(int size) {
        return IntStream.range(0, size)
            .mapToObj(TransactionGenerator::generateOne)
            .collect(Collectors.toList());
    }

    private static Transaction generateOne(int i) {
        return Transaction.builder()
            .id(RANDOM.nextInt())
            .email(String.format(USER_EMAIL_FORMAT, RANDOM.nextInt(2000) + 1))
            .business_owner_id(String.format(BO_EMAIL_FORMAT, RANDOM.nextInt(2000) + 1))
            .virtial_money_used(((double) RANDOM.nextInt(100)) / 10)
            .payback_amount(((double) RANDOM.nextInt(100)) / 10)
            .total_amount(((double) RANDOM.nextInt(100)) / 10)
            .timestamp(DTF.format(DATE))
            .build();
    }


}