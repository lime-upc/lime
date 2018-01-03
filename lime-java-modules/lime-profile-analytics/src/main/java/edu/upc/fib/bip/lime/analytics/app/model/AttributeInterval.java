package edu.upc.fib.bip.lime.analytics.app.model;

import java.util.function.BiFunction;

/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 24.12.17
 */
public class AttributeInterval<T> {

    private AttributeInterval(Class<T> tClass, T from, T to, T average) {
        this.tClass = tClass;
        this.from = from;
        this.to = to;
        this.average = average;
    }

    private final T from;
    private final T to;
    private final T average;
    private final Class<T> tClass;

    private static <T> AttributeIntervalBuilder<T> forClass(Class<T> tClass) {
        return new AttributeIntervalBuilder<>(tClass);
    }

    public static AttributeIntervalBuilder<Integer> forInt() {
        return forClass(Integer.class)
            .withAverage((from, to) -> (from + to) / 2);
    }

    public static AttributeIntervalBuilder<Double> forDouble() {
        return forClass(Double.class)
            .withAverage((from, to) -> (from + to) / 2);
    }

    public static AttributeIntervalBuilder<Long> forLong() {
        return forClass(Long.class)
            .withAverage((from, to) -> (from + to) / 2);
    }

    public static AttributeIntervalBuilder<Gender> forGender() {
        return forClass(Gender.class)
            .withAverage((from, to) -> from == to ? from : Gender.UNDEFINED);
    }

    static class AttributeIntervalBuilder<TB> {
        private Class<TB> tClass;
        private TB from;
        private TB to;
        private TB average;
        private BiFunction<TB, TB, TB> averageFunction;

        AttributeIntervalBuilder(Class<TB> tClass) {
            this.tClass = tClass;
        }

        public AttributeIntervalBuilder<TB> from(TB from) {
            this.from = from;
            return this;
        }

        public AttributeIntervalBuilder<TB> to(TB to) {
            this.to = to;
            return this;
        }

        public AttributeIntervalBuilder<TB> withAverage(TB average) {
            this.average = average;
            return this;
        }

        public AttributeIntervalBuilder<TB> withAverage(BiFunction<TB, TB, TB> average) {
            this.averageFunction = average;
            return this;
        }

        public AttributeInterval<TB> build() {
            if (average == null && averageFunction != null) {
                average = averageFunction.apply(from, to);
            }
            return new AttributeInterval<>(tClass, from, to, average);
        }

    }
}
