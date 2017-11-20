package edu.upc.fib.bip.lime.processing.web.protocol;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
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
public class ScanQrCodeRequest {

    @JsonProperty("id")
    private String transactionId;

    @JsonProperty("user")
    private int userId;
}
