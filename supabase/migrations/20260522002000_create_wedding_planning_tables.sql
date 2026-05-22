-- Create wedding_budgets table
CREATE TABLE IF NOT EXISTS wedding_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  estimated NUMERIC NOT NULL DEFAULT 0,
  actual NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wedding_tables table
CREATE TABLE IF NOT EXISTS wedding_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 8 CHECK (capacity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wedding_guests table
CREATE TABLE IF NOT EXISTS wedding_guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Family', 'Friends', 'Work', 'Other')),
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  dietary TEXT,
  rsvp_status TEXT NOT NULL CHECK (rsvp_status IN ('pending', 'attending', 'declined')),
  table_id UUID REFERENCES wedding_tables(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wedding_tasks table
CREATE TABLE IF NOT EXISTS wedding_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('todo', 'in-progress', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wedding_dream_suppliers table
CREATE TABLE IF NOT EXISTS wedding_dream_suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  status TEXT NOT NULL CHECK (status IN ('prospect', 'inquired', 'booked')),
  contact TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wedding_journal table
CREATE TABLE IF NOT EXISTS wedding_journal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('rant', 'review')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  mood TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wedding_notes table
CREATE TABLE IF NOT EXISTS wedding_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_wedding_budgets_user ON wedding_budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_wedding_tables_user ON wedding_tables(user_id);
CREATE INDEX IF NOT EXISTS idx_wedding_guests_user ON wedding_guests(user_id);
CREATE INDEX IF NOT EXISTS idx_wedding_guests_table ON wedding_guests(table_id);
CREATE INDEX IF NOT EXISTS idx_wedding_tasks_user ON wedding_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_wedding_dream_suppliers_user ON wedding_dream_suppliers(user_id);
CREATE INDEX IF NOT EXISTS idx_wedding_journal_user ON wedding_journal(user_id);
CREATE INDEX IF NOT EXISTS idx_wedding_notes_user ON wedding_notes(user_id);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE wedding_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_dream_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_journal ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_notes ENABLE ROW LEVEL SECURITY;

-- Create owner-only security policies for all tables
-- 1. Budgets
CREATE POLICY "Users can select own budgets" ON wedding_budgets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own budgets" ON wedding_budgets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own budgets" ON wedding_budgets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own budgets" ON wedding_budgets FOR DELETE USING (auth.uid() = user_id);

-- 2. Tables
CREATE POLICY "Users can select own tables" ON wedding_tables FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tables" ON wedding_tables FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tables" ON wedding_tables FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tables" ON wedding_tables FOR DELETE USING (auth.uid() = user_id);

-- 3. Guests
CREATE POLICY "Users can select own guests" ON wedding_guests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own guests" ON wedding_guests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own guests" ON wedding_guests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own guests" ON wedding_guests FOR DELETE USING (auth.uid() = user_id);

-- 4. Tasks
CREATE POLICY "Users can select own tasks" ON wedding_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON wedding_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON wedding_tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON wedding_tasks FOR DELETE USING (auth.uid() = user_id);

-- 5. Dream Suppliers
CREATE POLICY "Users can select own suppliers" ON wedding_dream_suppliers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own suppliers" ON wedding_dream_suppliers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own suppliers" ON wedding_dream_suppliers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own suppliers" ON wedding_dream_suppliers FOR DELETE USING (auth.uid() = user_id);

-- 6. Journal
CREATE POLICY "Users can select own journal" ON wedding_journal FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own journal" ON wedding_journal FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own journal" ON wedding_journal FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own journal" ON wedding_journal FOR DELETE USING (auth.uid() = user_id);

-- 7. Notes
CREATE POLICY "Users can select own notes" ON wedding_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notes" ON wedding_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notes" ON wedding_notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notes" ON wedding_notes FOR DELETE USING (auth.uid() = user_id);

-- Attach updated_at triggers
CREATE TRIGGER update_wedding_budgets_updated_at BEFORE UPDATE ON wedding_budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wedding_tables_updated_at BEFORE UPDATE ON wedding_tables FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wedding_guests_updated_at BEFORE UPDATE ON wedding_guests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wedding_tasks_updated_at BEFORE UPDATE ON wedding_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wedding_dream_suppliers_updated_at BEFORE UPDATE ON wedding_dream_suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wedding_journal_updated_at BEFORE UPDATE ON wedding_journal FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wedding_notes_updated_at BEFORE UPDATE ON wedding_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
