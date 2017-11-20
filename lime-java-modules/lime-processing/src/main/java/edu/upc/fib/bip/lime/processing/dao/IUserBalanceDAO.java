package edu.upc.fib.bip.lime.processing.dao;

/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 19.11.17
 */
public interface IUserBalanceDAO {

    void substractPointsFromUserBalance(int userId, double points);

    void addPointsToUserBalance(int userId, double points);

    void createUserBalance(int userId);

    void createUserBalance(int userId, double currentBalance);

    double getCurrentBalance(int userId);

    void setUserBalance(int userId, double currentBalance);
}
