interface LoginRequestBody {
    email: string;
    password: string;
}

interface LoginResponseBody {
    accessToken: string;
    email: string;
    username: string;
}

export { LoginRequestBody, LoginResponseBody };
