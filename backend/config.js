//LIME Server config file. Please, DO NOT SUBMIT IT TO GITHUB.
//Change the name to config.js!!

module.exports = {
    db: "mongodb://localhost/lime",
    db_test: "mongodb://localhost/lime-test",
    port: "3000",
    jwtsecret: "SECRET",
    kafka_enabled: true,
    kafka_host: "192.168.56.20:2181"
};

