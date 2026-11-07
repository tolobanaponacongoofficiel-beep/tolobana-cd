import { supabaseServer } from '@/lib/supabase/server'
import { isOpen } from '@/lib/polls'
import PollCard from './PollCard'
// Question du jour : le sondage actif le plus récent.
export default async function TodayPoll() {
  const { data } = await supabaseServer().from('polls').select('id,question,is_active,ends_at').eq('is_active', true).order('created_at', { ascending: false }).limit(5)
  const poll = (data || []).find(isOpen)
  return poll ? <div style={{ marginBottom: 20 }}><PollCard poll={poll} back="/" /></div> : null
}
