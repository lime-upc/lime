package edu.upc.fib.bip.lime;

import lombok.*;

import java.time.LocalDate;

/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 02.12.17
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

    private int id;
    private String email;
    private String business_owner_id;
    private String timestamp;
    private double virtial_money_used;
    private double payback_amount;
    private double total_amount;
    private String status = "confirmed";

}
