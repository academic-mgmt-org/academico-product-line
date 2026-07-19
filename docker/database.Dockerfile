FROM postgres:15-alpine

RUN apk add --no-cache openssl

COPY services/academico-esquema-bd/scripts/postgres-ssl-entrypoint.sh /usr/local/bin/postgres-ssl-entrypoint.sh
RUN sed -i 's/\r$//' /usr/local/bin/postgres-ssl-entrypoint.sh \
    && chmod +x /usr/local/bin/postgres-ssl-entrypoint.sh

ENTRYPOINT ["postgres-ssl-entrypoint.sh"]
CMD ["postgres"]

