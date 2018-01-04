package edu.upc.fib.bip.lime.analytics.app.model;

import edu.upc.fib.bip.lime.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 24.12.17
 */
@AllArgsConstructor
@Getter
@Builder
public class UserAverageDataModel {

    private User user;
    private double averageCheck;
    private long averageDayTime;

}
