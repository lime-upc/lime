package edu.upc.fib.bip.lime.processing;

import edu.upc.fib.bip.lime.processing.spring.LimeProcessingContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Import;

/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 19.11.17
 */
@SpringBootApplication
@Import(LimeProcessingContext.class)
public class LimeProcessingApplication {

    private static final Logger LOGGER = LoggerFactory.getLogger(LimeProcessingApplication.class);

    public static void main(String[] args) {
        LOGGER.info("Starting LimeApp processing system");
        SpringApplication.run(LimeProcessingApplication.class, args);
    }
}
