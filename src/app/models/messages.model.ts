export type MessageSeverity = "danger" | "warning" | "info" | "success";

export type Message = {
  severity: MessageSeverity;
  text: string;
}

