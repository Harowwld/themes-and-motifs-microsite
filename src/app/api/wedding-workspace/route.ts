import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";

async function getUserFromRequest(request: NextRequest) {
  const auth = request.headers.get("authorization") ?? "";
  const token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";

  if (!token) {
    return { data: null, error: { message: "Unauthorized" }, token: "" };
  }

  const supabase = createSupabaseAdminClient();
  const result = await supabase.auth.getUser(token);
  return { ...result, token };
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await getUserFromRequest(request);
    const user = authResult.data?.user ?? null;
    const authError = authResult.error;
    const token = authResult.token;

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createSupabaseServerClient(token);

    // 1. Fetch current data in parallel
    const [
      budgetRes,
      tableRes,
      guestRes,
      taskRes,
      supplierRes,
      journalRes,
      noteRes
    ] = await Promise.all([
      supabase.from("wedding_budgets").select("*").eq("user_id", user.id).order("created_at", { ascending: true }),
      supabase.from("wedding_tables").select("*").eq("user_id", user.id).order("created_at", { ascending: true }),
      supabase.from("wedding_guests").select("*").eq("user_id", user.id).order("created_at", { ascending: true }),
      supabase.from("wedding_tasks").select("*").eq("user_id", user.id).order("created_at", { ascending: true }),
      supabase.from("wedding_dream_suppliers").select("*").eq("user_id", user.id).order("created_at", { ascending: true }),
      supabase.from("wedding_journal").select("*").eq("user_id", user.id).order("date", { ascending: false }),
      supabase.from("wedding_notes").select("*").eq("user_id", user.id).order("date", { ascending: false }),
    ]);

    if (
      budgetRes.error ||
      tableRes.error ||
      guestRes.error ||
      taskRes.error ||
      supplierRes.error ||
      journalRes.error ||
      noteRes.error
    ) {
      console.error("Error loading workspace tables:", {
        budget: budgetRes.error,
        tables: tableRes.error,
        guests: guestRes.error,
        tasks: taskRes.error,
        suppliers: supplierRes.error,
        journal: journalRes.error,
        notes: noteRes.error
      });
      return NextResponse.json({ error: "Failed to load wedding workspace" }, { status: 500 });
    }

    let budgets = budgetRes.data ?? [];
    let tables = tableRes.data ?? [];
    let guests = guestRes.data ?? [];
    let tasks = taskRes.data ?? [];
    let suppliers = supplierRes.data ?? [];
    let journal = journalRes.data ?? [];
    let notes = noteRes.data ?? [];

    // Seeding logic removed. New workspaces start completely empty.

    // 3. Map database snake_case keys to camelCase keys for clean React prop types
    const mappedGuests = guests.map(g => ({
      id: g.id,
      name: g.name,
      category: g.category,
      email: g.email,
      phone: g.phone,
      dietary: g.dietary ?? "",
      rsvpStatus: g.rsvp_status,
      tableId: g.table_id
    }));

    const mappedTasks = tasks.map(t => ({
      id: t.id,
      category: t.category,
      title: t.title,
      dueDate: t.due_date,
      status: t.status
    }));

    const mappedJournal = journal.map(j => ({
      id: j.id,
      title: j.title,
      content: j.content,
      type: j.entry_type,
      rating: j.rating ?? undefined,
      mood: j.mood,
      date: j.date
    }));

    const mappedBudgets = budgets.map(b => ({
      id: b.id,
      category: b.category,
      name: b.name,
      estimated: Number(b.estimated),
      actual: Number(b.actual),
      status: b.status,
      notes: b.notes ?? ""
    }));

    const mappedSuppliers = suppliers.map(s => ({
      id: s.id,
      name: s.name,
      category: s.category,
      rating: s.rating,
      status: s.status,
      contact: s.contact ?? "",
      notes: s.notes ?? ""
    }));

    const mappedTables = tables.map(tb => ({
      id: tb.id,
      name: tb.name,
      capacity: tb.capacity
    }));

    const mappedNotes = notes.map(n => ({
      id: n.id,
      title: n.title,
      content: n.content,
      date: n.date
    }));

    return NextResponse.json({
      budgets: mappedBudgets,
      tables: mappedTables,
      guests: mappedGuests,
      tasks: mappedTasks,
      suppliers: mappedSuppliers,
      journal: mappedJournal,
      notes: mappedNotes
    });

  } catch (error) {
    console.error("Internal Server Error in GET /api/wedding-workspace:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
