import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Expense, Settings } from '../backend';

export function useExpenses() {
  const { actor, isFetching } = useActor();
  return useQuery<Expense[]>({
    queryKey: ['expenses'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getExpenses();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useSettings() {
  const { actor, isFetching } = useActor();
  return useQuery<Settings>({
    queryKey: ['settings'],
    queryFn: async () => {
      if (!actor) {
        return {
          monthlyBudget: 20000,
          annualIncome: 300000,
          darkMode: false,
          pinEnabled: false,
          pin: '',
        };
      }
      return actor.getSettings();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

export function useAddExpense() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (expense: Expense) => {
      if (!actor) throw new Error('Actor not ready');
      await actor.addExpense(expense);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}

export function useUpdateExpense() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (expense: Expense) => {
      if (!actor) throw new Error('Actor not ready');
      await actor.updateExpense(expense);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}

export function useDeleteExpense() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not ready');
      await actor.deleteExpense(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}

export function useUpdateSettings() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: Settings) => {
      if (!actor) throw new Error('Actor not ready');
      await actor.updateSettings(settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}
