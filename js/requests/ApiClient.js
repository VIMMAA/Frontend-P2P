import {host} from '/js/consts.js';

export class ApiClient {
    constructor() {
        this.baseUrl = `${host}/api`;
        this.authRefreshUrl = `${host}/api/User/login`; // endpoint для обновления токена
        this.token = localStorage.getItem("accessToken");
    }

    async fetchWithAuth(endpoint, options = {}, retry = true) {
        const headers = {
            ...(options.headers || {}),
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.token}`
        };

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers
        });

        if (response.status === 401 && retry) {
            console.warn("Token expired. Trying to refresh...");
            const refreshed = await this.refreshAccessToken();

            if (refreshed) {
                return this.fetchWithAuth(endpoint, options, false); // повтор запроса
            } else {
                throw new Error("Не удалось обновить токен. Требуется повторная авторизация.");
            }
        }

        return response;
    }

    async refreshAccessToken() {
        const login = localStorage.getItem("userEmail");
        const password = localStorage.getItem("userPassword");

        if (!login || !password) return false;

        try {
            const response = await fetch(this.authRefreshUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email: login, password: password })
            });

            if (!response.ok) return false;

            const data = await response.json();
            this.token = data.token;

            localStorage.setItem("jwtToken", this.token);

            console.info("Токен обновлён.");
            return true;
        } catch (err) {
            console.error("Ошибка при обновлении токена:", err);
            return false;
        }
    }
}
