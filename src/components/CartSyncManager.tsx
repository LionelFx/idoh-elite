"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { getSupabase } from "@/lib/supabase";

export default function CartSyncManager() {
  const { user } = useAuth();
  const { items, mounted } = useCart();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!mounted || !user) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // Panier vidé (commande passée ou suppression manuelle)
    if (items.length === 0) {
      getSupabase().from("carts").delete().eq("user_id", user.id);
      return;
    }

    // Sync avec debounce 1.5s pour ne pas écrire à chaque frappe
    timeoutRef.current = setTimeout(() => {
      getSupabase().from("carts").upsert(
        {
          user_id: user.id,
          user_email: user.email ?? "",
          user_first_name: (user.user_metadata?.first_name as string) ?? "",
          items,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
    }, 1500);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [items, user, mounted]);

  return null;
}
