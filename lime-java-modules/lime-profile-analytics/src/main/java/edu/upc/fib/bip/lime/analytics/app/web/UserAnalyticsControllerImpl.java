package edu.upc.fib.bip.lime.analytics.app.web;

import edu.upc.fib.bip.lime.analytics.app.model.FlatUserData;
import edu.upc.fib.bip.lime.analytics.app.model.TypicalUserResponse;
import edu.upc.fib.bip.lime.analytics.app.service.UserAnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 02.01.18
 */
@RestController
public class UserAnalyticsControllerImpl implements UserAnalyticsController {

    @Autowired
    private UserAnalyticsService userAnalyticsService;

    @Override
    public List<TypicalUserResponse> typicalUsersForBusiness(@PathVariable("boEmail") String boEmail) {
        return userAnalyticsService.typicalUsersForBusiness(boEmail).entrySet().stream()
            .sorted(Comparator.comparingInt(Map.Entry<FlatUserData, Integer>::getValue).reversed())
            .map(entry -> new TypicalUserResponse(false,
                new TypicalUserResponse.TypicalUserResponsePayload(entry.getKey(), entry.getValue())))
            .collect(Collectors.toList());
    }
}
