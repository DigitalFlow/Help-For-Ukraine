export const ensureSuccess = (r: Response) => {
    if (!r.ok) {
        throw Error(r.statusText);
    }

    return r;
};