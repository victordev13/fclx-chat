# Fyll Cycle Learning Experience

17 de Abril de 2023

![img](./screenshots/diagrama.png)

------

- Migrations:
  - lib utilizada: [golang-migrate](https://github.com/golang-migrate/migrate)
  - Comando utilizado para inicializar as migrations:
  `make new-migration`
  - no arquivo [query.sql](chatservice/sql/queries/query.sql) são descritos as queries necessárias, com a anotação do método correspondende que vai ser gerado, após preenchido é só executar o comando `cli/sqlc-generate` para gerar o código Go que corresponderá ao "repositório" com os métodos descritos na query.
