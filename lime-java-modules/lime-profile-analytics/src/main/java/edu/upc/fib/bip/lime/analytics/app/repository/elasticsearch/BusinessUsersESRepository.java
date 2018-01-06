package edu.upc.fib.bip.lime.analytics.app.repository.elasticsearch;

import edu.upc.fib.bip.lime.analytics.app.model.TypicalUser;
import edu.upc.fib.bip.lime.analytics.app.model.elasticsearch.BusinessUsersESEntity;
import org.springframework.data.elasticsearch.repository.ElasticsearchCrudRepository;

/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 04.01.18
 */
public interface BusinessUsersESRepository extends ElasticsearchCrudRepository<BusinessUsersESEntity, String> {
}
