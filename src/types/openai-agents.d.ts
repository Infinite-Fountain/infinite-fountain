declare module 'openai-agents' {
  export class Agent {
    constructor(config: { name: string; instructions: string; model: string });
  }
  export class Runner {
    static run(agent: Agent, prompt: string): Promise<{ final_output: string }>;
  }
} 