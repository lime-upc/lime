package edu.upc.fib.bip.lime.processing.web;

import edu.upc.fib.bip.lime.processing.dao.ITransactionDAO;
import edu.upc.fib.bip.lime.processing.dao.IUserBalanceDAO;
import edu.upc.fib.bip.lime.processing.model.Transaction;
import edu.upc.fib.bip.lime.processing.model.TransactionStatus;
import edu.upc.fib.bip.lime.processing.model.TransactionType;
import edu.upc.fib.bip.lime.processing.service.ITransactionService;
import edu.upc.fib.bip.lime.processing.web.protocol.*;
import edu.upc.fib.bip.lime.processing.web.utils.LimeProcessingResponseListTransactionWrapper;
import edu.upc.fib.bip.lime.processing.web.utils.LimeProcessingResponseTransactionWrapper;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.boot.autoconfigure.jdbc.EmbeddedDatabaseConnection;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.context.annotation.Bean;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import java.util.Map;
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
        LimeProcessingResponseTransactionWrapper response =
            restTemplate.getForEntity("/info/1", LimeProcessingResponseTransactionWrapper.class).getBody();
        assertFalse(response.isError());
        Transaction transaction = response.getMessage();

        assertEquals(1, transaction.getBusinessId().intValue());
        assertEquals(3.5, transaction.getPaymentAmount(), 0.001);
    }

    @Test
    public void newTransactionCreationReturnsTransactionID() throws Exception {
        CreateTransactionRequest request = new CreateTransactionRequest();
        request.setBusinessId(2);
        request.setAmount(3.0);
        HttpEntity<CreateTransactionRequest> requestEntity = new HttpEntity<>(request);

        ResponseEntity<LimeProcessingResponseWrapper> responseEntity =
            restTemplate.postForEntity("/start", requestEntity, LimeProcessingResponseWrapper.class);
        LimeProcessingResponseWrapper response = responseEntity.getBody();

        String transactionId = ((String) response.getMessage());

        assertNotNull(transactionId);
        Transaction infoResponse = transactionService.getTransactionInfo(transactionId).get();
        assertEquals(request.getBusinessId(), infoResponse.getBusinessId().intValue());
        assertEquals(request.getAmount(), infoResponse.getPaymentAmount(), 0.001);
        assertEquals(TransactionStatus.NEW, infoResponse.getStatus());
        assertNotNull(infoResponse.getStartedAt());
        assertNull(infoResponse.getFinishedAt());
    }

    @Test
    public void userCanConfirmTransactionWithVirtualMoney() throws Exception {
        int userId = 567;
        userBalanceDAO.createUserBalance(userId, 6.7);
        String transactionId = transactionService.createTransaction(123, 4.0);

        UserConfirmsRequest userConfirmsRequest = new UserConfirmsRequest();
        userConfirmsRequest.setTransactionId(transactionId);
        userConfirmsRequest.setUserId(userId);
        userConfirmsRequest.setConfirmed(true);
        HttpEntity<UserConfirmsRequest> requestEntity = new HttpEntity<>(userConfirmsRequest);

        ResponseEntity<LimeProcessingResponseTransactionWrapper> response =
            restTemplate.exchange("/confirm/user", HttpMethod.PATCH, requestEntity,
                LimeProcessingResponseTransactionWrapper.class);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertFalse(response.getBody().isError());

        Transaction transaction = response.getBody().getMessage();
        Transaction transactionInfo = transactionService.getTransactionInfo(transactionId).get();
        assertEquals(transaction, transactionInfo);
        assertEquals(2.7, userBalanceDAO.getCurrentBalance(userId), 0.001);
    }

    @Test
    public void userCanDiscardTransactionWithVirtualMoney() throws Exception {
        int userId = 562;
        userBalanceDAO.createUserBalance(userId, 8.5);
        String transactionId = transactionService.createTransaction(123, 6.4);

        UserConfirmsRequest userConfirmsRequest = new UserConfirmsRequest();
        userConfirmsRequest.setTransactionId(transactionId);
        userConfirmsRequest.setUserId(userId);
        userConfirmsRequest.setConfirmed(false);
        HttpEntity<UserConfirmsRequest> requestEntity = new HttpEntity<>(userConfirmsRequest);

        ResponseEntity<LimeProcessingResponseTransactionWrapper> response =
            restTemplate.exchange("/confirm/user", HttpMethod.PATCH, requestEntity, LimeProcessingResponseTransactionWrapper.class);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertFalse(response.getBody().isError());
        Transaction transaction = response.getBody().getMessage();
        Transaction transactionInfo = transactionService.getTransactionInfo(transactionId).get();
        assertEquals(transaction, transactionInfo);
        assertEquals(8.5, userBalanceDAO.getCurrentBalance(userId), 0.001);
    }

    @Test
    public void getPaybackWorks() throws Exception {
        int userId = 458;
        userBalanceDAO.createUserBalance(userId, 6.8);
        String transactionId = transactionService.createTransaction(123, 4.7);

        GetPaybackRequest getPaybackRequest = new GetPaybackRequest();
        getPaybackRequest.setTransactionId(transactionId);
        getPaybackRequest.setUserId(userId);
        HttpEntity<GetPaybackRequest> requestEntity = new HttpEntity<>(getPaybackRequest);

        ResponseEntity<LimeProcessingResponseTransactionWrapper> responseEntity =
            restTemplate.exchange("/payback", HttpMethod.PATCH, requestEntity, LimeProcessingResponseTransactionWrapper.class);
        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        assertFalse(responseEntity.getBody().isError());
        Transaction transaction = responseEntity.getBody().getMessage();

        Transaction transactionInfo = transactionService.getTransactionInfo(transactionId).get();
        assertEquals(transaction, transactionInfo);
        assertEquals(6.8, userBalanceDAO.getCurrentBalance(userId), 0.001);
    }

    @Test
    public void businessCanConfirmTransactionWithRealMoney() throws Exception {
        int userId = 245;
        userBalanceDAO.createUserBalance(245, 9.5);
        String transactionId = transactionService.createTransaction(123, 2.1);
        transactionService.getPayback(transactionId, userId);

        BusinessConfirmsRequest request = new BusinessConfirmsRequest();
        request.setTransactionId(transactionId);
        request.setConfirmed(true);
        HttpEntity<BusinessConfirmsRequest> requestEntity = new HttpEntity<>(request);

        ResponseEntity<LimeProcessingResponseTransactionWrapper> responseEntity =
            restTemplate.exchange("/confirm/business", HttpMethod.PATCH,
                requestEntity, LimeProcessingResponseTransactionWrapper.class);
        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        assertFalse(responseEntity.getBody().isError());
        Transaction transaction = responseEntity.getBody().getMessage();

        Transaction transactionInfo = transactionService.getTransactionInfo(transactionId).get();
        assertEquals(transaction, transactionInfo);
        assertEquals(9.7, userBalanceDAO.getCurrentBalance(userId), 0.001);
    }

    @Test
    public void businessCanDiscardTransactionWithRealMoney() throws Exception {
        int userId = 247;
        userBalanceDAO.createUserBalance(userId, 6.8);
        String transactionId = transactionService.createTransaction(123, 3.6);
        transactionService.getPayback(transactionId, userId);

        BusinessConfirmsRequest request = new BusinessConfirmsRequest();
        request.setTransactionId(transactionId);
        request.setConfirmed(false);
        HttpEntity<BusinessConfirmsRequest> requestEntity = new HttpEntity<>(request);

        ResponseEntity<LimeProcessingResponseTransactionWrapper> responseEntity =
            restTemplate.exchange("/confirm/business", HttpMethod.PATCH,
                requestEntity, LimeProcessingResponseTransactionWrapper.class);
        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        assertFalse(responseEntity.getBody().isError());
        Transaction transaction = responseEntity.getBody().getMessage();

        Transaction transactionInfo = transactionService.getTransactionInfo(transactionId).get();
        assertEquals(transaction, transactionInfo);

        assertEquals(6.8, userBalanceDAO.getCurrentBalance(userId), 0.001);
    }

    @Test
    public void userCantConfirmTransactionIfBalanceIsSmaller() throws Exception {
        int userId = 367;
        userBalanceDAO.createUserBalance(userId, 1.0);

        String transactionId = transactionService.createTransaction(257, 4.7);
        try {
            transactionService.userConfirms(transactionId, userId, true);
            fail("User can confirm transaction with amount bigger than his balance");
        } catch (IllegalStateException ignored) {
            // that's OK
        }

        assertEquals(1.0, userBalanceDAO.getCurrentBalance(userId), 0.001);
        Transaction transactionInfo = transactionService.getTransactionInfo(transactionId).get();
        assertEquals(TransactionStatus.FAILED, transactionInfo.getStatus());
        assertNotNull(transactionInfo.getStartedAt());
        assertNotNull(transactionInfo.getFinishedAt());
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

        String transactionId = transactionService.createTransaction(257, 350.0);
        try {
            transactionService.userConfirms(transactionId, userId, true);
            fail("User can confirm transaction with amount bigger than his balance");
        } catch (IllegalStateException ignored) {
            // that's OK
        }
        assertEquals(30, userBalanceDAO.getCurrentBalance(userId), 0.001);
    }

    @Test
    public void userBalanceControllerShouldReturnUserBalance() throws Exception {
        int userId = 353;
        userBalanceDAO.createUserBalance(userId, 4.7);
        LimeProcessingResponseWrapper<Double> responseWrapper =
            restTemplate.getForObject("/balance?user={userId}", LimeProcessingResponseWrapper.class, userId);
        Double balance = responseWrapper.getMessage();
        assertEquals(4.7, balance, 0.001);
    }

    @Test
    public void transactionsControllerShouldReturnListOfTransactionsByFilter() throws Exception {
        for (int i = 10; i < 20; i++) {
            userBalanceDAO.createUserBalance(i, 15000.0);
        }
        for (int i = 0; i < 100; i++) {
            String transactionId = transactionService.createTransaction((i % 2) + 2849, 1.0);
            transactionService.userConfirms(transactionId, (i / 2 % 10) + 10, (i / 2) % 2 == 0 );
        }

        LimeProcessingResponseListTransactionWrapper byBusiness =
            restTemplate.getForObject("/transactions?boid={boid}",
                LimeProcessingResponseListTransactionWrapper.class, 2849);

        assertEquals(50, byBusiness.getMessage().size());


        LimeProcessingResponseListTransactionWrapper byBusinessAndUser =
            restTemplate.getForObject("/transactions?boid={boid}&user={user}",
                LimeProcessingResponseListTransactionWrapper.class, 2849, 17);

        assertEquals(5, byBusinessAndUser.getMessage().size());
    }
}