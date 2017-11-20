package edu.upc.fib.bip.lime.processing.service;

import edu.upc.fib.bip.lime.processing.model.Transaction;
import org.springframework.stereotype.Service;

/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 19.11.17
 */
@Service
public class PaybackServiceImpl implements IPaybackService {

    public static final double PAYBACK_MULTIPLIER = 0.1;

    @Override
    public double computePaybackFor(Transaction transaction) {
        return Math.round(transaction.getPaymentAmount()) * PAYBACK_MULTIPLIER;
    }
}
