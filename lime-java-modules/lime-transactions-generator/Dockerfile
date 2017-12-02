FROM openjdk:8-jdk

RUN useradd -d /app -m -s /bin/bash ubuntu
WORKDIR /app

ADD ./app/transaction-generator.jar /app/transaction-generator.jar

ADD ./start.sh /app/start.sh
RUN ["chmod", "+x", "/app/start.sh"]

ENTRYPOINT ["/app/start.sh"]