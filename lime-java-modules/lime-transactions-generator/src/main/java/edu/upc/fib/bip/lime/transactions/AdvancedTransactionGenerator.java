package edu.upc.fib.bip.lime.transactions;

import com.mongodb.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import edu.upc.fib.bip.lime.model.Gender;
import edu.upc.fib.bip.lime.model.Transaction;
import edu.upc.fib.bip.lime.model.User;
import org.bson.codecs.configuration.CodecRegistry;
import org.bson.codecs.pojo.PojoCodecProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.bson.codecs.configuration.CodecRegistries.fromProviders;
import static org.bson.codecs.configuration.CodecRegistries.fromRegistries;

/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 04.01.18
 */
public class AdvancedTransactionGenerator {

    protected static final Logger LOGGER = LoggerFactory.getLogger(AdvancedTransactionGenerator.class);
    protected static final int DEFAULT_DATA_SIZE = 2000;

    protected static final DateTimeFormatter DTF = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    protected static final LocalDate DATE = Optional.ofNullable(System.getProperty("date"))
        .map(LocalDate::parse)
        .orElse(LocalDate.now());
    protected static final boolean DROP_EXISTING_DATA = Optional.ofNullable(System.getProperty("dropExisting"))
        .map(Boolean::parseBoolean)
        .orElse(true);
    protected static final int SIZE = Optional.ofNullable(System.getProperty("size"))
        .map(Integer::parseInt)
        .orElse(DEFAULT_DATA_SIZE);

    private static Long toTimeOfDay(String timeOfDay) {
        String[] tokens = timeOfDay.split("-");
        int hours = Integer.parseInt(tokens[0]);
        int minutes = Integer.parseInt(tokens[1]);
        return ChronoUnit.MINUTES.between(
            LocalDate.now().atStartOfDay(),
            LocalDate.now().atStartOfDay().plusHours(hours).plusMinutes(minutes));
    }

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

        String usersCollectionName = "users";
        String transactionsCollectionName = "transactions";

        MongoCollection<User> users =
            database.getCollection(usersCollectionName, User.class);
        MongoCollection<Transaction> transactions =
            database.getCollection(transactionsCollectionName, Transaction.class);

        if (DROP_EXISTING_DATA) {
            LOGGER.info("Any existing data in collections [{},{}] will be dropped",
                transactionsCollectionName, usersCollectionName);
            users.drop();
            transactions.drop();
        } else {
            LOGGER.info("Any existing data in collection [{},{}] will be saved",
                transactionsCollectionName, usersCollectionName);
        }

        long initialTransactionsCount = transactions.count();
        long initialUsersCount = users.count();

        List<User> userList = new ArrayList<>();
        List<Transaction> transactionList = new ArrayList<>();
        generateBar(userList, transactionList);
        generateCafe(userList, transactionList);
        generateRestraunt(userList, transactionList);
        generateFastfood(userList, transactionList);

        LOGGER.info("Inserting {} users to collection [{}]", userList.size(), usersCollectionName);
        users.insertMany(userList);
        LOGGER.info("{} users generated, checking", userList.size());
        if (users.count() - initialUsersCount != userList.size()) {
            throw new IllegalStateException("Users were not generated");
        }

        LOGGER.info("Inserting {} transactions to collection [{}]", transactionList.size(), transactionsCollectionName);
        transactions.insertMany(transactionList);
        LOGGER.info("{} transactions generated, checking", transactionList.size());

        if (transactions.count() - initialTransactionsCount != transactionList.size()) {
            throw new IllegalStateException("Data was not generated");
        }

        LOGGER.info("Data generator finished");
    }

    private static void generateBar(List<User> users, List<Transaction> transactions) {
        String barBusinessEmail = "bar@email";
        List<User> barUsers = FakeUsersGenerator.builder()
            .withAverageAge(null)
            .withGenderRatio(Gender.MALE, 2)
            .generate(100);
        List<Transaction> transactions1 = FakeTransactionsGenerator
            .forUsers(barUsers)
            .withAverageCheck(30)
            .withAverageTime(toTimeOfDay("21-00"))
            .withBoEmail(barBusinessEmail)
            .withDataSize(1000)
            .generate();
        users.addAll(barUsers);
        transactions.addAll(transactions1);
    }
    private static void generateCafe(List<User> users, List<Transaction> transactions) {
        String boEmail = "cafe@email";
        List<User> lunchUsers = FakeUsersGenerator.builder()
            .withAverageAge(22)
            .withGenderRatio(Gender.FEMALE, 1.2)
            .generate(100);
        List<Transaction> lunches = FakeTransactionsGenerator
            .forUsers(lunchUsers)
            .withAverageCheck(25)
            .withAverageTime(toTimeOfDay("14-30"))
            .withBoEmail(boEmail)
            .withDataSize(1000)
            .generate();

        List<User> breakfastUsers = FakeUsersGenerator.builder()
            .withAverageAge(20)
            .withGenderRatio(Gender.FEMALE, 1)
            .generate(100);
        List<Transaction> breakfasts = FakeTransactionsGenerator
            .forUsers(breakfastUsers)
            .withAverageCheck(5)
            .withAverageTime(toTimeOfDay("8-30"))
            .withBoEmail(boEmail)
            .withDataSize(1000)
            .generate();

        List<User> dinnerUsers = FakeUsersGenerator.builder()
            .withAverageAge(40)
            .withGenderRatio(Gender.FEMALE, 1)
            .generate(100);
        List<Transaction> dinners = FakeTransactionsGenerator
            .forUsers(dinnerUsers)
            .withAverageCheck(15)
            .withAverageTime(toTimeOfDay("20-30"))
            .withBoEmail(boEmail)
            .withDataSize(1000)
            .generate();

        users.addAll(lunchUsers);
        users.addAll(breakfastUsers);
        users.addAll(dinnerUsers);

        transactions.addAll(lunches);
        transactions.addAll(breakfasts);
        transactions.addAll(dinners);
    }
    private static void generateRestraunt(List<User> users, List<Transaction> transactions) {
        String boEmail = "restraunt@email";

        List<User> users1 = FakeUsersGenerator.builder()
            .withAverageAge(40)
            .withGenderRatio(Gender.MALE, 1.2)
            .generate(100);
        List<Transaction> transactions1 = FakeTransactionsGenerator
            .forUsers(users1)
            .withAverageCheck(40)
            .withAverageTime(toTimeOfDay("20-30"))
            .withBoEmail(boEmail)
            .withDataSize(1000)
            .generate();

        List<User> users2 = FakeUsersGenerator.builder()
            .withAverageAge(null)
            .withGenderRatio(Gender.FEMALE, 1)
            .generate(100);
        List<Transaction> transactions2 = FakeTransactionsGenerator
            .forUsers(users2)
            .withAverageCheck(20)
            .withAverageTime(toTimeOfDay("14-30"))
            .withBoEmail(boEmail)
            .withDataSize(1000)
            .generate();

        users.addAll(users1);
        users.addAll(users2);
        transactions.addAll(transactions1);
        transactions.addAll(transactions2);
    }
    private static void generateFastfood(List<User> users, List<Transaction> transactions) {
        String boEmail = "fastfood@email";
        List<User> users1 = FakeUsersGenerator.builder()
            .withAverageAge(24)
            .withGenderRatio(Gender.MALE, 1.2)
            .generate(100);
        List<Transaction> transactions1 = FakeTransactionsGenerator
            .forUsers(users1)
            .withAverageCheck(10)
            .withAverageTime(toTimeOfDay("16-30"))
            .withBoEmail(boEmail)
            .withDataSize(1000)
            .generate();
        users.addAll(users1);
        transactions.addAll(transactions1);
    }

}
