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
  }, [packages, clientId]);
  return { packages, loadingPackages };
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
  status: "pending" | "approved" | "draft";
  notes: string | null;
  is_draft: boolean;
  task_types: { id: string; name: string } | null;
  clients: { id: string; name: string } | null;
};

export function useActivityLogs(userId: string) {
  const [activityLogs, setActivityLogs] = useState<ActivityLogWithRelations[]>(
    [],
  );
  const [loadingActivityLogs, setLoadingActivityLogs] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivityLogs = async () => {
      try {
        const supabase = createClient();
        const { data: activityLogs } = await supabase
          .from("activity_logs")
          .select(
            `
    *,
    task_types ( id, name ),
    clients ( id, name )
  `,
          )
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (error) throw error;

        setActivityLogs(activityLogs || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoadingActivityLogs(false);
      }
    };
    if (userId) fetchActivityLogs();
  }, [userId, activityLogs, error]);

  return { activityLogs, loadingActivityLogs, error };
}
