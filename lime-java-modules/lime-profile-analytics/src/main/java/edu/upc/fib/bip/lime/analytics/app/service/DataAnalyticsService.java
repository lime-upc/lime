package edu.upc.fib.bip.lime.analytics.app.service;

import edu.upc.fib.bip.lime.analytics.app.model.analytics.Cluster;
import edu.upc.fib.bip.lime.analytics.app.model.analytics.MetricsAttribute;

import java.util.List;

/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 24.12.17
 */
public interface DataAnalyticsService<T> {

    List<Cluster<T>> clusterize(List<T> sourceData, double metricsThreshold, MetricsAttribute<T> attribute, MetricsAttribute<T>... attributes);

}
