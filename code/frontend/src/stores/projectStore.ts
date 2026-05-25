import { create } from 'zustand';
import { projectApi } from '../services/api';
import type { Project, TallyResult } from '../types/index';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  tallyResult: TallyResult | null;
  isLoading: boolean;
  error: string | null;
  fetchProjects: () => Promise<boolean>;
  fetchProjectById: (projectId: string) => Promise<boolean>;
  createProject: (data: {
    name: string;
    description: string;
    candidates: string[];
    trustees: string[];
    voters: string[];
  }) => Promise<boolean>;
  updateProject: (
    projectId: string,
    data: Partial<{
      name: string;
      description: string;
      candidates: string[];
      status: string;
    }>
  ) => Promise<boolean>;
  deleteProject: (projectId: string) => Promise<boolean>;
  startProject: (projectId: string) => Promise<boolean>;
  pauseProject: (projectId: string) => Promise<boolean>;
  finishProject: (projectId: string) => Promise<boolean>;
  tallyProject: (projectId: string) => Promise<boolean>;
  setCurrentProject: (project: Project | null) => void;
  clearError: () => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  tallyResult: null,
  isLoading: false,
  error: null,

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await projectApi.getProjects();
      set({ projects: response.data, isLoading: false });
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || '获取项目列表失败';
      set({ isLoading: false, error: errorMessage });
      return false;
    }
  },

  fetchProjectById: async (projectId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await projectApi.getProjectById(projectId);
      set({ currentProject: response.data, isLoading: false });
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || '获取项目详情失败';
      set({ isLoading: false, error: errorMessage });
      return false;
    }
  },

  createProject: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await projectApi.createProject(data);
      const newProject = response.data;
      set((state) => ({
        projects: [...state.projects, newProject],
        isLoading: false,
      }));
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || '创建项目失败';
      set({ isLoading: false, error: errorMessage });
      return false;
    }
  },

  updateProject: async (projectId, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await projectApi.updateProject(projectId, data);
      const updatedProject = response.data;
      set((state) => ({
        projects: state.projects.map((p) =>
          p.project_id === projectId ? updatedProject : p
        ),
        currentProject:
          state.currentProject?.project_id === projectId
            ? updatedProject
            : state.currentProject,
        isLoading: false,
      }));
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || '更新项目失败';
      set({ isLoading: false, error: errorMessage });
      return false;
    }
  },

  deleteProject: async (projectId: string) => {
    set({ isLoading: true, error: null });
    try {
      await projectApi.deleteProject(projectId);
      set((state) => ({
        projects: state.projects.filter((p) => p.project_id !== projectId),
        currentProject:
          state.currentProject?.project_id === projectId
            ? null
            : state.currentProject,
        isLoading: false,
      }));
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || '删除项目失败';
      set({ isLoading: false, error: errorMessage });
      return false;
    }
  },

  startProject: async (projectId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await projectApi.startProject(projectId);
      const updatedProject = response.data;
      set((state) => ({
        projects: state.projects.map((p) =>
          p.project_id === projectId ? updatedProject : p
        ),
        currentProject:
          state.currentProject?.project_id === projectId
            ? updatedProject
            : state.currentProject,
        isLoading: false,
      }));
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || '启动项目失败';
      set({ isLoading: false, error: errorMessage });
      return false;
    }
  },

  pauseProject: async (projectId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await projectApi.pauseProject(projectId);
      const updatedProject = response.data;
      set((state) => ({
        projects: state.projects.map((p) =>
          p.project_id === projectId ? updatedProject : p
        ),
        currentProject:
          state.currentProject?.project_id === projectId
            ? updatedProject
            : state.currentProject,
        isLoading: false,
      }));
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || '暂停项目失败';
      set({ isLoading: false, error: errorMessage });
      return false;
    }
  },

  finishProject: async (projectId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await projectApi.finishProject(projectId);
      const updatedProject = response.data;
      set((state) => ({
        projects: state.projects.map((p) =>
          p.project_id === projectId ? updatedProject : p
        ),
        currentProject:
          state.currentProject?.project_id === projectId
            ? updatedProject
            : state.currentProject,
        isLoading: false,
      }));
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || '结束项目失败';
      set({ isLoading: false, error: errorMessage });
      return false;
    }
  },

  tallyProject: async (projectId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await projectApi.tallyProject(projectId);
      set({ tallyResult: response.data, isLoading: false });
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || '计票失败';
      set({ isLoading: false, error: errorMessage });
      return false;
    }
  },

  setCurrentProject: (project) => set({ currentProject: project }),

  clearError: () => set({ error: null }),
}));
