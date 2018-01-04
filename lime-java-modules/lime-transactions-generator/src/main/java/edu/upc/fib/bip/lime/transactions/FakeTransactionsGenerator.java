package edu.upc.fib.bip.lime.transactions;

import edu.upc.fib.bip.lime.model.Transaction;
import edu.upc.fib.bip.lime.model.User;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.UUID;


/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 31.12.17
 */
public class FakeTransactionsGenerator extends Random {

    public static final DateTimeFormatter DTF = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private static final int TIME_WINDOW = 20;

    private final double averageCheck;
    private final long averageTimeOfDay;
    private final List<User> users;
    private String boEmail;

    private FakeTransactionsGenerator(double averageCheck, long averageTimeOfDay, List<User> users, String boEmail) {
        this.averageCheck = averageCheck;
        this.averageTimeOfDay = averageTimeOfDay;
        this.users = users;
        this.boEmail = boEmail;
    }

    public List<Transaction> generate(int size) {
        int piece = size / 100;
        // 2/3 of normal
        int sigma = 60 * piece;
        // 95% of normal
        int sigma2 = 29 * piece;
        // 99% of normal
        int sigma3 = piece;
        // 10% of all
        int rest = size - sigma - sigma2 - sigma3;

        List<Transaction> result = new ArrayList<>(size);

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        for (int i = 0; i < sigma; i++) {
            Transaction transaction = new Transaction();
            transaction.setTotal_amount(averageCheck + 0.1 * averageCheck * (nextDouble() * 2 - 1));
            transaction.setTimestamp(DTF.format(startOfDay
                .plusMinutes(averageTimeOfDay - TIME_WINDOW + nextInt(TIME_WINDOW * 2 + 1))));
            result.add(transaction);
        }

        for (int i = 0; i < sigma2; i++) {
            Transaction transaction = new Transaction();
            transaction.setTotal_amount(averageCheck + 0.2 * averageCheck * (nextDouble() * 2 - 1));
            transaction.setTimestamp(DTF.format(startOfDay
                .plusMinutes(averageTimeOfDay - TIME_WINDOW  * 2 + nextInt(TIME_WINDOW * 4 + 1))));
            result.add(transaction);
        }

        for (int i = 0; i < sigma3; i++) {
            Transaction transaction = new Transaction();
            transaction.setTotal_amount(averageCheck + 0.3 * averageCheck * (nextDouble() * 2 - 1));
            transaction.setTimestamp(DTF.format(startOfDay
                .plusMinutes(averageTimeOfDay - TIME_WINDOW * 3 + nextInt(TIME_WINDOW * 6 + 1))));
            result.add(transaction);
        }

        for (int i = 0; i < rest; i++) {
            Transaction transaction = new Transaction();
            transaction.setTotal_amount(averageCheck + 0.8 * averageCheck * (nextDouble() * 2 - 1));
            transaction.setTimestamp(DTF.format(startOfDay
                .plusMinutes(nextInt((int) ChronoUnit.MINUTES.between(startOfDay, startOfDay.plusDays(1))))));
            result.add(transaction);
        }

        for (Transaction transaction : result) {
            transaction.setBusiness_owner_id(boEmail);
            // what a shit! transaction id should be String! oh god what have I done...
            transaction.setId(UUID.randomUUID().toString().hashCode());
            transaction.setPayback_amount(transaction.getTotal_amount() / 10);
            transaction.setStatus("confirmed");
            transaction.setVirtual_money_used(1.0);
            transaction.setEmail(users.get(nextInt(users.size())).getEmail());
        }

        return result;
    }

    public static FakeTransactionsGeneratorBuilder forUsers(List<User> users) {
        return new FakeTransactionsGeneratorBuilder(users);
    }

    public static class FakeTransactionsGeneratorBuilder {

        private double averageCheck;
        private long averageTimeOfDay;
        private List<User> users;
        private int size;
        private String boEmail;

        private FakeTransactionsGeneratorBuilder(List<User> users) {
            this.users = users;
        }

        public FakeTransactionsGeneratorBuilder withAverageTime(long averageTimeOfDay) {
            this.averageTimeOfDay = averageTimeOfDay;
            return this;
        }

        public FakeTransactionsGeneratorBuilder withAverageCheck(double averageCheck) {
            this.averageCheck = averageCheck;
            return this;
        }

        public FakeTransactionsGeneratorBuilder withDataSize(int size) {
            this.size = size;
            return this;
        }

        public FakeTransactionsGeneratorBuilder withBoEmail(String email) {
            this.boEmail = email;
            return this;
        }

        public List<Transaction> generate() {
            return new FakeTransactionsGenerator(averageCheck, averageTimeOfDay, users, boEmail)
                .generate(size);
        }
    }
}
