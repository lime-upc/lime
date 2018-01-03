package edu.upc.fib.bip.lime.analytics.app.model;

import lombok.*;

/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 24.12.17
 */
@AllArgsConstructor
@Getter
@EqualsAndHashCode
@ToString
@Builder
public class FlatUserData {

    private Integer age;
    private Gender gender;
    private Double averageCheck;
    private Long averageTime;

}
