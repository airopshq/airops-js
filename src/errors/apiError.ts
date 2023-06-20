export class ApiError extends Error {
  status: number;

  constructor(error: { status: number; message: string }) {
    super(error.message);
    this.status = error.status;
  }
}
