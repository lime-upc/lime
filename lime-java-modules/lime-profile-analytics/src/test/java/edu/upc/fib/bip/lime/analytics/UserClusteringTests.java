package edu.upc.fib.bip.lime.analytics;

import edu.upc.fib.bip.lime.analytics.app.RootContextConfiguration;
import edu.upc.fib.bip.lime.analytics.app.model.FlatUserData;
import edu.upc.fib.bip.lime.analytics.app.repository.TransactionRepository;
import edu.upc.fib.bip.lime.analytics.app.repository.UserRepository;
import edu.upc.fib.bip.lime.analytics.app.service.UserAnalyticsService;
import edu.upc.fib.bip.lime.model.Gender;
import edu.upc.fib.bip.lime.model.Transaction;
import edu.upc.fib.bip.lime.model.User;
import org.assertj.core.util.Lists;
import org.junit.After;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mockito;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringRunner;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import static edu.upc.fib.bip.lime.analytics.UserAnalyticsComparators.USER_DATA_COMPARATOR;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;

/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 30.12.17
 */
@RunWith(SpringRunner.class)
@ContextConfiguration(classes = UserClusteringTests.UserClusteringTestContext.class)
@ActiveProfiles("unit")
@SuppressWarnings("SpringJavaAutowiringInspection")
public class UserClusteringTests {

    private static final Logger LOGGER = LoggerFactory.getLogger(UserClusteringTests.class);

    @TestConfiguration
    @Import(RootContextConfiguration.class)
    public static class UserClusteringTestContext {

        @Bean
        public TransactionRepository transactionRepository() {
            return mock(TransactionRepository.class);
        }

        @Bean
        public UserRepository userRepository() {
            return mock(UserRepository.class);
        }
    }

    @Autowired
    private UserAnalyticsService userAnalyticsService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @After
    public void tearDown() throws Exception {
        Mockito.reset(userRepository, transactionRepository);
    }

    private List<FlatUserData> request(String boEmail) {
        return userAnalyticsService.typicalUsersForBusiness(boEmail).stream()
            .map(typicalUser -> FlatUserData.builder()
                .gender(Gender.values()[typicalUser.getGender()])
                .age(typicalUser.getAge())
                .averageTime(typicalUser.getAverageTime())
                .averageCheck(typicalUser.getAverageCheck())
                .build())
            .collect(Collectors.toList());
    }

    private Long toTimeOfDay(String timeOfDay) {
        String[] tokens = timeOfDay.split("-");
        int hours = Integer.parseInt(tokens[0]);
        int minutes = Integer.parseInt(tokens[1]);
        return ChronoUnit.MINUTES.between(
            LocalDate.now().atStartOfDay(),
            LocalDate.now().atStartOfDay().plusHours(hours).plusMinutes(minutes));
    }

    @Test
    public void bar() throws Exception {
        String boEmail = "bo@email";

        List<User> users = FakeUsersGenerator.builder()
            .withAverageAge(null)
            .withGenderRatio(Gender.MALE, 2)
            .generate(100);
        List<Transaction> transactions = FakeTransactionsGenerator
            .forUsers(users)
            .withAverageCheck(30)
            .withAverageTime(toTimeOfDay("21-00"))
            .withBoEmail(boEmail)
            .withDataSize(1000)
            .generate();
        doReturn(users).when(userRepository).findUsersByEmails(anyList());
        doReturn(transactions).when(transactionRepository).findByBoEmail(boEmail);

        List<FlatUserData> expected = Lists.newArrayList(FlatUserData.builder()
            .gender(Gender.MALE)
            .averageCheck(30.0)
            .averageTime(toTimeOfDay("21-00"))
            .build());

        List<FlatUserData> actual = request(boEmail).stream().limit(expected.size()).collect(Collectors.toList());
        assertThat(actual)
            .usingElementComparator(USER_DATA_COMPARATOR)
            .hasSameElementsAs(expected);
    }

    @Test
    public void cafe() throws Exception {
        String boEmail = "bo@email";

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

        List<User> users = new ArrayList<>();
        users.addAll(lunchUsers);
        users.addAll(breakfastUsers);
        users.addAll(dinnerUsers);

        List<Transaction> transactions = new ArrayList<>();
        transactions.addAll(lunches);
        transactions.addAll(breakfasts);
        transactions.addAll(dinners);

        doReturn(users).when(userRepository).findUsersByEmails(any());
        doReturn(transactions).when(transactionRepository).findByBoEmail(boEmail);

        List<FlatUserData> expected = Lists.newArrayList(
            FlatUserData.builder().age(22).averageCheck(25.0).averageTime(toTimeOfDay("14-30")).build(),
            FlatUserData.builder().age(20).averageCheck(5.0).averageTime(toTimeOfDay("8-30")).build(),
            FlatUserData.builder().age(40).averageCheck(15.0).averageTime(toTimeOfDay("20-30")).build()
        );

        List<FlatUserData> actual = request(boEmail).stream().limit(expected.size()).collect(Collectors.toList());
        assertThat(actual)
            .usingElementComparator(USER_DATA_COMPARATOR)
            .hasSameElementsAs(expected);
    }

    @Test
    public void restraunt() throws Exception {
        String boEmail = "bo@email";

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

        List<User> users = new ArrayList<>();
        users.addAll(users1);
        users.addAll(users2);

        List<Transaction> transactions = new ArrayList<>();
        transactions.addAll(transactions1);
        transactions.addAll(transactions2);

        doReturn(users).when(userRepository).findUsersByEmails(any());
        doReturn(transactions).when(transactionRepository).findByBoEmail(boEmail);

        List<FlatUserData> expected = Lists.newArrayList(
            FlatUserData.builder()
                .age(40).averageCheck(40.0).averageTime(toTimeOfDay("20-30")).build(),
            FlatUserData.builder().averageCheck(20.0).averageTime(toTimeOfDay("14-30")).build());

        List<FlatUserData> actual = request(boEmail).stream().limit(expected.size()).collect(Collectors.toList());
        assertThat(actual)
            .usingElementComparator(USER_DATA_COMPARATOR)
            .hasSameElementsAs(expected);
    }

    @Test
    public void fastfood() throws Exception {
        String boEmail = "bo@email";

        List<User> users = FakeUsersGenerator.builder()
            .withAverageAge(24)
            .withGenderRatio(Gender.MALE, 1.2)
            .generate(100);
        List<Transaction> transactions = FakeTransactionsGenerator
            .forUsers(users)
            .withAverageCheck(10)
            .withAverageTime(toTimeOfDay("16-30"))
            .withBoEmail(boEmail)
            .withDataSize(1000)
            .generate();

        doReturn(users).when(userRepository).findUsersByEmails(any());
        doReturn(transactions).when(transactionRepository).findByBoEmail(boEmail);

        List<FlatUserData> expected = Lists.newArrayList(FlatUserData.builder()
            .age(24)
            .averageCheck(10.0)
            .averageTime(toTimeOfDay("16-30"))
            .build());

        List<FlatUserData> actual = request(boEmail).stream().limit(expected.size()).collect(Collectors.toList());
        assertThat(actual)
            .usingElementComparator(USER_DATA_COMPARATOR)
            .hasSameElementsAs(expected);
    }

}
