FROM golang:1.20.3

# Disclaimer: usando o Rust somente para compilar a lib que faz
# a conexão com o openapi (github.com/j178/tiktoken-go)

# Set environment variables
ENV PATH="/root/.cargo/bin:${PATH}"
ENV USER=root

# Install Rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y \
  && rustup default stable \
  && rustup target add x86_64-unknown-linux-gnu

WORKDIR /go/src
RUN ln -sf /bin/bash /bin/sh
COPY go.mod go.sum ./
RUN go mod download && go mod verify
COPY . .

# Instal Protoc to compile gRPC
RUN apt-get update && \
    apt-get install -y protobuf-compiler
RUN GO111MODULE=on \
    go get google.golang.org/protobuf/cmd/protoc-gen-go@latest \
    google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest

RUN cd /go/pkg/mod/github.com/j178/tiktoken-go@v0.2.1/tiktoken-cffi && \
  cargo build --release

CMD ["go", "run", "cmd/chatservice/main.go"]
