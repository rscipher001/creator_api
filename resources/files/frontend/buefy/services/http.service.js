import axios from 'axios';

class HttpService {
  constructor() {
    this.client = axios.create({
      baseURL: `${process.env.VUE_APP_API_URL}/api`,
    });
  }

  async get(url, queryParams) {
    const { data } = await this.client.get(url, {
      params: queryParams,
    });
    return data;
  }

  async post(url, payload, queryParams) {
    const { data } = await this.client.post(url, payload, {
      params: queryParams,
    });
    return data;
  }

  async authGet(url, queryParams) {
    const token = localStorage.getItem('token');
    const { data } = await this.client.get(url, {
      params: queryParams,
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    return data;
  }

  async authPost(url, payload, queryParams) {
    const token = localStorage.getItem('token');
    const { data } = await this.client.post(url, payload, {
      params: queryParams,
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    return data;
  }

  async authPatch(url, payload, queryParams) {
    const token = localStorage.getItem('token');
    const { data } = await this.client.patch(url, payload, {
      params: queryParams,
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    return data;
  }

  async authPut(url, payload, queryParams) {
    const token = localStorage.getItem('token');
    const { data } = await this.client.put(url, payload, {
      params: queryParams,
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    return data;
  }

  async authDelete(url, queryParams) {
    const token = localStorage.getItem('token');
    const { data } = await this.client.delete(url, {
      params: queryParams,
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    return data;
  }
}

export default new HttpService();
