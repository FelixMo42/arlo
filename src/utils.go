package main

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"text/template"
)

type HttpError struct {
	Code int
	Body string
}

func (e *HttpError) Error() string {
	return fmt.Sprintf("HTTP %d: %s", e.Code, e.Body)
}

func NewHttpError(code int, body string) error {
	return &HttpError{
		Code: code,
		Body: body,
	}
}

func PostJsonStream[Chunk any](url string, body map[string]any, cb func(chunk Chunk) bool) error {
	// build the request body
	payload, err := json.Marshal(body)
	if err != nil {
		return NewHttpError(500, "PostJsonStream failed (id: payload)!")
	}

	// send the request
	resp, err := http.Post(url, "application/json", bytes.NewBuffer(payload))
	if err != nil {
		return NewHttpError(500, "PostJsonStream failed (id: resp)!")
	}
	defer resp.Body.Close()

	// make sure the server is giving us the okay
	if resp.StatusCode != http.StatusOK {
		return NewHttpError(500, "PostJsonStream failed (id: resp.StatusCode)!")
	}

	// iterate over each chunk
	reader := bufio.NewReader(resp.Body)
	for {
		// read the chunk
		chunk, err := reader.ReadBytes('\n')
		if err != nil {
			return NewHttpError(500, "PostJsonStream failed (id: chunk)!")
		}
		var prasedChunk Chunk
		json.Unmarshal([]byte(chunk), &prasedChunk)

		// ask the callback if we should keep going
		if cb(prasedChunk) {
			break
		}
	}

	return nil
}

func MD(file string, data any) string {
	t, err := template.ParseFiles("llm/" + file + ".md")
	if err != nil {
		panic("ERROR getting " + file + " for MD")
	}

	var buf bytes.Buffer
	err = t.Execute(&buf, data)
	if err != nil {
		panic("ERROR getting " + file + " for MD")
	}

	return buf.String()
}
