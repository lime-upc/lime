package edu.upc.fib.bip.lime.processing.utils;

import org.springframework.core.annotation.AliasFor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestMethod;

import java.lang.annotation.*;

/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 19.11.17
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@LimeController(consumes = MediaType.APPLICATION_JSON_UTF8_VALUE,
                method = RequestMethod.POST)
public @interface LimePostController {

    /**
     * Alias for {@link LimeController#value}.
     */
    @AliasFor(annotation = LimeController.class)
    String[] value() default {};
}
