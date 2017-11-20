package edu.upc.fib.bip.lime.processing.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 19.11.17
 */
@Getter
@NoArgsConstructor
@Setter
public class UserBalance {
    private int userId;
    private double balance;
}
