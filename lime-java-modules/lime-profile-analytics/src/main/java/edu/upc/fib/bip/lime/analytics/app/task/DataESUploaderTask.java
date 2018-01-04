package edu.upc.fib.bip.lime.analytics.app.task;

import edu.upc.fib.bip.lime.analytics.app.model.elasticsearch.BusinessUsersESEntity;
import edu.upc.fib.bip.lime.analytics.app.repository.TransactionRepository;
import edu.upc.fib.bip.lime.analytics.app.repository.elasticsearch.BusinessUsersESRepository;
import edu.upc.fib.bip.lime.analytics.app.service.UserAnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.util.List;
import java.util.stream.Collectors;

/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 04.01.18
 */
@Component
@Profile("!unit")
public class DataESUploaderTask {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserAnalyticsService userAnalyticsService;

    @Autowired
    private BusinessUsersESRepository esRepository;

    @Scheduled(cron = "0 0 * * *")
    @PostConstruct
    public void execute() {
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
        esRepository.save(dataToUpload);
    }
}
