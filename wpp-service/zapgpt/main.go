package main

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"errors"
	"io/ioutil"
	"net/http"
	"net/url"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/joho/godotenv"
)

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type GptRequest struct {
	Model     string    `json:"model"`
	Messages  []Message `json:"messages"`
	MaxTokens int       `json:"max_tokens,omitempty"`
}

type GptResponse struct {
	ID      string   `json:"id"`
	Object  string   `json:"object"`
	Created string   `json:"created"`
	Choices []Choice `json:"choices"`
}

type Choice struct {
	Index   int `json:"index"`
	Message struct {
		Role    string `json:"role"`
		Content string `json:"content"`
	} `json:"message"`
}

func AskToGPT(query string) (string, error) {
	req := GptRequest{
		Model: "gpt-3.5-turbo",
		Messages: []Message{
			{
				Role:    "user",
				Content: query,
			},
		},
		MaxTokens: 100,
	}

	reqJson, err := json.Marshal(req)

	if err != nil {
		return "", err
	}

	request, err := http.NewRequest("POST",
		"https://api.openai.com/v1/chat/completions",
		bytes.NewBuffer(reqJson),
	)
	if err != nil {
		return "", err
	}

	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("Authorization", "Bearer " + os.Getenv("CHATGPT_API_KEY"))

	response, err := http.DefaultClient.Do(request)
	if err != nil {
		return "", err
	}

	defer response.Body.Close()
	responseBody, err := ioutil.ReadAll(response.Body)
	if err != nil {
		return "", err
	}

	var responseContent GptResponse
	err = json.Unmarshal(responseBody, &responseContent)
	if err != nil {
		return "", err
	}

	return responseContent.Choices[0].Message.Content, nil
}

func process(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	err := godotenv.Load(".env")
	if err != nil {
		panic(".env doesn't exist")
	}

	result, err := twilioResponseDecode(request.Body)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
			Body:       err.Error(),
		}, nil
	}

	text, err := AskToGPT(result)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
			Body:       err.Error(),
		}, nil
	}

	return events.APIGatewayProxyResponse{
		StatusCode: http.StatusOK,
		Body:       text,
	}, nil
}

func twilioResponseDecode(response string) (string, error) {
	bytes, err := base64.StdEncoding.DecodeString(response)
	if err != nil {
		return "", err
	}

	data, err := url.ParseQuery(string(bytes))
	if err != nil {
		return "", err
	}

	if data.Has("Body") {
		return data.Get("Body"), nil
	}

	return "", errors.New("body not found")
}

func main() {
	lambda.Start(process)
}
