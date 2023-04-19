new-migration:
	cli/migrate create -ext=sql -dir=sql/migrations -seq init

migrate:
	cli/migrate -verbose up

migratedown:
	cli/migrate -verbose drop

grpc:
	protoc --go_out=. --go-grpc_out=. proto/chat.proto

.PHONY: migrate new-migration migratedown grpc
