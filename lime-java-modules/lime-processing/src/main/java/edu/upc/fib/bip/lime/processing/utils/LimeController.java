package edu.upc.fib.bip.lime.processing.utils;

import org.springframework.core.annotation.AliasFor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import java.lang.annotation.*;

/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 19.11.17
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@RequestMapping(
                produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
public @interface LimeController {

    /**
     * Alias for {@link RequestMapping#value}.
     */
    @AliasFor(annotation = RequestMapping.class)
    String[] value() default {};

    /**
     * Alias for {@link RequestMapping#method}.
     */
    @AliasFor(annotation = RequestMapping.class)
    RequestMethod[] method() default {};

    /**
     * Alias for {@link RequestMapping#consumes()}.
     */
    @AliasFor(annotation = RequestMapping.class)
    String[] consumes() default {};
}
