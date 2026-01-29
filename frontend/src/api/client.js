class ApiClient {
  constructor() {
    this.token = null;
  }

  setToken(token) {
    this.token = token;
  }

  async request(path, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const res = await fetch(path, {
      ...options,
      headers
    });

    const contentType = res.headers.get('Content-Type') || '';
    let data = null;

    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    if (!res.ok) {
      const message = data && data.message ? data.message : `Ошибка ${res.status}`;
      throw new Error(message);
    }

    return data;
  }

  get(path) {
    return this.request(path);
  }

  post(path, body) {
    return this.request(path, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  put(path, body) {
    return this.request(path, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  }

  patch(path, body) {
    return this.request(path, {
      method: 'PATCH',
      body: JSON.stringify(body)
    });
  }

  delete(path) {
    return this.request(path, {
      method: 'DELETE'
    });
  }
}

export const apiClient = new ApiClient();
