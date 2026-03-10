const CHARSET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function encode(id: number): string {
    let shortCode = "";
    while (id > 0) {
        shortCode = CHARSET[id % 62] + shortCode;
        id = Math.floor(id / 62);
    }
    return shortCode;
}