package edu.upc.fib.bip.lime.processing.web.protocol;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 19.11.17
 */
@Getter
@Setter
@NoArgsConstructor
public class GetTransactionInfoRequest {
    @JsonProperty("id")
    private String transactionId;
}
