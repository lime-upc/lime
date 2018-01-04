package edu.upc.fib.bip.lime.analytics.app.service;

import edu.upc.fib.bip.lime.analytics.app.model.TypicalUser;

import java.util.List;

/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 24.12.17
 */
public interface UserAnalyticsService {

    List<TypicalUser> typicalUsersForBusiness(String boEmail);

}
