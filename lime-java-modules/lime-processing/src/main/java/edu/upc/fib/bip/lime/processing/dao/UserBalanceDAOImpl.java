package edu.upc.fib.bip.lime.processing.dao;

import edu.upc.fib.bip.lime.processing.model.UserBalance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 19.11.17
 */
@Repository
public class UserBalanceDAOImpl implements IUserBalanceDAO {

    private static final RowMapper<UserBalance> ROW_MAPPER = (rs, rowNum) -> {
        UserBalance userBalance = new UserBalance();
        userBalance.setUserId(rs.getInt("UserID"));
        userBalance.setBalance(rs.getDouble("Balance"));
        return userBalance;
    };

    @Autowired
    private JdbcTemplate sql;

    @Override
    public void substractPointsFromUserBalance(int userId, double points) {
        if (points < 0) {
            throw new IllegalArgumentException(String.format("Can't substract %s points from user %d", points, userId));
        }

        double currentBalance = getCurrentBalance(userId);
        if (currentBalance < points) {
            throw new IllegalStateException(String.format(
                "Can't substract %s points for user %d, current balance is %s", points, userId, currentBalance));
        }

        sql.update("UPDATE UserBalance SET Balance = Balance - ?1 WHERE UserID = ?2", points, userId);
    }

    @Override
    public void addPointsToUserBalance(int userId, double points) {
        if (points < 0) {
            throw new IllegalArgumentException("Can't add " + points + " points to user " + userId);
        }
        sql.update("UPDATE UserBalance SET Balance = Balance + ?1 WHERE UserID = ?2", points, userId);
    }

    @Override
    public void createUserBalance(int userId) {
        createUserBalance(userId, 0);
    }

    @Override
    public void createUserBalance(int userId, double currentBalance) {
        sql.update("INSERT INTO UserBalance(UserID, Balance) VALUES (?1, ?2)", userId, currentBalance);
    }

    @Override
    public double getCurrentBalance(int userId) {
        return sql.queryForObject("SELECT Balance FROM UserBalance WHERE UserID = ?",
            new Object[]{userId}, Double.class);
    }

    @Override
    public void setUserBalance(int userId, double currentBalance) {
        sql.update("UPDATE UserBalance SET Balance = ?1 WHERE UserID = ?2", userId, currentBalance);
    }

    @Override
    public Optional<UserBalance> findByUser(int userId) {
        return sql.query("SELECT * FROM UserBalance WHERE UserID = ?", ROW_MAPPER, userId)
            .stream()
            .findFirst();
    }
}
