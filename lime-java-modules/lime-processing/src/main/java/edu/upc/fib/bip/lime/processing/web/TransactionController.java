package edu.upc.fib.bip.lime.processing.web;

import edu.upc.fib.bip.lime.processing.service.ITransactionService;
import edu.upc.fib.bip.lime.processing.utils.LimeGetController;
import edu.upc.fib.bip.lime.processing.utils.LimePostController;
import edu.upc.fib.bip.lime.processing.web.protocol.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 19.11.17
 */
@RestController
public class TransactionController {

    @Autowired
    private ITransactionService transactionService;

    @LimeGetController("/info/{transactionId}")
    public GetTransactionInfoResponse info(@PathVariable String transactionId) {
        GetTransactionInfoRequest request = new GetTransactionInfoRequest();
        request.setTransactionId(transactionId);
        return transactionService.getTransactionInfo(request.getTransactionId());
    }

    @LimePostController("/confirm/business")
    public BusinessConfirmsResponse confirm(@RequestBody BusinessConfirmsRequest request) {
        return transactionService.confirmTransaction(request.getTransactionId(), request.isConfirmed());
    }

    @LimePostController("/start")
    public CreateTransactionResponse start(@RequestBody CreateTransactionRequest request) {
        return transactionService.createTransaction(request.getBusinessId(), request.getAmount());
    }

    @LimePostController("/payback")
    public GetPaybackResponse payback(@RequestBody GetPaybackRequest request) {
        return transactionService.getPayback(request.getTransactionId());
    }

    @LimePostController("/confirm/user")
    public UserConfirmsResponse hold(@RequestBody UserConfirmsRequest request) {
        return transactionService.userConfirms(request.getTransactionId(), request.isConfirmed());
    }

    @LimePostController("/scan")
    public ScanQrCodeResponse scan(@RequestBody ScanQrCodeRequest request) {
        return transactionService.scanQrCode(request.getTransactionId(), request.getUserId());
    }

}
