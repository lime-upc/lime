package edu.upc.fib.bip.lime.processing.web;

import edu.upc.fib.bip.lime.processing.model.Transaction;
import edu.upc.fib.bip.lime.processing.service.ITransactionService;
import edu.upc.fib.bip.lime.processing.utils.LimeGetController;
import edu.upc.fib.bip.lime.processing.utils.LimePatchController;
import edu.upc.fib.bip.lime.processing.utils.LimePostController;
import edu.upc.fib.bip.lime.processing.web.protocol.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 19.11.17
 */
@RestController
public class TransactionController {

    @Autowired
    private ITransactionService transactionService;

    @LimeGetController("/info/{transactionId}")
    public LimeProcessingResponseWrapper<?> info(@PathVariable String transactionId) {
        Optional<Transaction> transactionInfo = transactionService.getTransactionInfo(transactionId);
        return transactionInfo
            .<LimeProcessingResponseWrapper<?>>map(LimeProcessingResponseWrapper::of)
            .orElseGet(() -> LimeProcessingResponseWrapper.of("Transaction not found"));
    }

    @LimePostController("/start")
    public LimeProcessingResponseWrapper<?> start(@RequestBody CreateTransactionRequest request) {
        String transactionId = transactionService.createTransaction(request.getBusinessId(), request.getAmount());
        return LimeProcessingResponseWrapper.of(transactionId);
    }

    @LimePatchController("/confirm/user")
    public LimeProcessingResponseWrapper<?> userConfirms(@RequestBody UserConfirmsRequest request) {
        try {
            Transaction transaction =
                transactionService.userConfirms(request.getTransactionId(), request.getUserId(), request.isConfirmed());
            return LimeProcessingResponseWrapper.of(transaction);
        } catch (Exception e) {
            return LimeProcessingResponseWrapper.of(e);
        }
    }

    @LimePatchController("/confirm/business")
    public LimeProcessingResponseWrapper<?> confirm(@RequestBody BusinessConfirmsRequest request) {
        try {
            Transaction transaction =
                transactionService.businessConfirms(request.getTransactionId(), request.isConfirmed());
            return LimeProcessingResponseWrapper.of(transaction);
        } catch (Exception e) {
            return LimeProcessingResponseWrapper.of(e);
        }
    }

    @LimePatchController("/payback")
    public LimeProcessingResponseWrapper payback(@RequestBody GetPaybackRequest request) {
        try {
            Transaction transaction =
                transactionService.getPayback(request.getTransactionId(), request.getUserId());
            return LimeProcessingResponseWrapper.of(transaction);
        } catch (Exception e) {
            return LimeProcessingResponseWrapper.of(e);
        }
    }

}
