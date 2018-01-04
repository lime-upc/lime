package edu.upc.fib.bip.lime.analytics.app;

import edu.upc.fib.bip.lime.analytics.app.repository.elasticsearch.BusinessUsersESRepository;
import org.elasticsearch.client.Client;
import org.elasticsearch.client.transport.TransportClient;
import org.elasticsearch.common.settings.Settings;
import org.elasticsearch.common.transport.InetSocketTransportAddress;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.DependsOn;
import org.springframework.context.annotation.Profile;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.ElasticsearchTemplate;
import org.springframework.data.elasticsearch.repository.config.EnableElasticsearchRepositories;

import java.net.InetAddress;

/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 04.01.18
 */
@Configuration
@EnableElasticsearchRepositories(basePackageClasses = BusinessUsersESRepository.class)
@Profile("!unit")
public class DatasourceConfiguration {

    public static final String ELASTICSEARCH_CLIENT_BEAN_NAME = "esClient";

    @Bean(ELASTICSEARCH_CLIENT_BEAN_NAME)
    public Client client(@Value("${elasticsearch.host}") String EsHost,
                         @Value("${elasticsearch.port}") int EsPort,
                         @Value("${elasticsearch.clustername}") String EsClusterName) throws Exception {
        Settings esSettings = Settings.settingsBuilder()
            .put("cluster.name", EsClusterName)
            //.put("client.transport.ignore_cluster_name", true)
            //.put("client.transport.sniff", true)
            .build();

        return TransportClient.builder()
            .settings(esSettings)
            .build()
            .addTransportAddress(new InetSocketTransportAddress(InetAddress.getByName(EsHost), EsPort));
    }

    @Bean
    @DependsOn(ELASTICSEARCH_CLIENT_BEAN_NAME)
    public ElasticsearchOperations elasticsearchTemplate(Client client) throws Exception {
        return new ElasticsearchTemplate(client);
    }
}
