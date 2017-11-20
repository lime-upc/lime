package edu.upc.fib.bip.lime.processing.utils;

import org.springframework.core.annotation.AliasFor;
import org.springframework.web.bind.annotation.RequestMethod;

import java.lang.annotation.*;

/**
 * Annotation to remove verbosity
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 19.11.17
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@LimeController(method = RequestMethod.GET)
public @interface LimeGetController {

    /**
     * Alias for {@link LimeController#value}.
     */
    @AliasFor(annotation = LimeController.class)
    String[] value() default {};
}
