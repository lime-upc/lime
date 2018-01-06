package edu.upc.fib.bip.lime.analytics.app;

import com.mongodb.MongoClient;
import com.mongodb.MongoClientOptions;
import com.mongodb.MongoClientURI;
import com.mongodb.client.MongoDatabase;
import com.mongodb.spark.MongoClientFactory;
import com.mongodb.spark.MongoConnector;
import com.mongodb.spark.config.MongoSharedConfig;
import com.mongodb.spark.config.ReadConfig;
import com.mongodb.spark.connection.DefaultMongoClientFactory;
import org.apache.spark.SparkConf;
import org.bson.codecs.configuration.CodecRegistry;
import scala.Option;

import java.io.Serializable;
import java.lang.reflect.Constructor;
import java.util.Map;

/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 05.01.18
 */
public class HackedMongoConnector extends MongoConnector implements Serializable {

    private transient CodecRegistry codecRegistry;

    public HackedMongoConnector(ReadConfig readConfig, CodecRegistry codecRegistry) {
        super(new HackedMongoClientFactory(
            ReadConfig.stripPrefix(readConfig.asOptions()).get(MongoSharedConfig.mongoURIProperty()).get(),
            Integer.parseInt(ReadConfig.stripPrefix(readConfig.asOptions()).get(ReadConfig.localThresholdProperty()).get()),
            codecRegistry
        ));
        this.codecRegistry = codecRegistry;
    }

    @Override
    public CodecRegistry codecRegistry() {
        return codecRegistry;
    }

    private static class HackedMongoClientFactory implements MongoClientFactory {

        private String mongoURI;
        private int localThreshold;
        private transient CodecRegistry codecRegistry;

        public HackedMongoClientFactory(String mongoURI, int localThreshold, CodecRegistry codecRegistry) {
            this.mongoURI = mongoURI;
            this.localThreshold = localThreshold;
            this.codecRegistry = codecRegistry;
        }

        @Override
        public MongoClient create() {
            MongoClientOptions.Builder builder = MongoClientOptions.builder()
                .localThreshold(localThreshold)
                .codecRegistry(codecRegistry);
            MongoClient mongoClient = new HackedMongoClient(new MongoClientURI(mongoURI, builder), codecRegistry);
            return mongoClient;
        }

        private static class HackedMongoClient extends MongoClient {

            private transient CodecRegistry codecRegistry;

            public HackedMongoClient(MongoClientURI uri, CodecRegistry codecRegistry) {
                super(uri);
                this.codecRegistry = codecRegistry;
            }

            @Override
            public MongoDatabase getDatabase(String databaseName) {
                return super.getDatabase(databaseName).withCodecRegistry(codecRegistry);
            }
        }
    }
}
