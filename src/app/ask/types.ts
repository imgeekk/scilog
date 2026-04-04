export type AskCitation = {
  id: string;
  createdAt: string;
  tag: string;
  excerpt: string;
};

export type AskState = {
  status: "idle" | "success" | "validation_error" | "no_matches" | "server_error";
  message?: string;
  question?: string;
  answer?: string;
  citations?: AskCitation[];
};

export const INITIAL_ASK_STATE: AskState = {
  status: "idle",
};
