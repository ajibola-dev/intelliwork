"use client";

import { useEffect, useState } from "react";
import { getReadClient, CONTRACTS } from "@/lib/genlayer";

export interface Task {
  id: string;
  title: string;
  description: string;
  requirements: string;
  reward_gen: number;
  status: "OPEN" | "CLAIMED" | "SUBMITTED" | "COMPLETE" | "DISPUTED";
  requester: string;
  agent?: string;
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTasks() {
      try {
        setLoading(true);
        setError(null);
        const client = getReadClient();

        const countRaw = await client.readContract({
          address: CONTRACTS.work,
          functionName: "get_task_count",
          args: [],
        });

        const count = Number(countRaw);
        if (count === 0) { setTasks([]); return; }

        const fetched = await Promise.all(
          Array.from({ length: count }, (_, i) =>
            client.readContract({
              address: CONTRACTS.work,
              functionName: "get_task",
              args: [`task_${i}`],
            })
          )
        );

        setTasks(
          fetched
            .map((t, i) => ({ id: `task_${i}`, ...(t as Omit<Task, "id">) }))
            .filter(Boolean) as Task[]
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch tasks");
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, []);

  return { tasks, loading, error };
}

export function useTask(taskId: string) {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!taskId) return;
    async function fetchTask() {
      try {
        setLoading(true);
        setError(null);
        const client = getReadClient();
        const raw = await client.readContract({
          address: CONTRACTS.work,
          functionName: "get_task",
          args: [taskId],
        });
        setTask({ id: taskId, ...(raw as Omit<Task, "id">) });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Task not found");
      } finally {
        setLoading(false);
      }
    }
    fetchTask();
  }, [taskId]);

  return { task, loading, error };
}
