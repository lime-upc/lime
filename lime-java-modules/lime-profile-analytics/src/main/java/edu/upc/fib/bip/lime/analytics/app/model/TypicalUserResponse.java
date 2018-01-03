package edu.upc.fib.bip.lime.analytics.app.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 02.01.18
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class TypicalUserResponse {

    private boolean error;
    private TypicalUserResponsePayload message;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @ToString
    public static class TypicalUserResponsePayload {
        @JsonProperty("profile")
        private FlatUserData flatUserData;

        @JsonProperty("count")
        private Integer count;
    }
}
