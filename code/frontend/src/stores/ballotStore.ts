import { create } from 'zustand';
import { ballotApi, cryptoApi } from '../services/api';
import type { Ballot } from '../types/index';

interface BallotState {
  ballots: Ballot[];
  hasVoted: boolean;
  isLoading: boolean;
  error: string | null;
  fetchBallots: (projectId: string) => Promise<boolean>;
  checkVoted: (projectId: string) => Promise<boolean>;
  submitBallot: (
    projectId: string,
    voteIndex: number,
    publicKey: string,
    privateKey: string
  ) => Promise<boolean>;
  clearError: () => void;
}

export const useBallotStore = create<BallotState>((set, get) => ({
  ballots: [],
  hasVoted: false,
  isLoading: false,
  error: null,

  fetchBallots: async (projectId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await ballotApi.getBallots(projectId);
      set({ ballots: response.data, isLoading: false });
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || '获取选票列表失败';
      set({ isLoading: false, error: errorMessage });
      return false;
    }
  },

  checkVoted: async (projectId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await ballotApi.checkVoted(projectId);
      set({ hasVoted: response.data.has_voted, isLoading: false });
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || '检查投票状态失败';
      set({ isLoading: false, error: errorMessage });
      return false;
    }
  },

  submitBallot: async (
    projectId: string,
    voteIndex: number,
    publicKey: string,
    privateKey: string
  ) => {
    set({ isLoading: true, error: null });
    try {
      const encryptResponse = await cryptoApi.encryptVote(voteIndex, publicKey);
      const { encrypted_vote } = encryptResponse.data;

      const signResponse = await cryptoApi.signBallot(encrypted_vote, privateKey);
      const { signature } = signResponse.data;

      await ballotApi.submitBallot(projectId, encrypted_vote, signature);

      set({ hasVoted: true, isLoading: false });
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || '提交选票失败';
      set({ isLoading: false, error: errorMessage });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
