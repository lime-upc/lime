package edu.upc.fib.bip.lime.analytics.app.service.impl;

import edu.upc.fib.bip.lime.analytics.app.model.Cluster;
import edu.upc.fib.bip.lime.analytics.app.model.FlatUserData;
import edu.upc.fib.bip.lime.analytics.app.model.MetricsAttribute;
import edu.upc.fib.bip.lime.analytics.app.service.DataAnalyticsService;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.function.BiFunction;
import java.util.stream.Collectors;

/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 24.12.17
 */
@Service
public class UserDataAnalyticsServiceImpl implements DataAnalyticsService<FlatUserData> {

    @Override
    public List<Cluster<FlatUserData>> clusterize(List<FlatUserData> sourceData,
                                                  double metricsThreshold,
                                                  MetricsAttribute<FlatUserData> attribute,
                                                  MetricsAttribute<FlatUserData>... attributes) {
        HashSet<FlatUserData> notClusterized = new HashSet<>(sourceData);
        List<Cluster<FlatUserData>> result = new ArrayList<>();

        List<MetricsAttribute<FlatUserData>> clusterAttributes = new ArrayList<>();
        clusterAttributes.add(attribute);
        clusterAttributes.addAll(Arrays.asList(attributes));

        BiFunction<FlatUserData, FlatUserData, Double> metrics = metrics(attribute, attributes);

        while (!notClusterized.isEmpty()) {
            FlatUserData currentObject = notClusterized.iterator().next();
            Collection<FlatUserData> neighbourObjects = getNeighbourObjects(currentObject, metricsThreshold, notClusterized, metrics);
            FlatUserData centerObject = centerOfObjects(neighbourObjects, metrics);

            while (centerObject != currentObject) {
                currentObject = centerObject;
                neighbourObjects = getNeighbourObjects(currentObject, metricsThreshold, notClusterized, metrics);
                centerObject = centerOfObjects(neighbourObjects, metrics);
            }
            result.add(new Cluster<>(neighbourObjects, clusterAttributes));
            for (FlatUserData neighbourObject : neighbourObjects) {
                notClusterized.remove(neighbourObject);
            }
        }
        return result;
    }

    private Set<FlatUserData> getNeighbourObjects(FlatUserData currentObject,
                                                   double metricsThreshold,
                                                   Collection<FlatUserData> sourceData,
                                                   BiFunction<FlatUserData, FlatUserData, Double> metrics) {
        return sourceData.stream()
            .filter(object -> metrics.apply(currentObject, object) < metricsThreshold)
            .collect(Collectors.toSet());
    }

    private FlatUserData centerOfObjects(Collection<FlatUserData> objects,
                                         BiFunction<FlatUserData, FlatUserData, Double> metrics) {
        double min = Double.MAX_VALUE;
        FlatUserData center = null;
        for (FlatUserData possibleCandidate : objects) {
            double sum = 0;
            for (FlatUserData eachObject : objects) {
                sum = sum + metrics.apply(possibleCandidate, eachObject);
            }
            if (sum < min) {
                min = sum;
                center = possibleCandidate;
            }
        }
        return center;
    }

    private BiFunction<FlatUserData, FlatUserData, Double> metrics(MetricsAttribute<FlatUserData> attribute,
                                                                   MetricsAttribute<FlatUserData>... attributes) {
        return (x, y) -> {
            double sum = attribute.getWeight() * Math.abs(attribute.getAttribute().apply(x) - attribute.getAttribute().apply(y));
            for (MetricsAttribute<FlatUserData> nextAttributes : attributes) {
                sum += nextAttributes.getWeight() * Math.abs(nextAttributes.getAttribute().apply(x) - nextAttributes.getAttribute().apply(y));
            }
            return Math.sqrt(sum);
        };
    }
}
