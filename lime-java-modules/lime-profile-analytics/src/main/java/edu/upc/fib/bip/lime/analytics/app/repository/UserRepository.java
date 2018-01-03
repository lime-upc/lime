package edu.upc.fib.bip.lime.analytics.app.repository;

import edu.upc.fib.bip.lime.analytics.app.model.User;

import java.util.List;

/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 27.12.17
 */
public interface UserRepository {

    List<User> findUsersByEmails(List<String> userEmails);
}
