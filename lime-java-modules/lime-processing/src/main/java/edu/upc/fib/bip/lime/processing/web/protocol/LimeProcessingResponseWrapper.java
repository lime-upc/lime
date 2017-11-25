package edu.upc.fib.bip.lime.processing.web.protocol;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * @author Maksim Samoylov <samoylov@loyaltyplant.com>
 * @since 25.11.17
 */
@Getter
@Setter
@NoArgsConstructor
public class LimeProcessingResponseWrapper<T> {

    private boolean error;
    private T message;

    LimeProcessingResponseWrapper(boolean error, T message) {
        this.error = error;
        this.message = message;
    }

    public static LimeProcessingResponseWrapper<String> of(Exception e) {
        return new LimeProcessingResponseWrapper<>(true, e.getMessage());
    }

    public static <T> LimeProcessingResponseWrapper<T> of(T response) {
        return new LimeProcessingResponseWrapper<>(false, response);
    }
}
