export class RateLimitError extends Error {
    public response: Response;

    constructor(message: string, response: Response) {
      super(message);
      this.name = "RateLimitError";
      this.response = response;
    }
  }

export const ensureSuccess = (r: Response) => {
    if (!r.ok) {
        if (r.status === 429) {
            throw new RateLimitError(r.statusText, r);
        }

        throw new Error(r.statusText);
    }

    return r;
};