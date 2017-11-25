package edu.upc.fib.bip.lime.processing.web;

import edu.upc.fib.bip.lime.processing.dao.IUserBalanceDAO;
import edu.upc.fib.bip.lime.processing.model.Transaction;
import edu.upc.fib.bip.lime.processing.model.TransactionFilter;
import edu.upc.fib.bip.lime.processing.model.UserBalance;
import edu.upc.fib.bip.lime.processing.service.ITransactionService;
import edu.upc.fib.bip.lime.processing.utils.LimeGetController;
import edu.upc.fib.bip.lime.processing.utils.LimePatchController;
import edu.upc.fib.bip.lime.processing.utils.LimePostController;
import edu.upc.fib.bip.lime.processing.web.protocol.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 19.11.17
 */
@RestController
public class TransactionController {

    @Autowired
    private ITransactionService transactionService;

    @Autowired
    private IUserBalanceDAO userBalanceDAO;

    @LimeGetController("/balance")
    public LimeProcessingResponseWrapper<?> userBalance(@RequestParam("user") int userId) {
        Optional<UserBalance> userBalanceWrapper = userBalanceDAO.findByUser(userId);
        return userBalanceWrapper
            .map(UserBalance::getBalance)
            .<LimeProcessingResponseWrapper<?>>map(LimeProcessingResponseWrapper::success)
            .orElseGet(() -> LimeProcessingResponseWrapper.error("User balance not found"));
    }

    @LimeGetController("/transactions")
    public LimeProcessingResponseWrapper<?> userBalance(@RequestParam("boid") int businessId,
                                                        @RequestParam(value = "user", required = false) Integer userId,
                                                        @RequestParam(value = "from", required = false) LocalDateTime from,
                                                        @RequestParam(value = "to", required = false) LocalDateTime to) {
        List<Transaction> transactionsByFilter = transactionService.findTransactionsByFilter(TransactionFilter.builder()
            .businessId(businessId)
            .userId(userId)
            .from(from)
            .to(to)
            .build());
        return LimeProcessingResponseWrapper.success(transactionsByFilter);
    }

    @LimeGetController("/info/{transactionId}")
    public LimeProcessingResponseWrapper<?> info(@PathVariable String transactionId) {
        Optional<Transaction> transactionInfo = transactionService.getTransactionInfo(transactionId);
        return transactionInfo
            .<LimeProcessingResponseWrapper<?>>map(LimeProcessingResponseWrapper::success)
            .orElseGet(() -> LimeProcessingResponseWrapper.error("Transaction not found"));
    }

    @LimePostController("/start")
    public LimeProcessingResponseWrapper<?> start(@RequestBody CreateTransactionRequest request) {
        String transactionId = transactionService.createTransaction(request.getBusinessId(), request.getAmount());
        return LimeProcessingResponseWrapper.success(transactionId);
    }

    @LimePatchController("/confirm/user")
    public LimeProcessingResponseWrapper<?> userConfirms(@RequestBody UserConfirmsRequest request) {
        try {
            Transaction transaction =
                transactionService.userConfirms(request.getTransactionId(), request.getUserId(), request.isConfirmed());
            return LimeProcessingResponseWrapper.success(transaction);
        } catch (Exception e) {
            return LimeProcessingResponseWrapper.error(e);
        }
    }

    @LimePatchController("/confirm/business")
    public LimeProcessingResponseWrapper<?> confirm(@RequestBody BusinessConfirmsRequest request) {
        try {
            Transaction transaction =
                transactionService.businessConfirms(request.getTransactionId(), request.isConfirmed());
            return LimeProcessingResponseWrapper.success(transaction);
        } catch (Exception e) {
            return LimeProcessingResponseWrapper.error(e);
        }
    }

    @LimePatchController("/payback")
    public LimeProcessingResponseWrapper payback(@RequestBody GetPaybackRequest request) {
        try {
            Transaction transaction =
                transactionService.getPayback(request.getTransactionId(), request.getUserId());
            return LimeProcessingResponseWrapper.success(transaction);
        } catch (Exception e) {
            return LimeProcessingResponseWrapper.error(e);
        }
    }

}
