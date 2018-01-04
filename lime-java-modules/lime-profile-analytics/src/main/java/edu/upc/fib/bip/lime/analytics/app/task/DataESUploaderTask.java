package edu.upc.fib.bip.lime.analytics.app.task;

import edu.upc.fib.bip.lime.analytics.app.model.elasticsearch.BusinessUsersESEntity;
import edu.upc.fib.bip.lime.analytics.app.repository.TransactionRepository;
import edu.upc.fib.bip.lime.analytics.app.repository.elasticsearch.BusinessUsersESRepository;
import edu.upc.fib.bip.lime.analytics.app.service.UserAnalyticsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.context.annotation.Profile;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 04.01.18
 */
@Component
@Profile("!unit")
public class DataESUploaderTask implements ApplicationListener<ApplicationReadyEvent> {

    private static final Logger LOGGER = LoggerFactory.getLogger(DataESUploaderTask.class);

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserAnalyticsService userAnalyticsService;

    @Autowired
    private BusinessUsersESRepository esRepository;

    @Scheduled(cron = "0 0 * * *")
    public void execute() {
        LOGGER.info("Starting {}", DataESUploaderTask.class.getSimpleName());
        LOGGER.info("Getting data from MongoDB");
        List<BusinessUsersESEntity> dataToUpload = transactionRepository.boEmails().stream()
            .map(boEmail -> {
                BusinessUsersESEntity businessUsersESEntity = new BusinessUsersESEntity();
                businessUsersESEntity.setEmail(boEmail);
                businessUsersESEntity.setTypicalUsers(userAnalyticsService.typicalUsersForBusiness(boEmail));
                return businessUsersESEntity;
            })
            .collect(Collectors.toList());
        if (dataToUpload.isEmpty()) {
            return;
        }
        LOGGER.info("Data from MongoDB received");
        LOGGER.info("Clearing ElasticSearch cache");
        esRepository.deleteAll();
        LOGGER.info("Previously saved cache cleared");
        LOGGER.info("Uploading data to ElasticSearch");
        esRepository.save(dataToUpload);
        LOGGER.info("Data saved to ElasticSearch");
        List<BusinessUsersESEntity> savedData = StreamSupport.stream(esRepository.findAll().spliterator(), false)
            .collect(Collectors.toList());
        if (savedData.size() == dataToUpload.size()) {
            LOGGER.info("Data checked for consistency and is ready for use", savedData);
        } else {
            throw new IllegalStateException("Data consistency error");
        }
    }

    @Override
    public void onApplicationEvent(ApplicationReadyEvent applicationReadyEvent) {
        execute();
    }
}
