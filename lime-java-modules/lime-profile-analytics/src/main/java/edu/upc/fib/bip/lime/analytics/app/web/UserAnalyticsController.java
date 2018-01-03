package edu.upc.fib.bip.lime.analytics.app.web;

import edu.upc.fib.bip.lime.analytics.app.model.TypicalUserResponse;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import java.util.List;

/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 24.12.17
 */
@RequestMapping(method = RequestMethod.GET)
public interface UserAnalyticsController {

    @RequestMapping("/{boEmail}/typical-users")
    List<TypicalUserResponse> typicalUsersForBusiness(String boEmail);

}
