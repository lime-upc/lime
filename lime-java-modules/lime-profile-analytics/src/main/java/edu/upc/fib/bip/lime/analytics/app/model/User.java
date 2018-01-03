package edu.upc.fib.bip.lime.analytics.app.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 24.12.17
 */
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class User {

    private String email;
    private int age;
    private Gender gender;

}
