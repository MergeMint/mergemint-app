export type ChatMessage = {
  role: 'system' | 'user';
  content: string;
};

export interface LLMClient {
  complete(model: string, messages: ChatMessage[]): Promise<string>;
}

export class OpenAICompatibleClient implements LLMClient {
  constructor(
    private readonly apiKey: string,
    private readonly baseUrl: string = 'https://api.openai.com/v1',
  ) {
    if (!apiKey) {
      throw new Error('Missing OpenAI compatible API key');
    }
  }

  async complete(model: string, messages: ChatMessage[]) {
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0,
        response_format: { type: 'json_object' },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(
        `LLM call failed: ${res.status} ${res.statusText} - ${text}`,
      );
    }

    const json = await res.json();
    const content =
      json.choices?.[0]?.message?.content ?? json.choices?.[0]?.message?.text;

    if (!content) {
      throw new Error('LLM response missing content');
    }

    return content;
  }
}
