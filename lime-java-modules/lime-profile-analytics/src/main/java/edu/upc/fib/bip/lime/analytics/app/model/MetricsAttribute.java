package edu.upc.fib.bip.lime.analytics.app.model;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.function.Function;

/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 24.12.17
 */
@AllArgsConstructor
@Getter
public class MetricsAttribute<T> {

    private Function<T, Double> attribute;
    private double weight;

    public static <T> MetricsAttribute<T> of(Function<T, Double> attribute, double weight) {
        return new MetricsAttribute<>(attribute, weight);
    }

}
