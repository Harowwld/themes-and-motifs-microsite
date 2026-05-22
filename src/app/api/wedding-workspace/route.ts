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

    // 2. Auto-seeding: if ALL tables are empty, bulk seed default mockup templates
    if (
      budgets.length === 0 &&
      tables.length === 0 &&
      guests.length === 0 &&
      tasks.length === 0 &&
      suppliers.length === 0 &&
      journal.length === 0 &&
      notes.length === 0
    ) {
      console.log(`First login detected for user ${user.id}. Seeding default Themes & Motifs workspace data.`);

      // Seed tables first to get their IDs
      const defaultTables = [
        { name: "Head Table (VIP)", capacity: 8, user_id: user.id },
        { name: "Family & Close Kin", capacity: 10, user_id: user.id },
        { name: "Friends Table A", capacity: 8, user_id: user.id },
      ];
      
      const { data: seededTables, error: tablesSeedErr } = await supabase
        .from("wedding_tables")
        .insert(defaultTables)
        .select();

      if (tablesSeedErr) {
        console.error("Error seeding wedding_tables:", tablesSeedErr);
      }

      const activeTables = seededTables ?? [];
      const vipTable = activeTables.find(t => t.name === "Head Table (VIP)");
      const vipTableId = vipTable ? vipTable.id : null;

      // Seed rest of templates in parallel
      const budgetTemplates = [
        { category: "Venue & Catering", name: "Grand Ballroom downpayment", estimated: 250000, actual: 150000, status: "paid", notes: "Capacity: 150 guests", user_id: user.id },
        { category: "Photography & Videography", name: "Pre-wedding & Day Coverage", estimated: 80000, actual: 80000, status: "pending", notes: "Luminous Frames booking", user_id: user.id },
        { category: "Wedding Apparel", name: "Custom Dress & Suit fittings", estimated: 60000, actual: 60000, status: "paid", user_id: user.id },
      ];

      const guestTemplates = [
        { name: "Maria Clara", category: "Family", email: "maria.clara@noli.ph", phone: "09170000001", dietary: "No seafood", rsvp_status: "attending", table_id: vipTableId, user_id: user.id },
        { name: "Crisostomo Ibarra", category: "Family", email: "ibarra.cris@noli.ph", phone: "09170000002", dietary: "", rsvp_status: "attending", table_id: vipTableId, user_id: user.id },
        { name: "Padre Damaso", category: "Other", email: "damaso@church.ph", phone: "09170000003", dietary: "Gluten-free", rsvp_status: "declined", table_id: null, user_id: user.id },
        { name: "Elias Salvi", category: "Friends", email: "elias@rebel.ph", phone: "09170000004", dietary: "", rsvp_status: "pending", table_id: null, user_id: user.id },
      ];

      const taskTemplates = [
        { category: "Venue & Catering", title: "Reserve Grand Ballroom", due_date: "2026-06-01", status: "completed", user_id: user.id },
        { category: "Rings & Legal Documents", title: "Obtain Marriage License", due_date: "2026-08-15", status: "in-progress", user_id: user.id },
        { category: "Apparel & Grooming", title: "Final fittings with designer", due_date: "2026-09-10", status: "todo", user_id: user.id },
      ];

      const supplierTemplates = [
        { name: "Gilded Caterer Inc", category: "Catering", rating: 5, status: "booked", contact: "info@gildedcaterer.ph", notes: "Menu: Asian Fusion Buffet", user_id: user.id },
        { name: "Luminous Frames", category: "Photography", rating: 4, status: "inquired", contact: "booking@luminousframes.com", user_id: user.id },
      ];

      const journalTemplates = [
        { title: "Food Tasting was amazing!", content: "Tasted the main courses today. The garlic herb roast chicken is spectacular. Everyone will love it!", entry_type: "review", rating: 5, mood: "😍", date: new Date(Date.now() - 172800000).toISOString(), user_id: user.id },
        { title: "Headcount drama is real 🤯", content: "Chris wanted to invite 15 extra cousins. We simply don't have space. Had to stay strong and say no.", entry_type: "rant", mood: "🤯", date: new Date(Date.now() - 86400000).toISOString(), user_id: user.id },
      ];

      const noteTemplates = [
        { title: "Ring Engraving Drafts", content: "Maria: 'Forever & Always' in script font.\nChris: 'My sun, my stars' in script font.", date: new Date().toISOString(), user_id: user.id },
      ];

      const [
        budgetsSeedRes,
        guestsSeedRes,
        tasksSeedRes,
        suppliersSeedRes,
        journalSeedRes,
        notesSeedRes
      ] = await Promise.all([
        supabase.from("wedding_budgets").insert(budgetTemplates).select(),
        supabase.from("wedding_guests").insert(guestTemplates).select(),
        supabase.from("wedding_tasks").insert(taskTemplates).select(),
        supabase.from("wedding_dream_suppliers").insert(supplierTemplates).select(),
        supabase.from("wedding_journal").insert(journalTemplates).select(),
        supabase.from("wedding_notes").insert(noteTemplates).select(),
      ]);

      if (
        budgetsSeedRes.error ||
        guestsSeedRes.error ||
        tasksSeedRes.error ||
        suppliersSeedRes.error ||
        journalSeedRes.error ||
        notesSeedRes.error
      ) {
        console.error("Seeding errors detected:", {
          budgets: budgetsSeedRes.error,
          guests: guestsSeedRes.error,
          tasks: tasksSeedRes.error,
          suppliers: suppliersSeedRes.error,
          journal: journalSeedRes.error,
          notes: notesSeedRes.error
        });
      }

      // Reassign to return values
      budgets = budgetsSeedRes.data ?? [];
      tables = activeTables;
      guests = guestsSeedRes.data ?? [];
      tasks = tasksSeedRes.data ?? [];
      suppliers = suppliersSeedRes.data ?? [];
      journal = journalSeedRes.data ?? [];
      notes = notesSeedRes.data ?? [];
    }

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
