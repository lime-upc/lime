package edu.upc.fib.bip.lime.analytics.app.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

import java.util.UUID;

/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 02.01.18
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class TypicalUser {

    /* data fields */
    @Field(type = FieldType.Integer)
    private Integer age;
    @Field(type = FieldType.Integer)
    private Integer gender;
    @Field(type = FieldType.Double)
    private Double averageCheck;
    @Field(type = FieldType.Integer)
    private Long averageTime;

    /* stat fields */
    @Field(type = FieldType.Integer)
    private Integer quantity;
    @Field(type = FieldType.Double)
    private Double percentage;
}
