package edu.upc.fib.bip.lime.analytics.app.model;

import edu.upc.fib.bip.lime.model.Gender;
import lombok.*;

import java.io.Serializable;

/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 24.12.17
 */
@AllArgsConstructor
@Getter
@EqualsAndHashCode
@ToString
@Builder
public class FlatUserData implements Serializable {

    private Integer age;
    private Gender gender;
    private Double averageCheck;
    private Long averageTime;

}
