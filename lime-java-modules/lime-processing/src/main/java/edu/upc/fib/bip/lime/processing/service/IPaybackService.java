package edu.upc.fib.bip.lime.processing.service;

import edu.upc.fib.bip.lime.processing.model.Transaction;

/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 19.11.17
 */
public interface IPaybackService {

    double computePaybackFor(Transaction transaction);

}
