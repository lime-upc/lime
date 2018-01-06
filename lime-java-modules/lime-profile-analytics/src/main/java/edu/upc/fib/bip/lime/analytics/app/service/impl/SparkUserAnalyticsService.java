package edu.upc.fib.bip.lime.analytics.app.service.impl;

import com.mongodb.spark.rdd.api.java.JavaMongoRDD;
import edu.upc.fib.bip.lime.analytics.app.model.FlatUserData;
import edu.upc.fib.bip.lime.analytics.app.model.TypicalUser;
import edu.upc.fib.bip.lime.analytics.app.model.UserAverageDataModel;
import edu.upc.fib.bip.lime.analytics.app.model.analytics.Cluster;
import edu.upc.fib.bip.lime.analytics.app.model.analytics.MetricsAttribute;
import edu.upc.fib.bip.lime.analytics.app.service.DataAnalyticsService;
import edu.upc.fib.bip.lime.analytics.app.service.UserAnalyticsService;
import edu.upc.fib.bip.lime.model.Gender;
import edu.upc.fib.bip.lime.model.Transaction;
import edu.upc.fib.bip.lime.model.User;
import org.apache.spark.Partitioner;
import org.apache.spark.api.java.JavaPairRDD;
import org.apache.spark.api.java.JavaRDD;
import org.apache.spark.api.java.function.PairFunction;
import org.apache.spark.storage.StorageLevel;
import org.bson.conversions.Bson;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import scala.Tuple2;

import java.io.Serializable;
import java.time.LocalTime;
import java.time.temporal.ChronoField;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import static com.mongodb.client.model.Filters.eq;
import static com.mongodb.client.model.Filters.expr;
import static com.mongodb.client.model.Filters.or;
import static edu.upc.fib.bip.lime.analytics.app.service.impl.JavaUserAnalyticsService.DTF;
import static java.lang.Math.round;

/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 04.01.18
 */
@Service
public class SparkUserAnalyticsService implements UserAnalyticsService, Serializable {

    @Autowired
    private JavaMongoRDD<User> usersRDD;

    @Autowired
    private JavaMongoRDD<Transaction> transactionsRDD;

    @Autowired
    private transient DataAnalyticsService<FlatUserData> dataAnalyticsService;

    @Override
    public List<TypicalUser> typicalUsersForBusiness(String boEmail) {

        JavaPairRDD<String, Iterable<Transaction>> transactionsByUserEmails = transactionsRDD
            .filter(transaction -> Objects.equals(transaction.getBusiness_owner_id(), boEmail))
            .groupBy(Transaction::getEmail)
            .persist(StorageLevel.MEMORY_ONLY_2());

        List<String> userEmails = transactionsByUserEmails.keys()
            .collect();
        long usersCount = userEmails.size();
        JavaPairRDD<String, User> emailToUserPairs = usersRDD
            // this is insane
            .filter(user -> userEmails.contains(user.getEmail()))
            .mapToPair(user -> new Tuple2<>(user.getEmail(), user))
            .persist(StorageLevel.MEMORY_ONLY_2());
        JavaPairRDD<User, Iterable<Transaction>> transactionsByUser = transactionsByUserEmails
            .join(emailToUserPairs)
            .values()
            .mapToPair((PairFunction<Tuple2<Iterable<Transaction>, User>, User, Iterable<Transaction>>)
                Tuple2::swap);
        List<FlatUserData> users = transactionsByUser
            .map(userTransactions -> toAverage(userTransactions))
            .map(userAverages -> translate(userAverages))
            .collect();

        List<Cluster<FlatUserData>> clusters = dataAnalyticsService.clusterize(users,
            16,
            MetricsAttribute.of(userData -> userData.getAverageTime().doubleValue(), 1),
            MetricsAttribute.of(FlatUserData::getAverageCheck, 3),
            MetricsAttribute.of(userData -> userData.getAge().doubleValue(), 3),
            MetricsAttribute.of(userData -> (double) userData.getGender().ordinal(), 1));

        List<Cluster<FlatUserData>> clustersSortedBySize = clusters.stream()
            .filter(cluster -> (double) cluster.size() / usersCount > 0.05)
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
                typicalUser.setPercentage((double) entry.getValue() / usersCount);
                return typicalUser;
            })
            .collect(Collectors.toList());

        return typicalUsers;
    }

    private FlatUserData translate(UserAverageDataModel userAverages) {
        return FlatUserData.builder()
            .age(userAverages.getUser().getAge())
            .gender(userAverages.getUser().getGender())
            .averageCheck(userAverages.getAverageCheck())
            .averageTime(userAverages.getAverageDayTime())
            .build();
    }

    private UserAverageDataModel toAverage(Tuple2<User, Iterable<Transaction>> userTransactions) {
        return toAverage(userTransactions._1, userTransactions._2);
    }

    private UserAverageDataModel toAverage(User user, Iterable<Transaction> transactions) {
        double averageCheck = StreamSupport.stream(transactions.spliterator(), true)
            .mapToDouble(Transaction::getTotal_amount)
            .average()
            .orElse(0.0);
        double averageMinuteOfDayRaw = StreamSupport.stream(transactions.spliterator(), true)
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
