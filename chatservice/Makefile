new-migration:
	cli/migrate create -ext=sql -dir=sql/migrations -seq init

migrate:
	cli/migrate -verbose up

migratedown:
	cli/migrate -verbose drop

grpc:
	docker compose exec chatservice protoc --go_out=. --go-grpc_out=. proto/chat.proto --experimental_allow_proto3_optional

.PHONY: migrate new-migration migratedown grpc
