export interface UpdateTransactionBody {
  status?: "failed" | "pending" | "successful";
}

export interface UpdateTransactionParams {
  id?: string;
}
