import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rmwljvqogpxhrdlajpci.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtd2xqdnFvZ3B4aHJkbGFqcGNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwMjQyMzcsImV4cCI6MjEwMzYwMDIzN30.jINO7VvJKzzBQ9un7ZTddDBr8Le1fqeRyMAUSE934YE';

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
