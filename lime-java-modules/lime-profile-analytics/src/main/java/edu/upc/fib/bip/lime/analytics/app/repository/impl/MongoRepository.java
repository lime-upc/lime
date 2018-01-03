package edu.upc.fib.bip.lime.analytics.app.repository.impl;

import com.mongodb.MongoClient;
import com.mongodb.ServerAddress;
import com.mongodb.client.MongoDatabase;
import org.bson.codecs.configuration.CodecRegistry;
import org.bson.codecs.pojo.PojoCodecProvider;

import static org.bson.codecs.configuration.CodecRegistries.fromProviders;
import static org.bson.codecs.configuration.CodecRegistries.fromRegistries;

/**
 * @author Elizaveta Ketova <elizabeth.ooh@gmail.com>
 * @since 27.12.17
 */
public class MongoRepository {

    protected MongoDatabase database;

    public MongoRepository(String dbUrl,
                           String dbName) {
        CodecRegistry pojoCodecRegistry = fromRegistries(MongoClient.getDefaultCodecRegistry(),
            fromProviders(PojoCodecProvider.builder().automatic(true).build()));

        MongoClient mongoClient = new MongoClient(dbUrl);
        database = mongoClient.getDatabase(dbName)
            .withCodecRegistry(pojoCodecRegistry);
    }
}
