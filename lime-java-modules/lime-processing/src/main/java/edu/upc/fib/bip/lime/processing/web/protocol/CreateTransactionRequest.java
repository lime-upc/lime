package edu.upc.fib.bip.lime.processing.web.protocol;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 19.11.17
 */
@Getter
@Setter
@NoArgsConstructor
public class CreateTransactionRequest {

    @JsonProperty("boid")
    private int businessId;

    @JsonProperty("amount")
    private Double amount;
}
