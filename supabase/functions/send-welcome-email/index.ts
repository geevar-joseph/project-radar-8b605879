
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  name: string;
  tempPassword: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, tempPassword }: WelcomeEmailRequest = await req.json();

    if (!email || !tempPassword) {
      throw new Error("Email and temporary password are required");
    }

    const emailResponse = await resend.emails.send({
      from: "Project Manager <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to Project Management System - Your Login Details",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to the Project Management System, ${name}!</h2>
          <p>Your account has been created. Here are your login details:</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Temporary Password:</strong> ${tempPassword}</p>
          <p>For security reasons, you will be required to change your password upon first login.</p>
          <p>Click the link below to log in:</p>
          <p><a href="${Deno.env.get("PUBLIC_APP_URL") || window.location.origin}/login" style="background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Log In Now</a></p>
          <p>If you have any questions or need assistance, please contact your administrator.</p>
          <p>Best regards,<br>The Project Management Team</p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
