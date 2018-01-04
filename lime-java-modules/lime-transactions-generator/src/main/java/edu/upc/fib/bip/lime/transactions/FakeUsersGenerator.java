package edu.upc.fib.bip.lime.transactions;


import edu.upc.fib.bip.lime.model.Gender;
import edu.upc.fib.bip.lime.model.User;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

/**
 * This generator is not for uniform data distribution!
 * It simulates (very rough, but efficiently) normal distribution
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 31.12.17
 */
public class FakeUsersGenerator extends Random {

    public static final int SIGMA_RADIUS = 1;
    public static final int LOWEST_AGE = 16;
    public static final int HIGHEST_AGE = 75;

    private final Integer averageAge;
    private final Gender gender;
    private final double ratio;

    private FakeUsersGenerator(Integer averageAge, Gender gender, double ratio) {
        this.averageAge = averageAge;
        this.gender = gender;
        this.ratio = ratio;
    }

    public List<User> generate(int size) {

        int piece;
        int sigma = 0;
        int sigma2 = 0;
        int sigma3 = 0;
        int rest = size;

        if (averageAge != null) {
            piece = size / 100;
            // 2/3 of normal
            sigma = 60 * piece;
            // 95% of normal
            sigma2 = 29 * piece;
            // 99% of normal
            sigma3 = piece;
            // 10% of all
            rest = size - sigma - sigma2 - sigma3;
        }

        List<User> result = new ArrayList<>(size);

        for (int i = 0; i < sigma; i++) {
            User user = new User();
            user.setAge(averageAge - SIGMA_RADIUS + nextInt(1 + SIGMA_RADIUS * 2));
            result.add(user);
        }
        for (int i = 0; i < sigma2; i++) {
            User user = new User();
            user.setAge(averageAge - 2 * SIGMA_RADIUS + nextInt(1 + SIGMA_RADIUS * 4));
            result.add(user);
        }
        for (int i = 0; i < sigma3; i++) {
            User user = new User();
            user.setAge(averageAge - 3 * SIGMA_RADIUS + nextInt(1 + SIGMA_RADIUS * 6));
            result.add(user);
        }
        for (int i = 0; i < rest; i++) {
            User user = new User();
            user.setAge(LOWEST_AGE + nextInt(HIGHEST_AGE - LOWEST_AGE + 1));
            result.add(user);
        }
        result.forEach(user ->
            user.setGender(nextDouble() < ratio / (1 + ratio)
                ? gender
                : gender.another()));
        for (int i = 0; i < result.size(); i++) {
            result.get(i).setEmail("user" + nextInt() + "@email");
        }

        return result;
    }

    public static FakeUsersGeneratorBuilder builder() {
        return new FakeUsersGeneratorBuilder();
    }

    public static class FakeUsersGeneratorBuilder {

        private Integer averageAge;
        private Gender gender;
        private double ratio;

        private FakeUsersGeneratorBuilder() {
        }

        public FakeUsersGeneratorBuilder withAverageAge(Integer averageAge) {
            this.averageAge = averageAge;
            return this;
        }

        public FakeUsersGeneratorBuilder withGenderRatio(Gender gender, double ratio) {
            this.gender = gender;
            this.ratio = ratio;
            return this;
        }

        public List<User> generate(int size) {
            return new FakeUsersGenerator(averageAge, gender, ratio).generate(size);
        }
    }

}
