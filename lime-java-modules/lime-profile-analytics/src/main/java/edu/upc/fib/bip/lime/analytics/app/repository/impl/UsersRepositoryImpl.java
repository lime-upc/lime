package edu.upc.fib.bip.lime.analytics.app.repository.impl;

import com.mongodb.client.MongoCollection;
import edu.upc.fib.bip.lime.analytics.app.model.User;
import edu.upc.fib.bip.lime.analytics.app.repository.UserRepository;
import org.bson.conversions.Bson;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import static com.mongodb.client.model.Filters.eq;
import static com.mongodb.client.model.Filters.or;

/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 27.12.17
 */
public class UsersRepositoryImpl extends MongoRepository implements UserRepository {

    private final MongoCollection<User> users;

    public UsersRepositoryImpl(String dbUrl, String dbName, String usersCollectionName) {
        super(dbUrl, dbName);
        this.users = database.getCollection(usersCollectionName, User.class);
    }

    @Override
    public List<User> findUsersByEmails(List<String> userEmails) {
        return StreamSupport.stream(users.find(
            or(userEmails.stream()
                .map(email -> eq("email", email))
                .toArray(Bson[]::new)
            ))
            .spliterator(), false)
            .collect(Collectors.toList());
    }
}
