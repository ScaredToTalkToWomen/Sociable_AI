import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  username: string;
  bearerToken?: string;
}

interface VerifyResult {
  exists: boolean;
  username?: string;
  displayName?: string;
  profileUrl?: string;
  error?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    console.log('Received request:', req.method, req.url);
    
    const requestBody = await req.json();
    console.log('Request body:', JSON.stringify(requestBody));
    
    const { username, bearerToken: providedToken }: RequestBody = requestBody;

    if (!username) {
      console.error('No username provided');
      return new Response(
        JSON.stringify({ exists: false, error: "Username is required" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const cleanUsername = username.replace('@', '');
    console.log('Clean username:', cleanUsername);
    
    const bearerToken = providedToken;
    console.log('Bearer token present:', !!bearerToken);

    if (!bearerToken) {
      console.error('No bearer token provided');
      return new Response(
        JSON.stringify({
          exists: false,
          error: "Twitter API configuration is missing. Please provide a bearer token."
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    console.log('Calling Twitter API for:', cleanUsername);
    
    const response = await fetch(
      `https://api.twitter.com/2/users/by/username/${cleanUsername}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
        },
      }
    );

    console.log('Twitter API response status:', response.status);

    if (!response.ok) {
      if (response.status === 404) {
        console.log('Username not found:', cleanUsername);
        return new Response(
          JSON.stringify({
            exists: false,
            error: 'Username not found on Twitter',
          }),
          {
            status: 200,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      const errorText = await response.text();
      console.error('Twitter API error:', response.status, errorText);

      return new Response(
        JSON.stringify({
          exists: false,
          error: `Twitter API error: ${response.status}`,
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const data = await response.json();
    console.log('Twitter API success:', JSON.stringify(data));
    
    const result: VerifyResult = {
      exists: true,
      username: data.data.username,
      displayName: data.data.name,
      profileUrl: `https://twitter.com/${data.data.username}`,
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error('Error verifying Twitter username:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    return new Response(
      JSON.stringify({
        exists: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
