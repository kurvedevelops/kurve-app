"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Tables } from "@/lib/supabase/database.types";
import { NuevoClienteFormData } from "@/components/modals/NuevoClienteModal";
import {
  EditarClienteFormData,
  EditarClienteSubmitData,
} from "@/components/modals/EditarClienteModal";
import { AsignarPaqueteFormData } from "@/components/modals/AsignarPaquete";
import {
  AprovedCorrectionData,
  CorrectionFormData,
} from "@/components/modals/member/CorrectionModal";
import { Member } from "@/app/admin/integrantes/page";

export type UserRole = "admin" | "member" | "client"; // ajustá según los valores reales de tu enum user_role

export interface User {
  id: string; // uuid
  email: string;
  full_name: string;
  role: UserRole;
  active: boolean;
  created_at: string; // timestamptz -> ISO string
  phone: string | null;
  client_id: string | null; // uuid, solo presente cuando role === 'client'
}

export const formatDate = (date: string | null) => {
  if (!date) return "Indefinido";
  const [y, m, d] = date.split("-");
  return `${d}/${m}/${y}`;
};

export async function editClient(
  clientId: string,
  data: EditarClienteSubmitData,
) {
  const res = await fetch(`/api/activity-logs/clients/${clientId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: data.name,
      legal_name: data.razonSocial || null,
      email: data.email || undefined,
      phone: data.telefono || null,
      status: data.status,
      ...(data.password ? { password: data.password } : {}),
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Error desconocido" }));
    throw new Error(body.error ?? "Error al editar cliente");
  }

  return res.json();
}

export async function deleteClient(clientId: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from("clients")
    .update({
      status: "ended",
    })
    .eq("id", clientId);

  if (error) throw error;
}

export async function deleteMember(memberId?: string) {
  if (!memberId) return;
  const supabase = createClient();

  const { error } = await supabase
    .from("users")
    .update({
      active: false,
    })
    .eq("id", memberId);

  if (error) throw error;
}

export async function createNewClient(data: NuevoClienteFormData) {
  const supabase = createClient();

  const { data: newClient, error } = await supabase
    .from("clients")
    .insert({
      name: data.name,
      legal_name: data.razonSocial,
      email: data.email,
      phone: data.telefono,
      created_at: data.fechaAlta,
      status: "active",
    })
    .select()
    .single();

  if (error) throw error;

  return newClient;
}

export async function checkClientExists(name: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("clients")
    .select("id")
    .eq("name", name)
    .maybeSingle();

  if (error) {
    console.error("Error al verificar cliente:", error);
    return false;
  }

  return !!data;
}

export async function checkMemberExists(name: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("full_name", name)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error al verificar cliente:", error);
    return false;
  }

  return !!data;
}

export async function assignPackage(
  clientId: string,
  data: AsignarPaqueteFormData,
) {
  const supabase = createClient();

  const { error } = await supabase.from("packages").insert({
    name: data.nombrePaquete,
    client_id: clientId,
    price: data.precio || 0,
    total_hours: data.horasTotales,
    start_date: data.fechaInicio || null,
    end_date: data.fechaFin || null,
    total_pieces: data.publicaciones.total || null,
    created_at: new Date().toISOString().split("T")[0],
    status: "active",
  });

  if (error) throw error;
}

export async function assignClientToUser(clientId: string, memberId?: string) {
  if (!memberId) return;
  const supabase = createClient();

  const { error } = await supabase.from("client_users").insert({
    user_id: memberId,
    client_id: clientId,
  });

  if (error) throw error;
}

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

type Client = Tables<"clients">;

interface UserClient {
  id: string;
  client_id: string;
  user_id: string;
  created_at: string;
}

export function useClientsByUser(userId?: string) {
  const [clientsId, setClientsId] = useState<UserClient[]>([]);
  const [loadingClientsId, setLoadingClientsId] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [_cuk, _setCuk] = useState(0);

  useEffect(() => {
    if (!userId) return;
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
  }, [userId, _cuk]);

  return {
    clientsId,
    loadingClientsId,
    error,
    refetchClientsId: () => _setCuk((k) => k + 1),
  };
}

export function useMembersByClient(clientId?: string | null) {
  const [membersIdByClient, setMembersIdByClient] = useState<string[]>([]);
  const [loadingMembersByClient, setLoadingMembersByClient] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("client_users")
          .select("user_id")
          .eq("client_id", clientId);

        if (error) throw error;
        setMembersIdByClient(data.map((row) => row.user_id));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoadingMembersByClient(false);
      }
    };
    if (clientId) fetchMembers();
  }, [clientId]);

  return { membersIdByClient, loadingMembersByClient, error };
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from("users").select("*");

        if (error) throw error;

        setUsers(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  return { users, loadingUsers, error };
}

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [_ck, _setCk] = useState(0);

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
  }, [_ck]);

  return {
    clients,
    loadingClients,
    error,
    refetchClients: () => _setCk((k) => k + 1),
  };
}

export function useMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [_mk, _setMk] = useState(0);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("role", "member")
          .eq("active", true);

        if (error) throw error;
        setMembers(data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoadingMembers(false);
      }
    };
    fetchMembers();
  }, [_mk]);

  return {
    members,
    loadingMembers,
    error,
    refetchMembers: () => _setMk((k) => k + 1),
  };
}

export function getInitials(fullName?: string) {
  if (!fullName) return "";
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

export function usePackages() {
  const [packages, setPackages] = useState<any[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [_pk, _setPk] = useState(0);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("packages")
          .select("*")
          .eq("status", "active");

        if (error) throw error;

        setPackages(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoadingPackages(false);
      }
    };
    fetchPackages();
  }, [_pk]);
  return {
    packages,
    loadingPackages,
    refetchPackages: () => _setPk((k) => k + 1),
  };
}

export interface PackageData {
  id: string;
  client_id: string;
  name: string;
  total_hours: number;
  price: number;
  status: "active" | "paused" | "ended";
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  total_pieces: number | null;
  block_on_limit: boolean;
}

export async function deletePackage(id: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from("packages")
    .update({
      status: "ended",
    })
    .eq("id", id);

  if (error) throw error;
}

export async function editPackage(data: PackageData, id: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from("packages")
    .update({
      client_id: data.client_id,
      name: data.name,
      total_hours: data.total_hours,
      price: data.price,
      status: data.status,
      start_date: data.start_date,
      end_date: data.end_date,
      created_at: data.created_at,
      total_pieces: data.total_pieces,
    })
    .eq("id", id);

  if (error) throw error;
}

export function usePackageByClient(clientId: string | null | undefined) {
  const [clientPackage, setClientPackage] = useState<PackageData | null>(null);
  const [loadingClientPackage, setLoadingClientPackage] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clientId) {
      return;
    }

    const fetchPackages = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("packages")
          .select("*")
          .eq("client_id", clientId)
          .eq("status", "active")
          .maybeSingle();

        if (error) throw error;

        setClientPackage(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoadingClientPackage(false);
      }
    };
    fetchPackages();
  }, [clientId]);
  return { clientPackage, loadingClientPackage };
}

export function usePackageConsumption(clientId: string) {
  const [packageConsumption, setPackageConsumption] = useState<any[]>([]);
  const [loadingPackageConsumption, setLoadingPackageConsumption] =
    useState(true);
  const [error, setError] = useState<string | null>(null);
  const [_pck, _setPck] = useState(0);

  useEffect(() => {
    const fetchPackageConsumption = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("v_client_consumption")
          .select("*")
          .eq("client_id", clientId);

        if (error) throw error;

        setPackageConsumption(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoadingPackageConsumption(false);
      }
    };
    fetchPackageConsumption();
  }, [clientId, _pck]);
  return {
    packageConsumption,
    loadingPackageConsumption,
    refetchPackageConsumption: () => _setPck((k) => k + 1),
  };
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

export type ActivityLogWithRelations = {
  id: string;
  hours: number;
  pieces_count: number;
  log_date: string;
  status: "delivered" | "in_progress";
  notes: string | null;
  is_draft: boolean;
  task_types: { id: string; name: string } | null;
  task_subtypes: { id: string; name: string } | null;
  clients: { id: string; name: string } | null;
  piece_categories: { id: string; name: string } | null;
};

export function useActivityLogs(
  userId?: string,
  filters?: {
    client_id?: string;
    status?: string;
    from?: string;
    to?: string;
    page?: number;
  },
) {
  const [activityLogs, setActivityLogs] = useState<ActivityLogWithRelations[]>(
    [],
  );
  const [totalCount, setTotalCount] = useState(0);
  const [loadingActivityLogs, setLoadingActivityLogs] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [_alk, _setAlk] = useState(0);

  useEffect(() => {
    if (!userId) return;
    const fetchActivityLogs = async () => {
      try {
        const supabase = createClient();
        let query = supabase
          .from("activity_logs")
          .select(
            `
            *,
            task_types ( id, name ),
            clients ( id, name ),
            piece_categories ( id, name ),
            task_subtypes ( id, name )
          `,
            { count: "exact" },
          )
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .range((filters?.page ?? 0) * 5, (filters?.page ?? 0) * 5 + 4);

        if (filters?.client_id)
          query = query.eq("client_id", filters.client_id);
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
  }, [
    userId,
    filters?.client_id,
    filters?.status,
    filters?.from,
    filters?.to,
    filters?.page,
    _alk,
  ]);

  return {
    activityLogs,
    loadingActivityLogs,
    error,
    totalCount,
    refetchActivityLogs: () => _setAlk((k) => k + 1),
  };
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

export function useActivityLogsForRequests() {
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [loadingActivityLogs, setLoadingActivityLogs] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivityLogs = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("activity_logs")
          .select(
            `
            *,
            users (id, full_name),
            task_types ( id, name ),
            clients ( id, name ),
            piece_categories ( id, name )
          `,
            { count: "exact" },
          )
          .order("log_date", { ascending: false });

        if (error) throw error;

        setActivityLogs(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoadingActivityLogs(false);
      }
    };
    fetchActivityLogs();
  }, []);
  return { activityLogs, loadingActivityLogs, error };
}

export function useEditRequests() {
  const [editRequests, setEditRequests] = useState<any[]>([]);
  const [loadingEditRequests, setLoadingEditRequests] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [_erk, _setErk] = useState(0);

  useEffect(() => {
    const fetchEditRequests = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("edit_requests")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        setEditRequests(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoadingEditRequests(false);
      }
    };
    fetchEditRequests();
  }, [_erk]);
  return {
    editRequests,
    loadingEditRequests,
    error,
    refetchEditRequests: () => _setErk((k) => k + 1),
  };
}

export function useEditRequestsById(userId: string) {
  const [editRequests, setEditRequests] = useState<any[]>([]);
  const [loadingEditRequests, setLoadingEditRequests] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEditRequests = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("edit_requests")
          .select("*")
          .order("created_at", { ascending: false })
          .eq("requested_by", userId);

        if (error) throw error;

        setEditRequests(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoadingEditRequests(false);
      }
    };
    fetchEditRequests();
  }, [userId]);
  return { editRequests, loadingEditRequests, error };
}

export function useEditRequestsByLog(activityLogId: string | null) {
  const [editRequests, setEditRequests] = useState<any[]>([]);
  const [loadingEditRequests, setLoadingEditRequests] = useState(true);

  useEffect(() => {
    if (!activityLogId) {
      return;
    }

    const fetchEditRequests = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("edit_requests")
        .select("*")
        .eq("activity_log_id", activityLogId)
        .order("created_at", { ascending: false })
        .limit(2);

      if (!error && data) setEditRequests(data);
      setLoadingEditRequests(false);
    };

    fetchEditRequests();
  }, [activityLogId]);

  return { editRequests, loadingEditRequests };
}

export async function createCorrectionRequest(
  data: CorrectionFormData,
  userId: string,
) {
  const supabase = createClient();

  const { error } = await supabase.from("edit_requests").insert({
    activity_log_id: data.activity_log_id,
    requested_by: userId,
    field_name: data.field_name,
    old_value: data.old_value,
    new_value: data.new_value,
    reason: data.reason,
    status: "pending",
    created_at: new Date().toISOString().split("T")[0],
  });

  if (error) throw error;
}

export async function AproveEditRequest(
  data: AprovedCorrectionData,
  userId: string,
) {
  const supabase = createClient();
  console.log(data);

  const numericFields = ["hours", "pieces_count"];
  const parsedValue = numericFields.includes(data.field_name)
    ? Number(data.new_value)
    : data.new_value;

  if (numericFields.includes(data.field_name) && isNaN(parsedValue as number)) {
    throw new Error(
      `Valor inválido para ${data.field_name}: ${data.new_value}`,
    );
  }

  const { error: updateError } = await supabase
    .from("activity_logs")
    .update({ [data.field_name]: parsedValue })
    .eq("id", data.activity_log_id);

  console.log("Update error:", JSON.stringify(updateError));

  if (updateError) throw updateError;

  const { error: reqError } = await supabase
    .from("edit_requests")
    .update({
      status: "approved",
      reviewed_by: userId,
      reviewed_at: new Date().toISOString().split("T")[0],
    })
    .eq("id", data.id);

  if (reqError) throw reqError;
}

export async function RejectEditRequest(reqId: string, adminId: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from("edit_requests")
    .update({
      status: "rejected",
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString().split("T")[0],
    })
    .eq("id", reqId);

  if (error) throw error;
  console.log(error);
}

export interface ClientConsumption {
  client_id: string;
  package_id: string;
  package_name: string;
  total_hours: number;
  hours_percent: number;
  consumed_hours: number;
  traffic_light: "green" | "yellow" | "red";
}

export function useClientConsumption(clientId?: string) {
  const [data, setData] = useState<ClientConsumption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const supabase = createClient();
        let query = supabase
          .from("v_client_consumption")
          .select(
            "client_id, package_id, package_name, total_hours, consumed_hours, traffic_light, hours_percent",
          );

        if (clientId) query = query.eq("client_id", clientId);

        const { data, error } = await query;

        if (error) throw error;
        setData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [clientId]);

  return { data, loading, error };
}

export type TaskType = {
  id: string;
  name: string;
  active: boolean;
};

export function useTaskTypesConfig() {
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("task_types")
          .select("id, name, active")
          .order("name");

        if (error) throw error;
        setTasks(data as TaskType[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoadingTasks(false);
      }
    };
    fetchTasks();
  }, []);

  const updateTask = async (updated: TaskType) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("task_types")
        .update({
          name: updated.name,
          active: updated.active,
        })
        .eq("id", updated.id);

      if (error) throw error;

      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  const addTask = async (nueva: Omit<TaskType, "id">) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("task_types")
        .insert({
          name: nueva.name,
          active: nueva.active,
        })
        .select()
        .single();

      if (error || !data) throw error ?? new Error("No se pudo crear la tarea");

      setTasks((prev) => [...prev, data]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  return { tasks, loadingTasks, error, updateTask, addTask };
}

export type TaskSubtype = {
  id: string;
  name: string;
  active: boolean;
};

export function useTaskSubtypesConfig() {
  const [subtypes, setSubtypes] = useState<TaskSubtype[]>([]);
  const [loadingSubtypes, setLoadingSubtypes] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubtypes = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("task_subtypes")
          .select("id, name, active")
          .order("name");
        if (error) throw error;
        setSubtypes(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoadingSubtypes(false);
      }
    };
    fetchSubtypes();
  }, []);

  const updateSubtype = async (updated: TaskSubtype) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("task_subtypes")
        .update({ name: updated.name, active: updated.active })
        .eq("id", updated.id);
      if (error) throw error;

      setSubtypes((prev) =>
        prev.map((s) => (s.id === updated.id ? updated : s)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  // Se vincula automáticamente con TODOS los task_types (roles) existentes,
  // agregando cada uno al final del orden de ese rol.
  const addSubtype = async (nueva: Omit<TaskSubtype, "id">) => {
    try {
      const supabase = createClient();

      const { data: created, error } = await supabase
        .from("task_subtypes")
        .insert({ name: nueva.name, active: nueva.active })
        .select()
        .single();
      if (error) throw error;

      const { data: taskTypes, error: ttError } = await supabase
        .from("task_types")
        .select("id");
      if (ttError) throw ttError;

      for (const tt of taskTypes ?? []) {
        const { count } = await supabase
          .from("task_subtype_task_types")
          .select("*", { count: "exact", head: true })
          .eq("task_type_id", tt.id);

        const { error: linkError } = await supabase
          .from("task_subtype_task_types")
          .insert({
            task_subtype_id: created.id,
            task_type_id: tt.id,
            order_index: (count ?? 0) + 1,
          });
        if (linkError) throw linkError;
      }

      setSubtypes((prev) => [...prev, created]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  return { subtypes, loadingSubtypes, error, updateSubtype, addSubtype };
}

export type LinkType = "contract" | "drive" | "analytics" | "custom";

export type ClientLink = {
  id: string;
  client_id: string;
  type: LinkType;
  label: string;
  url: string;
  created_at: string;
};

export function useClientLinks(clientId: string | null | undefined) {
  const [links, setLinks] = useState<ClientLink[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clientId) {
      setLoadingLinks(false);
      return;
    }

    const fetchLinks = async () => {
      try {
        const supabase = createClient();
        const { data: session } = await supabase.auth.getSession();
        console.log("session:", session);
        const { data, error } = await supabase
          .from("client_links")
          .select("*")
          .eq("client_id", clientId)
          .order("created_at", { ascending: true });

        if (error) throw error;
        setLinks(data as ClientLink[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoadingLinks(false);
      }
    };
    fetchLinks();
  }, [clientId]);

  const addLink = async (
    clientId: string,
    nuevo: { type: LinkType; label: string; url: string },
  ) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("client_links")
        .insert({
          client_id: clientId,
          type: nuevo.type,
          label: nuevo.label,
          url: nuevo.url,
        })
        .select()
        .single();

      if (error || !data) throw error ?? new Error("No se pudo crear el link");

      setLinks((prev) => [...prev, data as ClientLink]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  const updateLink = async (updated: ClientLink) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("client_links")
        .update({
          type: updated.type,
          label: updated.label,
          url: updated.url,
        })
        .eq("id", updated.id);

      if (error) throw error;

      setLinks((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  const deleteLink = async (linkId: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("client_links")
        .delete()
        .eq("id", linkId);

      if (error) throw error;

      setLinks((prev) => prev.filter((l) => l.id !== linkId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  return { links, loadingLinks, error, addLink, updateLink, deleteLink };
}
