export type CreateLogState = {
  status: "idle" | "success" | "validation_error" | "server_error";
  message?: string;
};

export const INITIAL_CREATE_LOG_STATE: CreateLogState = {
  status: "idle",
};