package edu.upc.fib.bip.lime.processing.web.protocol;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 19.11.17
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateTransactionResponse {

    @JsonProperty("id")
    private String transactionId;
}

