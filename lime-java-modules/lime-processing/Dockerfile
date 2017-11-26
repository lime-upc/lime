FROM openjdk:8-jdk

RUN useradd -d /app -m -s /bin/bash ubuntu
WORKDIR /app

ADD ./app/processing.jar /app/processing.jar

EXPOSE 8080

ENTRYPOINT ["/usr/bin/java"]
CMD ["-jar", "/app/processing.jar"]