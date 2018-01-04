package edu.upc.fib.bip.lime.model;

/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 24.12.17
 */
public enum Gender {
    MALE,
    FEMALE,
    UNDEFINED;

    public Gender another() {
        switch (this) {
            case MALE:
                return FEMALE;
            case FEMALE:
                return MALE;
            default:
                return UNDEFINED;
        }
    }
}
