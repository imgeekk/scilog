export type AskCitation = {
  id: string;
  createdAt: string;
  tag: string;
  excerpt: string;
};

export type AskState = {
  status:
    | "idle"
    | "success"
    | "validation_error"
    | "no_matches"
    | "missing_api_key"
    | "invalid_api_key"
    | "server_error";
  message?: string;
  question?: string;
  answer?: string;
  citations?: AskCitation[];
};

export const INITIAL_ASK_STATE: AskState = {
  status: "idle",
};

export type GroqKeyState = {
  status: "idle" | "success" | "removed" | "validation_error" | "invalid_key" | "server_error";
  message?: string;
};

export const INITIAL_GROQ_KEY_STATE: GroqKeyState = {
  status: "idle",
};
