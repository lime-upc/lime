package edu.upc.fib.bip.lime.analytics;

import edu.upc.fib.bip.lime.analytics.app.model.FlatUserData;
import edu.upc.fib.bip.lime.analytics.app.model.Gender;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Comparator;

/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 02.01.18
 */
public class UserAnalyticsComparators {

    private static final Logger LOGGER = LoggerFactory.getLogger(UserAnalyticsComparators.class);

    private static final Integer AGE_BIAS = 5;
    private static final Comparator<Integer> AGE_COMPARATOR = (first, second) -> {
        int result = first == null || second == null || Math.abs(first - second) < AGE_BIAS
            ? 0
            : Integer.compare(first, second);
        if (result != 0) LOGGER.info("comparing AGE failed");
        return result;
    };

    private static final Long TIME_OF_DAY_BIAS = 60L; // 60 minutes
    private static final Comparator<Long> TIME_OF_DAY_COMPARATOR = (first, second) -> {
        int result = first == null || second == null || Math.abs(first - second) < TIME_OF_DAY_BIAS
            ? 0
            : Long.compare(first, second);
        if (result != 0) LOGGER.info("comparing TIME_OF_DAY failed");
        return result;
    };

    private static final Double CHECK_BIAS = 0.1; // less than 10% difference
    private static final Comparator<Double> CHECK_COMPARATOR = (first, second) -> {
        int result = first == null || second == null || Math.max(first, second) / Math.min(first, second) - 1 < CHECK_BIAS
            ? 0
            : Double.compare(first, second);
        if (result != 0) LOGGER.info("comparing CHECK failed");
        return result;
    };

    private static final Comparator<Gender> GENDER_COMPARATOR = (first, second) -> {
        int result = first == null || first == Gender.UNDEFINED || second == null || second == Gender.UNDEFINED || first == second
            ? 0
            : Integer.compare(first.ordinal(), second.ordinal());
        if (result != 0) LOGGER.info("comparing GENDER failed");
        return result;
    };

    public static final Comparator<FlatUserData> USER_DATA_COMPARATOR = Comparator
        .comparing(FlatUserData::getAge, AGE_COMPARATOR)
        .thenComparing(FlatUserData::getGender, GENDER_COMPARATOR)
        .thenComparing(FlatUserData::getAverageCheck, CHECK_COMPARATOR)
        .thenComparing(FlatUserData::getAverageTime, TIME_OF_DAY_COMPARATOR);
}
