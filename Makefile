.PHONY: env up

up:
	cd chatservice && docker compose up -d
	cd web && docker compose up -d
	cd chatservice && make migrate
	cd web && make migrations-dev

env:
	cp -n web/.env.example web/.env
	cp -n chatservice/.env.example chatservice/.env
