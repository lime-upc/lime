package edu.upc.fib.bip.lime.analytics.app.model.elasticsearch;

import edu.upc.fib.bip.lime.analytics.app.model.TypicalUser;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

import java.util.List;
import java.util.UUID;

/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 04.01.18
 */
@Getter
@Setter
@NoArgsConstructor
@ToString
@Document(indexName = "lime", type = "typical-users")
public class BusinessUsersESEntity {
    @Id
    private String id = UUID.randomUUID().toString().replace("-", "");

    private String email;
    @Field(type = FieldType.Nested)
    private List<TypicalUser> typicalUsers;
}
