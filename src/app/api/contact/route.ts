import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields (Name, Email, Subject, Message) are required.' },
        { status: 400 }
      );
    }

    if (!email.includes('@') || !email.includes('.')) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    console.log(`[contact-inquiry] Received from ${name} (${email}) - Subject: "${subject}" - Message length: ${message.length}`);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // If Supabase is configured, record in inquiries/contact table if exists
    if (supabaseUrl && supabaseServiceKey && !supabaseUrl.includes('your-supabase-url-here')) {
      try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        await supabase
          .from('contact_inquiries')
          .insert({
            name,
            email,
            subject,
            message,
            created_at: new Date().toISOString()
          });
      } catch (err: any) {
        console.warn('Could not store in contact_inquiries table (ignoring if table does not exist):', err.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you for reaching out! Our team has received your message.'
    });
  } catch (err: any) {
    console.error('Error handling contact form submission:', err.message);
    return NextResponse.json(
      { error: err.message || 'Failed to submit contact message.' },
      { status: 500 }
    );
  }
}
