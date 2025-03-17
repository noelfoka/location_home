"use client";

import { getSession } from "next-auth/react";
import { Session } from "next-auth";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
}

interface AdminSession extends Session {
  user: User;
}

const page = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any | null>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchSession = async () => {
      const sessionData: AdminSession | null =
        (await getSession()) as AdminSession | null;
      console.log("Session reçue :", sessionData); // ✅ Afficher la session
      if (
        !sessionData ||
        !sessionData.user ||
        sessionData.user.role !== "ADMIN"
      ) {
        router.push("/admin");
      } else {
        setSession(sessionData);
      }
    };

    fetchSession();
  }, [router]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const res = await fetch("/api/auth/me");

      if (!res.ok) {
        router.push("/admin");
        return;
      }

      const userData = await res.json();

      if (userData.role !== "ADMINISTRATEUR") {
        router.push("/");
        return;
      }

      setUsers(userData);
      setLoading(false);
    };

    fetchCurrentUser();
  }, [router]);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch("/api/admin/users");
      if (!res.ok) {
        setError("Impossible de charger les utilisateurs.");
        return;
      }
      const data = await res.json();
      setUsers(data);
    };

    fetchUsers();
  }, []);

  const handleChangeRole = async (id: string, newRole: string) => {
    const res = await fetch(`/api/admin/users/${id}/role`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role: newRole }),
    });

    if (!res.ok) {
      setError("Impossible de changer le rôle de l'utilisateur.");
      return;
    }

    const updatedUser = users.find((user) => user.id === id);
    if (updatedUser) {
      updatedUser.role = newRole;
      setUsers([...users]);
    }
  };

  const handleDeleteUser = async (id: string) => {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      setError("Impossible de supprimer l'utilisateur.");
      return;
    }

    const updatedUsers = users.filter((user) => user.id !== id);
    setUsers(updatedUsers);
  };

  return (
    <div className="p-6">
      {loading && <p className="text-center">Chargement...</p>}
      <h1 className="text-2xl font-bold mb-4">Gestion des utilisateurs</h1>
      {error && <p className="text-red-500">{error}</p>}
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr className="">
              <th className="">Nom</th>
              <th className="">Email</th>
              <th className="">Rôle</th>
              <th className="">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="bg-base-200">
                <td className="">{user.name}</td>
                <td className="">{user.email}</td>
                <td className="">{user.role}</td>
                <td className="">
                  <select
                    value={user.role || ""}
                    onChange={(e) => handleChangeRole(user.id, e.target.value)}
                    className="select w-32 bg-base-300 text-primary mr-2"
                  >
                    <option value="LOCATAIRE">Locataire</option>
                    <option value="PROPRIETAIRE">Propriétaire</option>
                    <option value="ADMINISTRATEUR">Administrateur</option>
                  </select>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="btn btn-dashed"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default page;
