package edu.upc.fib.bip.lime.analytics;

import edu.upc.fib.bip.lime.analytics.app.RootContextConfiguration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Import;

/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 24.12.17
 */
@SpringBootApplication
@Import(RootContextConfiguration.class)
public class UserAnalyticsApplication {

    private static final Logger LOGGER = LoggerFactory.getLogger(UserAnalyticsApplication.class);

    public static void main(String[] args) {
        LOGGER.info("Starting {}", UserAnalyticsApplication.class.getName());
        SpringApplication.run(UserAnalyticsApplication.class, args);
    }
}
