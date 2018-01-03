package edu.upc.fib.bip.lime.analytics.app.service;

import edu.upc.fib.bip.lime.analytics.app.model.FlatUserData;

import java.util.Map;

/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 24.12.17
 */
public interface UserAnalyticsService {

    Map<FlatUserData, Integer> typicalUsersForBusiness(String boEmail);

}
