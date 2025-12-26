import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, stripe-signature",
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const signature = req.headers.get('stripe-signature');
    
    if (!signature) {
      console.error('❌ No Stripe signature found');
      return new Response(
        JSON.stringify({ error: 'No signature provided' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const body = await req.text();
    
    let event;
    try {
      event = JSON.parse(body);
    } catch (err) {
      console.error('❌ Failed to parse webhook body:', err);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('🔵 [WEBHOOK] Received event:', event.type);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      console.log('💳 [WEBHOOK] Checkout completed:', {
        sessionId: session.id,
        customerId: session.customer,
        clientReferenceId: session.client_reference_id,
        customerEmail: session.customer_email,
      });

      const userId = session.client_reference_id;
      const customerEmail = session.customer_email;

      if (!userId) {
        console.error('❌ [WEBHOOK] No user_id in client_reference_id');
        return new Response(
          JSON.stringify({ error: 'No user_id provided' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      const { data: existingEntitlement } = await supabase
        .from('entitlements')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingEntitlement) {
        console.log('🔄 [WEBHOOK] Updating existing entitlement');
        
        const { error: updateError } = await supabase
          .from('entitlements')
          .update({
            has_active_access: true,
            payment_verified: true,
            stripe_payment_intent_id: session.payment_intent,
            stripe_customer_id: session.customer,
          })
          .eq('user_id', userId);

        if (updateError) {
          console.error('❌ [WEBHOOK] Failed to update entitlement:', updateError);
          throw updateError;
        }
      } else {
        console.log('✨ [WEBHOOK] Creating new entitlement');
        
        const { error: insertError } = await supabase
          .from('entitlements')
          .insert({
            user_id: userId,
            has_active_access: true,
            payment_verified: true,
            stripe_payment_intent_id: session.payment_intent,
            stripe_customer_id: session.customer,
          });

        if (insertError) {
          console.error('❌ [WEBHOOK] Failed to create entitlement:', insertError);
          throw insertError;
        }
      }

      const { error: enrollmentError } = await supabase
        .from('enrollments')
        .update({
          enrollment_status: 'paid',
          program_access: 'unlocked',
          payment_confirmed_at: new Date().toISOString(),
          payment_method: 'stripe',
        })
        .eq('user_id', userId);

      if (enrollmentError && enrollmentError.code !== '23503') {
        console.error('⚠️ [WEBHOOK] Failed to update enrollment:', enrollmentError);
      }

      console.log('✅ [WEBHOOK] Payment processed successfully');
      
      return new Response(
        JSON.stringify({ 
          received: true,
          message: 'Entitlement granted'
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('ℹ️ [WEBHOOK] Unhandled event type:', event.type);
    
    return new Response(
      JSON.stringify({ received: true }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (err: any) {
    console.error('❌ [WEBHOOK] Error processing webhook:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
