package edu.upc.fib.bip.lime.model;

import lombok.*;

import java.io.Serializable;

/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 02.12.17
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction implements Serializable {

    private String user;
    private String business_owner;
    private long timestamp;
    private double virtual_money_used;
    private double payback_amount;
    private double total_amount;
    private String status = "confirmed";

}
