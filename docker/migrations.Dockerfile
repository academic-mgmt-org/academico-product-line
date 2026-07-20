FROM postgres:15-alpine

COPY services/academico-esquema-bd/scripts/apply-migrations.sh /usr/local/bin/apply-migrations.sh
RUN sed -i 's/\r$//' /usr/local/bin/apply-migrations.sh \
    && sed -i 's/set -eo pipefail/set -e/' /usr/local/bin/apply-migrations.sh \
    && chmod +x /usr/local/bin/apply-migrations.sh

ENTRYPOINT ["sh"]
CMD ["/usr/local/bin/apply-migrations.sh"]

