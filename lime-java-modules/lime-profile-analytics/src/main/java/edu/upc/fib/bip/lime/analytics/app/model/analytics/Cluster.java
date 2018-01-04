package edu.upc.fib.bip.lime.analytics.app.model.analytics;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Collection;

/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 24.12.17
 */
@Getter
@AllArgsConstructor
public class Cluster<T> {

    private Collection<T> data;
    private Collection<MetricsAttribute<T>> attributes;

    public int size() {
        return data.size();
    }

}