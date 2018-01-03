package edu.upc.fib.bip.lime.analytics.app;

import edu.upc.fib.bip.lime.analytics.app.repository.TransactionRepository;
import edu.upc.fib.bip.lime.analytics.app.repository.UserRepository;
import edu.upc.fib.bip.lime.analytics.app.repository.impl.TransactionRepositoryImpl;
import edu.upc.fib.bip.lime.analytics.app.repository.impl.UsersRepositoryImpl;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 27.12.17
 */
@Configuration
@ComponentScan("edu.upc.fib.bip.lime.analytics.app")
public class RootContextConfiguration {

    @Bean
    @Profile("!unit")
    public TransactionRepository transactionRepository(@Value("${mongodb.url}") String dbUrl,
                                                       @Value("${mongodb.name}") String dbName,
                                                       @Value("${mongodb.collections.transactions}") String transactionsCollection) {
        return new TransactionRepositoryImpl(dbUrl, dbName, transactionsCollection);
    }

    @Bean
    @Profile("!unit")
    public UserRepository userRepository(@Value("${mongodb.url}") String dbUrl,
                                         @Value("${mongodb.name}") String dbName,
                                         @Value("${mongodb.collections.users}") String usersCollection) {
        return new UsersRepositoryImpl(dbUrl, dbName, usersCollection);
    }
}
