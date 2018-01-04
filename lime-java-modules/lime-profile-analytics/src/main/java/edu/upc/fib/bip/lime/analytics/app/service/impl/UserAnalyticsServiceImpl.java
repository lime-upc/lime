package edu.upc.fib.bip.lime.analytics.app.service.impl;

import edu.upc.fib.bip.lime.analytics.app.model.*;
import edu.upc.fib.bip.lime.analytics.app.repository.TransactionRepository;
import edu.upc.fib.bip.lime.analytics.app.repository.UserRepository;
import edu.upc.fib.bip.lime.analytics.app.service.DataAnalyticsService;
import edu.upc.fib.bip.lime.analytics.app.service.UserAnalyticsService;
import edu.upc.fib.bip.lime.analytics.app.model.Transaction;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoField;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import static java.lang.Math.*;

/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 24.12.17
 */
@Service
public class UserAnalyticsServiceImpl implements UserAnalyticsService {

    public static final DateTimeFormatter DTF = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DataAnalyticsService<FlatUserData> dataAnalyticsService;

    @Override
    public List<TypicalUser> typicalUsersForBusiness(String boEmail) {
        List<Transaction> transactions = transactionRepository.findByBoEmail(boEmail);
        int transactionCount = transactions.size();
        List<String> userEmails = transactions.stream()
            .map(Transaction::getEmail)
            .distinct()
            .collect(Collectors.toList());
        Map<String, User> users = userRepository.findUsersByEmails(userEmails).stream()
            .collect(Collectors.toMap(
                User::getEmail,
                Function.identity()
            ));

        Map<String, List<Transaction>> transactionsByEmail = transactions.stream()
            .collect(Collectors.groupingBy(Transaction::getEmail));
        Map<User, List<Transaction>> transactionsByUsers = transactionsByEmail.entrySet().stream()
            .collect(Collectors.toMap(
                entry -> users.get(entry.getKey()),
                Map.Entry::getValue
            ));

        Map<User, UserAverageDataModel> userAverages = transactionsByUsers.entrySet().stream()
            .collect(Collectors.toMap(
                Map.Entry::getKey,
                entry -> toAverage(entry.getKey(), entry.getValue())
            ));

        List<FlatUserData> flatUserData = userAverages.entrySet().stream()
            .map(entry -> new FlatUserData(
                entry.getKey().getAge(),
                entry.getKey().getGender(),
                entry.getValue().getAverageCheck(),
                entry.getValue().getAverageDayTime()))
            .collect(Collectors.toList());

        List<Cluster<FlatUserData>> clusters = dataAnalyticsService.clusterize(flatUserData,
            16,
            MetricsAttribute.of(userData -> userData.getAverageTime().doubleValue(), 1),
            MetricsAttribute.of(FlatUserData::getAverageCheck, 3),
            MetricsAttribute.of(userData -> userData.getAge().doubleValue(), 3),
            MetricsAttribute.of(userData -> (double) userData.getGender().ordinal(), 1));

        List<Cluster<FlatUserData>> clustersSortedBySize = clusters.stream()
            .filter(cluster -> (double) cluster.size() / users.size() > 0.05)
            .sorted(Comparator.comparing(Cluster::size))
            .collect(Collectors.toList());

        Map<FlatUserData, Integer> clusterRepresentatedByAverageWithCounts = clustersSortedBySize.stream()
            .collect(Collectors.toMap(
                this::toAverage,
                Cluster::size
            ));

        List<TypicalUser> typicalUsers = clusterRepresentatedByAverageWithCounts.entrySet().stream()
            .map(entry -> {
                TypicalUser typicalUser = new TypicalUser();
                typicalUser.setAge(entry.getKey().getAge());
                typicalUser.setAverageCheck(entry.getKey().getAverageCheck());
                typicalUser.setAverageTime(entry.getKey().getAverageTime());
                typicalUser.setGender(entry.getKey().getGender().ordinal());
                typicalUser.setQuantity(entry.getValue());
                typicalUser.setPercentage((double) entry.getValue() / userEmails.size());
                return typicalUser;
            })
            .collect(Collectors.toList());

        return typicalUsers;
    }

    private UserAverageDataModel toAverage(User user, List<Transaction> transactions) {
        double averageCheck = transactions.stream()
            .mapToDouble(Transaction::getTotal_amount)
            .average()
            .orElse(0.0);
        double averageMinuteOfDayRaw = transactions.stream()
            .mapToLong(transaction -> LocalTime.from(DTF.parse(transaction.getTimestamp()))
                .getLong(ChronoField.MINUTE_OF_DAY))
            .average()
            .orElse(0);
        long averageMinuteOfDay = round(averageMinuteOfDayRaw);
        return new UserAverageDataModel(user, averageCheck, averageMinuteOfDay);
    }

    private FlatUserData toAverage(Cluster<FlatUserData> cluster) {
        int averageAge = (int) round(cluster.getData().stream()
            .mapToInt(FlatUserData::getAge)
            .average()
            .getAsDouble());
        double averageCheck = cluster.getData().stream()
            .mapToDouble(FlatUserData::getAverageCheck)
            .average()
            .getAsDouble();
        long averageDayMinute = round(cluster.getData().stream()
            .mapToLong(FlatUserData::getAverageTime)
            .average()
            .getAsDouble());
        Map<Gender, Long> gendersCount = cluster.getData().stream()
            .collect(Collectors.groupingBy(
                FlatUserData::getGender,
                Collectors.counting()
            ));
        Gender averageGender = gendersCount.getOrDefault(Gender.MALE, 0L) > gendersCount.getOrDefault(Gender.FEMALE, 0L)
            ? Gender.MALE
            : Gender.FEMALE;
        return FlatUserData.builder()
            .age(averageAge)
            .gender(averageGender)
            .averageCheck(averageCheck)
            .averageTime(averageDayMinute)
            .build();
    }
}
