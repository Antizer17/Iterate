import { Ollama } from "ollama";

const client = new Ollama({
  host: "http://127.0.0.1:11434",
});

try {
  const response = await client.generate({
    model: "llama3",
    prompt: "Say hello in one sentence.",
  });

  console.log(response.response);
} catch (err) {
  console.error(err);
}