package edu.upc.fib.bip.lime.analytics.app;

import com.mongodb.MongoClient;
import com.mongodb.spark.MongoConnector;
import com.mongodb.spark.MongoSpark;
import com.mongodb.spark.config.ReadConfig;
import com.mongodb.spark.rdd.api.java.JavaMongoRDD;
import edu.upc.fib.bip.lime.analytics.app.repository.TransactionRepository;
import edu.upc.fib.bip.lime.analytics.app.repository.UserRepository;
import edu.upc.fib.bip.lime.analytics.app.repository.elasticsearch.BusinessUsersESRepository;
import edu.upc.fib.bip.lime.analytics.app.repository.impl.TransactionRepositoryImpl;
import edu.upc.fib.bip.lime.analytics.app.repository.impl.UsersRepositoryImpl;
import edu.upc.fib.bip.lime.model.Transaction;
import edu.upc.fib.bip.lime.model.User;
import org.apache.spark.SparkConf;
import org.apache.spark.SparkContext;
import org.apache.spark.api.java.JavaSparkContext;
import org.apache.spark.sql.SparkSession;
import org.bson.codecs.configuration.CodecRegistry;
import org.bson.codecs.pojo.PojoCodecProvider;
import org.bson.conversions.Bson;
import org.elasticsearch.client.Client;
import org.elasticsearch.client.transport.TransportClient;
import org.elasticsearch.common.settings.Settings;
import org.elasticsearch.common.transport.InetSocketTransportAddress;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.EnvironmentAware;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.DependsOn;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.ElasticsearchTemplate;
import org.springframework.data.elasticsearch.repository.config.EnableElasticsearchRepositories;
import scala.collection.JavaConverters;

import java.net.InetAddress;
import java.util.HashMap;
import java.util.Map;

import static org.bson.codecs.configuration.CodecRegistries.fromProviders;
import static org.bson.codecs.configuration.CodecRegistries.fromRegistries;
import static scala.collection.JavaConverters.mapAsJavaMapConverter;

/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 04.01.18
 */
@Configuration
@EnableElasticsearchRepositories(basePackageClasses = BusinessUsersESRepository.class)
@Profile("!unit")
public class DatasourceConfiguration {

    public static final String ELASTICSEARCH_CLIENT_BEAN_NAME = "esClient";
    public static final String MONGO_CONNECTION_FORMAT = "mongodb://%s";

    @Value("${mongodb.url}")
    private String dbUrl;
    @Value("${mongodb.name}")
    private String dbName;
    @Value("${mongodb.collections.users}")
    private String usersCollectionName;
    @Value("${mongodb.collections.transactions}")
    private String transactionsCollectionName;

    @Bean(ELASTICSEARCH_CLIENT_BEAN_NAME)
    public Client client(@Value("${elasticsearch.host}") String EsHost,
                         @Value("${elasticsearch.port}") int EsPort,
                         @Value("${elasticsearch.clustername}") String EsClusterName) throws Exception {
        Settings esSettings = Settings.settingsBuilder()
            .put("cluster.name", EsClusterName)
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

    @Bean
    public TransactionRepository transactionRepository(@Value("${mongodb.url}") String dbUrl,
                                                       @Value("${mongodb.name}") String dbName,
                                                       @Value("${mongodb.collections.transactions}") String transactionsCollection) {
        return new TransactionRepositoryImpl(dbUrl, dbName, transactionsCollection);
    }

    @Bean
    public UserRepository userRepository() {
        return new UsersRepositoryImpl(dbUrl, dbName, usersCollectionName);
    }

    @Bean
    public SparkSession sparkSession() {
        return SparkSession.builder()
            .master("local[*]")
            .appName("asdgaefh")
            .config("spark.mongodb.input.uri", String.format(MONGO_CONNECTION_FORMAT, dbUrl))
            .config("spark.mongodb.input.database", dbName)
            .config("spark.mongodb.input.collection", "none")
            .getOrCreate();
    }

    @Bean
    public JavaMongoRDD<User> usersRDD(SparkSession sparkSession) {
        JavaSparkContext jsc = new JavaSparkContext(sparkSession.sparkContext());

        Map<String, String> readOverrides = new HashMap<>();
        //readOverrides.put("uri", String.format(MONGO_CONNECTION_FORMAT, dbUrl));
        //readOverrides.put("database", dbName);
        readOverrides.put("collection", usersCollectionName);
        readOverrides.put("readPreference.name", "secondaryPreferred");
        ReadConfig readConfig = ReadConfig.create(sparkSession).withOptions(readOverrides);

        MongoConnector mongoConnector = new HackedMongoConnector(readConfig, fromRegistries(MongoClient.getDefaultCodecRegistry(),
            fromProviders(PojoCodecProvider.builder().register(User.class).build())));

        MongoSpark mongoSpark = MongoSpark.builder()
            .javaSparkContext(jsc)
            .connector(mongoConnector)
            .readConfig(readConfig)
            .build();
        return mongoSpark.toJavaRDD(User.class);
    }

    @Bean
    public JavaMongoRDD<Transaction> transactionsRDD(SparkSession sparkSession) {
        JavaSparkContext jsc = new JavaSparkContext(sparkSession.sparkContext());

        Map<String, String> readOverrides = new HashMap<>();
        //readOverrides.put("spark.mongodb.input.uri", String.format(MONGO_CONNECTION_FORMAT, dbUrl));
        //readOverrides.put("spark.mongodb.input.database", dbName);
        readOverrides.put("collection", transactionsCollectionName);
        readOverrides.put("readPreference.name", "secondaryPreferred");
        ReadConfig readConfig = ReadConfig.create(jsc).withOptions(readOverrides);

        MongoConnector mongoConnector = new HackedMongoConnector(readConfig, fromRegistries(MongoClient.getDefaultCodecRegistry(),
            fromProviders(PojoCodecProvider.builder().register(Transaction.class).build())));

        MongoSpark mongoSpark = MongoSpark.builder()
            .javaSparkContext(jsc)
            .connector(mongoConnector)
            .readConfig(readConfig)
            .build();
        return mongoSpark.toJavaRDD(Transaction.class);
    }
}
