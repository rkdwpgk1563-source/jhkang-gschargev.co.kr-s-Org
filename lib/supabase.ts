
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const supabaseUrl = 'https://vesyrflvyczybeckyplf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlc3lyZmx2eWN6eWJlY2t5cGxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0Njg4OTIsImV4cCI6MjA4MjA0NDg5Mn0.1gq6FuUrvqcA5PnNS7HUsNdS4CuhaC4O23yXTrYJtLY';

export const supabase = createClient(supabaseUrl, supabaseKey);
