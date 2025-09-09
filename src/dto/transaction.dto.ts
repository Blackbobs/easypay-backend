export interface UpdateTransactionBody {
  status?: "failed" | "pending" | "success";
}

export interface UpdateTransactionParams {
  id?: string;
}
