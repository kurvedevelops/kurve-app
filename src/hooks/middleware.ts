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
        // const supabase = createClient();
        // const { data, error } = await supabase
        //   .from("client_users")
        //   .select(
        //     `
        //     clients (
        //       id,
        //       name,
        //       status
        //     )
        //   `,
        // )
        // .eq("user_id", userId);
        //
        // if (error) throw error;
        const data = mockClientUsers
          .filter((clientUser) => clientUser.user_id === userId)
          .map((clientUser) => ({ client_id: clientUser.client_id }));

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
        // const supabase = createClient();
        // const { data, error } = await supabase.from("clients").select("*");
        //
        // if (error) throw error;

        const data = mockClients;
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
