import axios from "axios";
import * as data from "../../config.json" assert { type: "json" };
import localStorage from "./localStorage.js";

const { API_URL, AUTH_URL, CLIENT_ID, CLIENT_SECRET } = data.default.helloasso;

const axiosPublic = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

const refreshToken = async () => {
    const session = JSON.parse(localStorage.getItem("session"));

    try {
        const { data } = await axiosPublic.post(
            `${AUTH_URL}/token`,
            {
                client_id: CLIENT_ID,
                grant_type: "refresh_token",
                refresh_token: session.refreshToken,
            },
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }
        );

        if (!data?.access_token) {
            localStorage.removeItem("session");
            throw new Error("No access token");
        }

        const session = {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresAt: Date.now() + data.expires_in * 1000,
        };

        localStorage.setItem("session", JSON.stringify(session));

        return session;
    } catch (error) {
        const { data } = await axiosPublic.post(
            `${AUTH_URL}/token`,
            {
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                grant_type: "client_credentials",
            },
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }
        );

        if (!data?.access_token) {
            throw new Error("No access token");
        }

        const session = {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresAt: Date.now() + data.expires_in * 1000,
        };

        localStorage.setItem("session", JSON.stringify(session));

        return session;
    }
};

const axiosPrivate = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

axiosPrivate.interceptors.request.use(
    async (config) => {
        const session = await localStorage.getItem("session");

        config.headers.Authorization = `Bearer ${session?.accessToken}`;

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosPrivate.interceptors.response.use(
    (response) => response,
    async (error) => {
        const config = error?.config;

        if (error?.response?.status === 401 && !config?.sent) {
            config.sent = true;

            const result = await refreshToken();

            if (result?.accessToken) {
                config.headers = {
                    ...config.headers,
                    authorization: `Bearer ${result?.accessToken}`,
                };
            }

            return axios(config);
        }
        return Promise.reject(error);
    }
);

export { axiosPublic, axiosPrivate };
