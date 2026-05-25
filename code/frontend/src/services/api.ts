import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),

  register: (username: string, password: string, role?: string) =>
    api.post('/auth/register', { username, password, role }),

  logout: () => api.post('/auth/logout'),

  getCurrentUser: () => api.get('/auth/me'),
};

export const userApi = {
  getUsers: () => api.get('/users/'),

  getUserById: (userId: string) => api.get(`/users/${userId}`),

  updateUserStatus: (userId: string, status: string) =>
    api.patch(`/users/${userId}/status`, { status }),

  deleteUser: (userId: string) => api.delete(`/users/${userId}`),
};

export const projectApi = {
  getProjects: () => api.get('/projects/'),

  getProjectById: (projectId: string) => api.get(`/projects/${projectId}`),

  createProject: (data: {
    name: string;
    description: string;
    candidates: string[];
    trustees: string[];
    voters: string[];
  }) => api.post('/projects/', data),

  updateProject: (
    projectId: string,
    data: {
      name?: string;
      description?: string;
      candidates?: string[];
      status?: string;
    }
  ) => api.put(`/projects/${projectId}`, data),

  deleteProject: (projectId: string) => api.delete(`/projects/${projectId}`),

  startProject: (projectId: string) =>
    api.put(`/projects/${projectId}/status`, { status: 'active' }),

  pauseProject: (projectId: string) =>
    api.put(`/projects/${projectId}/status`, { status: 'paused' }),

  finishProject: (projectId: string) =>
    api.put(`/projects/${projectId}/status`, { status: 'finished' }),

  tallyProject: (projectId: string) =>
    api.post(`/tally/${projectId}`),
};

export const ballotApi = {
  submitBallot: (projectId: string, encryptedVote: string, signature: string) =>
    api.post(`/ballots/`, {
      project_id: projectId,
      encrypted_vote: encryptedVote,
      signature,
    }),

  getBallots: (projectId: string) => api.get(`/ballots/${projectId}`),

  checkVoted: (projectId: string) => api.get(`/ballots/check/${projectId}`),
};

export const cryptoApi = {
  generateKeyPair: () => api.get('/crypto/keypair'),

  encryptVote: (vote: number, publicKey: string) =>
    api.post('/crypto/encrypt', { vote, public_key: publicKey }),

  signBallot: (data: string, privateKey: string) =>
    api.post('/crypto/sign', { data, private_key: privateKey }),
};

export default api;
