import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// This route would be called by a cron job every minute or so
export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const currentTime = now.toTimeString().split(' ')[0].substring(0, 5); // HH:MM

    // Fetch tasks with reminders set for this minute
    const { data: tasks, error } = await supabase
        .from('tasks')
        .select('title, user_id')
        .eq('remind_at', currentTime)
        .eq('is_active', true);

    if (tasks && tasks.length > 0) {
        for (const task of tasks) {
            // Logic to send WhatsApp message
            // Example using Twilio or a custom API:
            console.log(`Sending WhatsApp reminder for "${task.title}" to user ${task.user_id}`);

            // await sendWhatsApp(task.user_id, `Reminder: ${task.title}`);
        }
    }

    return NextResponse.json({ success: true, processed: tasks?.length || 0 });
}

// Placeholder for WhatsApp sending logic
async function sendWhatsApp(userId: string, message: string) {
    // In a real implementation:
    // 1. Fetch user's phone number from profiles
    // 2. Call Twilio API or similar
}
