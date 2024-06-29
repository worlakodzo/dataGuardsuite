"use strict"


const base64UrlDecode = (token) => {
    const base64 = token.replace(/-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - (base64.length % 4)) % 4);
    const base64Padded = base64 + padding;
    return atob(base64Padded);
}

const parseJwt = (token) => {
    const base64Url = token.split('.')[1];
    const base64 = base64UrlDecode(base64Url);
    return JSON.parse(base64);
}

export { parseJwt };
