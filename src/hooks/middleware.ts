"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Tables } from "@/lib/supabase/database.types";
import { mockClientUsers } from "@/lib/mock_client_users";
import { mockClients } from "@/lib/mock_clients";

type User = Tables<"users">;

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (!authUser) {
          setUser(null);
          return;
        }

        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", authUser.id)
          .single();
        if (error) throw error;
        setUser(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUser();
  }, []);

  return { user, loadingUser, error };
}

type ClientUser = Tables<"client_users">;

export function useClientsByUser(userId: string) {
  const [clientsId, setClientsId] = useState<any[]>([]);
  const [loadingClientsId, setLoadingClientsId] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("client_users")
          .select("*")
          .eq("user_id", userId);

        if (error) throw error;
        setClientsId(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoadingClientsId(false);
      }
    };
    if (userId) fetchClients();
  }, [userId]);

  return { clientsId, loadingClientsId, error };
}

export function useClients() {
  const [clients, setClients] = useState<any[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from("clients").select("*");

        if (error) throw error;

        setClients(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoadingClients(false);
      }
    };

    fetchClients();
  }, []);

  return { clients, loadingClients, error };
}

export function getInitials(fullName?: string) {
  if (!fullName) return "U";
  const parts = fullName.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function usePieceCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("piece_categories")
          .select("id, name")
          .eq("active", true)
          .order("name");

        if (error) throw error;

        setCategories(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);
  return { categories, loadingCategories, error };
}

export function usePackageByClient(clientId: string) {
  const [packages, setPackages] = useState<any[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("packages")
          .select("*")
          .eq("client_id", clientId);

        if (error) throw error;

        setPackages(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoadingPackages(false);
      }
    };
    fetchPackages();
  }, [clientId]);
  return { packages, loadingPackages, error };
}

export function useTaskTypes() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("task_types")
          .select("*")
          .eq("active", true)
          .order("name");

        if (error) throw error;

        setTasks(data);
        console.log(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoadingTasks(false);
      }
    };
    fetchTasks();
  }, []);
  return { tasks, loadingTasks, error };
}

type ActivityLogWithRelations = {
  id: string;
  hours: number;
  pieces_count: number;
  log_date: string;
  status: "delivered" | "in_progress";
  notes: string | null;
  is_draft: boolean;
  task_types: { id: string; name: string } | null;
  clients: { id: string; name: string } | null;
  piece_categories: { id: string; name: string } | null;
};

export function useActivityLogs(userId: string, filters?: {
  client_id?: string;
  status?: string;
  from?: string;
  to?: string;
  page?: number;
}) {
  const [activityLogs, setActivityLogs] = useState<ActivityLogWithRelations[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loadingActivityLogs, setLoadingActivityLogs] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivityLogs = async () => {
      try {
        const supabase = createClient();
        let query = supabase
          .from("activity_logs")
          .select(`
            *,
            task_types ( id, name ),
            clients ( id, name ),
            piece_categories ( id, name )
          `, { count: "exact" })
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .range(
            (filters?.page ?? 0) * 5,
            (filters?.page ?? 0) * 5 + 4
          );

        if (filters?.client_id) query = query.eq("client_id", filters.client_id);
        if (filters?.status) query = query.eq("status", filters.status);
        if (filters?.from) query = query.gte("log_date", filters.from);
        if (filters?.to) query = query.lte("log_date", filters.to);

        const { data, count } = await query;
        setActivityLogs(data || []);
        setTotalCount(count || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoadingActivityLogs(false);
      }
    };

    if (userId) fetchActivityLogs();
  }, [userId, filters?.client_id, filters?.status, filters?.from, filters?.to, filters?.page]);

  return { activityLogs, loadingActivityLogs, error, totalCount };
}

export function useActivityLogDates(userId: string) {
  const [dates, setDates] = useState<string[]>([]);

  useEffect(() => {
    const fetchDates = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("activity_logs")
        .select("log_date")
        .eq("user_id", userId)
        .order("log_date", { ascending: false });

      const unique = [...new Set(data?.map((d) => d.log_date) || [])];
      setDates(unique);
    };

    if (userId) fetchDates();
  }, [userId]);

  return { dates };
}