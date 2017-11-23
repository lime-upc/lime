package edu.upc.fib.bip.lime.processing.web;

import edu.upc.fib.bip.lime.processing.dao.ITransactionDAO;
import edu.upc.fib.bip.lime.processing.dao.IUserBalanceDAO;
import edu.upc.fib.bip.lime.processing.model.Transaction;
import edu.upc.fib.bip.lime.processing.model.TransactionStatus;
import edu.upc.fib.bip.lime.processing.model.TransactionType;
import edu.upc.fib.bip.lime.processing.service.ITransactionService;
import edu.upc.fib.bip.lime.processing.web.protocol.*;
import org.flywaydb.core.Flyway;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.boot.autoconfigure.jdbc.EmbeddedDatabaseConnection;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import java.util.concurrent.ThreadLocalRandom;

import static org.junit.Assert.*;

/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 19.11.17
 */
@RunWith(SpringJUnit4ClassRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureTestDatabase(connection = EmbeddedDatabaseConnection.H2)
@ActiveProfiles("unit")
public class TransactionControllerTest {

    @TestConfiguration
    public static class LimeProcessingTestContext {

        @Bean
        public FlywayMigrationStrategy flywayMigrationStrategy() {
            return flyway -> { /* doing nothing */ };
        }

    }

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private ITransactionService transactionService;

    @Autowired
    private IUserBalanceDAO userBalanceDAO;

    @Autowired
    private ITransactionDAO transactionDAO;

    @Test
    public void getInfoReturnsCorrectTransactionInfo() throws Exception {
        GetTransactionInfoRequest request = new GetTransactionInfoRequest();
        request.setTransactionId("1");

        HttpEntity<GetTransactionInfoRequest> requestEntity = new HttpEntity<>(request);
        GetTransactionInfoResponse response =
            restTemplate.getForEntity("/info/1", GetTransactionInfoResponse.class).getBody();
        assertEquals(1, response.getBusinessId().intValue());
        assertEquals(3.5, response.getAmount(), 0.001);
    }

    @Test
    public void newTransactionCreationReturnsTransactionID() throws Exception {
        CreateTransactionRequest request = new CreateTransactionRequest();
        request.setBusinessId(2);
        request.setAmount(3.0);
        HttpEntity<CreateTransactionRequest> requestEntity = new HttpEntity<>(request);

        ResponseEntity<CreateTransactionResponse> createTransactionResponseResponseEntity =
            restTemplate.postForEntity("/start", requestEntity, CreateTransactionResponse.class);
        CreateTransactionResponse response = createTransactionResponseResponseEntity.getBody();

        assertNotNull(response.getTransactionId());
        GetTransactionInfoResponse infoResponse = transactionService.getTransactionInfo(response.getTransactionId());
        assertEquals(request.getBusinessId(), infoResponse.getBusinessId().intValue());
        assertEquals(request.getAmount(), infoResponse.getAmount(), 0.001);
        assertEquals(TransactionStatus.NEW, infoResponse.getStatus());
    }

    @Test
    public void scanningChangesTransactionStateAndConnectsToUser() throws Exception {
        int userId = 456;
        userBalanceDAO.createUserBalance(userId, 5.3);

        String transactionId = transactionService.createTransaction(123, 4.0).getTransactionId();

        ScanQrCodeRequest request = new ScanQrCodeRequest();
        request.setTransactionId(transactionId);
        request.setUserId(userId);
        HttpEntity<ScanQrCodeRequest> requestEntity = new HttpEntity<>(request);

        ResponseEntity<ScanQrCodeResponse> scanQrCodeResponseResponseEntity =
            restTemplate.postForEntity("/scan", requestEntity, ScanQrCodeResponse.class);
        assertEquals(HttpStatus.OK, scanQrCodeResponseResponseEntity.getStatusCode());
        ScanQrCodeResponse response = scanQrCodeResponseResponseEntity.getBody();

        GetTransactionInfoResponse infoResponse = transactionService.getTransactionInfo(transactionId);
        assertEquals(123, infoResponse.getBusinessId().intValue());
        assertEquals(userId, infoResponse.getUserId().intValue());
        assertEquals(4.0, infoResponse.getAmount(), 0.001);
        assertEquals(TransactionStatus.SCANNED, infoResponse.getStatus());
    }

    @Test
    public void scanningForNonExistingUserCreatesUserBalanceRow() throws Exception {
        int userId = 457;
        assertFalse(userBalanceDAO.findByUser(userId).isPresent());
        String transactionId = transactionService.createTransaction(123, 4.0).getTransactionId();
        transactionService.scanQrCode(transactionId, userId);
        assertTrue(userBalanceDAO.findByUser(userId).isPresent());
    }

    @Test
    public void userCanConfirmTransactionWithVirtualMoney() throws Exception {
        int userId = 567;
        userBalanceDAO.createUserBalance(userId, 6.7);
        String transactionId = transactionService.createTransaction(123, 4.0).getTransactionId();
        transactionService.scanQrCode(transactionId, userId);

        UserConfirmsRequest userConfirmsRequest = new UserConfirmsRequest();
        userConfirmsRequest.setTransactionId(transactionId);
        userConfirmsRequest.setConfirmed(true);
        HttpEntity<UserConfirmsRequest> requestEntity = new HttpEntity<>(userConfirmsRequest);

        ResponseEntity<UserConfirmsResponse> response =
            restTemplate.postForEntity("/confirm/user", requestEntity, UserConfirmsResponse.class);
        assertEquals(HttpStatus.OK, response.getStatusCode());

        GetTransactionInfoResponse transactionInfo = transactionService.getTransactionInfo(transactionId);
        assertEquals(TransactionStatus.COMPLETED, transactionInfo.getStatus());
        assertEquals(123, transactionInfo.getBusinessId().intValue());
        assertEquals(4.0, transactionInfo.getAmount(), 0.001);
        assertEquals(567, transactionInfo.getUserId().intValue());

        assertEquals(2.7, userBalanceDAO.getCurrentBalance(userId), 0.001);
    }

    @Test
    public void userCanDiscardTransactionWithVirtualMoney() throws Exception {
        int userId = 562;
        userBalanceDAO.createUserBalance(userId, 8.5);
        String transactionId = transactionService.createTransaction(123, 6.4).getTransactionId();
        transactionService.scanQrCode(transactionId, userId);

        UserConfirmsRequest userConfirmsRequest = new UserConfirmsRequest();
        userConfirmsRequest.setTransactionId(transactionId);
        userConfirmsRequest.setConfirmed(false);
        HttpEntity<UserConfirmsRequest> requestEntity = new HttpEntity<>(userConfirmsRequest);

        ResponseEntity<UserConfirmsResponse> response =
            restTemplate.postForEntity("/confirm/user", requestEntity, UserConfirmsResponse.class);
        assertEquals(HttpStatus.OK, response.getStatusCode());

        GetTransactionInfoResponse transactionInfo = transactionService.getTransactionInfo(transactionId);
        assertEquals(TransactionStatus.DISCARDED, transactionInfo.getStatus());
        assertEquals(123, transactionInfo.getBusinessId().intValue());
        assertEquals(6.4, transactionInfo.getAmount(), 0.001);
        assertEquals(userId, transactionInfo.getUserId().intValue());

        assertEquals(8.5, userBalanceDAO.getCurrentBalance(userId), 0.001);
    }

    @Test
    public void getPaybackWorks() throws Exception {
        int userId = 458;
        userBalanceDAO.createUserBalance(userId, 6.8);
        String transactionId = transactionService.createTransaction(123, 4.7).getTransactionId();
        transactionService.scanQrCode(transactionId, userId);

        GetPaybackRequest getPaybackRequest = new GetPaybackRequest();
        getPaybackRequest.setTransactionId(transactionId);
        HttpEntity<GetPaybackRequest> requestEntity = new HttpEntity<>(getPaybackRequest);

        ResponseEntity<GetPaybackResponse> getPaybackResponseResponseEntity =
            restTemplate.postForEntity("/payback", requestEntity, GetPaybackResponse.class);
        assertEquals(HttpStatus.OK, getPaybackResponseResponseEntity.getStatusCode());

        GetTransactionInfoResponse transactionInfo = transactionService.getTransactionInfo(transactionId);
        assertEquals(TransactionStatus.PROCESSING, transactionInfo.getStatus());
        assertEquals(TransactionType.REAL_MONEY, transactionInfo.getType());
        assertEquals(123, transactionInfo.getBusinessId().intValue());
        assertEquals(userId, transactionInfo.getUserId().intValue());
        assertEquals(4.7, transactionInfo.getAmount(), 0.001);
        assertEquals(0.5, transactionInfo.getPayback(), 0.001);

        assertEquals(6.8, userBalanceDAO.getCurrentBalance(userId), 0.001);
    }

    @Test
    public void businessCanConfirmTransactionWithRealMoney() throws Exception {
        int userId = 245;
        userBalanceDAO.createUserBalance(245, 9.5);
        String transactionId = transactionService.createTransaction(123, 2.1).getTransactionId();
        transactionService.scanQrCode(transactionId, userId);
        transactionService.getPayback(transactionId);

        BusinessConfirmsRequest request = new BusinessConfirmsRequest();
        request.setTransactionId(transactionId);
        request.setConfirmed(true);
        HttpEntity<BusinessConfirmsRequest> requestEntity = new HttpEntity<>(request);

        ResponseEntity<BusinessConfirmsResponse> businessConfirmsResponseResponseEntity =
            restTemplate.postForEntity("/confirm/business", requestEntity, BusinessConfirmsResponse.class);
        assertEquals(HttpStatus.OK, businessConfirmsResponseResponseEntity.getStatusCode());

        GetTransactionInfoResponse infoResponse = transactionService.getTransactionInfo(transactionId);
        assertEquals(TransactionStatus.COMPLETED, infoResponse.getStatus());
        assertEquals(TransactionType.REAL_MONEY, infoResponse.getType());
        assertEquals(123, infoResponse.getBusinessId().intValue());
        assertEquals(userId, infoResponse.getUserId().intValue());
        assertEquals(2.1, infoResponse.getAmount(), 0.001);
        assertEquals(0.2, infoResponse.getPayback(), 0.001);

        assertEquals(9.7, userBalanceDAO.getCurrentBalance(userId), 0.001);
    }

    @Test
    public void businessCanDiscardTransactionWithRealMoney() throws Exception {
        int userId = 247;
        userBalanceDAO.createUserBalance(userId, 6.8);
        String transactionId = transactionService.createTransaction(123, 3.6).getTransactionId();
        transactionService.scanQrCode(transactionId, userId);
        transactionService.getPayback(transactionId);

        BusinessConfirmsRequest request = new BusinessConfirmsRequest();
        request.setTransactionId(transactionId);
        request.setConfirmed(false);
        HttpEntity<BusinessConfirmsRequest> requestEntity = new HttpEntity<>(request);

        ResponseEntity<BusinessConfirmsResponse> businessConfirmsResponseResponseEntity =
            restTemplate.postForEntity("/confirm/business", requestEntity, BusinessConfirmsResponse.class);
        assertEquals(HttpStatus.OK, businessConfirmsResponseResponseEntity.getStatusCode());

        GetTransactionInfoResponse infoResponse = transactionService.getTransactionInfo(transactionId);
        assertEquals(TransactionStatus.DISCARDED, infoResponse.getStatus());
        assertEquals(TransactionType.REAL_MONEY, infoResponse.getType());
        assertEquals(123, infoResponse.getBusinessId().intValue());
        assertEquals(userId, infoResponse.getUserId().intValue());
        assertEquals(3.6, infoResponse.getAmount(), 0.001);
        assertEquals(0.4, infoResponse.getPayback(), 0.001);

        assertEquals(6.8, userBalanceDAO.getCurrentBalance(userId), 0.001);
    }

    @Test
    public void userCantConfirmTransactionIfBalanceIsSmaller() throws Exception {
        int userId = 367;
        userBalanceDAO.createUserBalance(userId, 1.0);

        String transactionId = transactionService.createTransaction(257, 4.7).getTransactionId();
        transactionService.scanQrCode(transactionId, userId);
        try {
            transactionService.userConfirms(transactionId, true);
            fail("User can confirm transaction with amount bigger than his balance");
        } catch (IllegalStateException ignored) {
            // that's OK
        }

        assertEquals(1.0, userBalanceDAO.getCurrentBalance(userId), 0.001);
        assertEquals(TransactionStatus.FAILED, transactionService.getTransactionInfo(transactionId).getStatus());
    }

    @Test
    public void testTransactionRollback() throws Exception {
        int userId = 358;
        userBalanceDAO.createUserBalance(userId, 30);
        for (int i = 0; i < 500; i++) {
            Transaction transaction = transactionDAO.create(135, 1.0);
            transaction.setStatus(TransactionStatus.COMPLETED);
            transaction.setPaybackAmount(0.2);
            transaction.setType(TransactionType.REAL_MONEY);
            transactionDAO.update(transaction);
        }

        for (int i = 0; i < 70; i++) {
            Transaction transaction = transactionDAO.create(137, 1.0);
            transaction.setStatus(TransactionStatus.COMPLETED);
            transaction.setType(TransactionType.VIRTUAL_MONEY);
            transactionDAO.update(transaction);
        }

        for (int i = 0; i < 100; i++) {
            Transaction transaction = transactionDAO.create(139, 1.0);
            transaction.setType(TransactionType.fromDbValue(Math.abs(ThreadLocalRandom.current().nextInt()) % 3));
            transaction.setStatus(TransactionStatus.DISCARDED);
            transactionDAO.update(transaction);
        }

        assertEquals(30, userBalanceDAO.getCurrentBalance(userId), 0.001);

        String transactionId = transactionService.createTransaction(257, 350.0).getTransactionId();
        transactionService.scanQrCode(transactionId, userId);
        try {
            transactionService.userConfirms(transactionId, true);
            fail("User can confirm transaction with amount bigger than his balance");
        } catch (IllegalStateException ignored) {
            // that's OK
        }
        assertEquals(30, userBalanceDAO.getCurrentBalance(userId), 0.001);
    }
}