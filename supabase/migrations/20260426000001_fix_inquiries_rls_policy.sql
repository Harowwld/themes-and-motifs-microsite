-- Drop the existing policy that only allows authenticated users
drop policy if exists "Authenticated users can create inquiries" on "public"."inquiries";

-- Create a new policy that allows both anon and authenticated to insert inquiries
create policy "Allow insert for all users"
on "public"."inquiries"
as permissive
for insert
to public
with check (true);
