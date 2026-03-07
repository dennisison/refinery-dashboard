/**
 * oliAuth.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Manages OLI Cloud authentication.
 *
 * OLI uses OAuth2 password-grant flow:
 *   POST https://cloud.olisystems.com/api/v1/auth/token
 *   Body: { username, password, grant_type: "password" }
 *   Returns: { access_token, token_type, expires_in }
 *
 * Tokens expire in ~3600s. This module caches and auto-refreshes.
 *
 * TO ENABLE LIVE MODE:
 *   Set in your .env file:
 *     OLI_USERNAME=your@email.com
 *     OLI_PASSWORD=yourpassword
 *     OLI_MOCK=false
 */

const OLI_AUTH_URL = "https://cloud.olisystems.com/api/v1/auth/token";

let _cachedToken  = null;
let _tokenExpiry  = 0;

/**
 * Returns a valid Bearer token.
 * In mock mode, returns a fake token immediately.
 * In live mode, fetches/refreshes from OLI Cloud.
 */
async function getToken() {
  if (process.env.OLI_MOCK !== "false") {
    return "MOCK_TOKEN";
  }

  // Return cached token if still valid (with 60s buffer)
  if (_cachedToken && Date.now() < _tokenExpiry - 60000) {
    return _cachedToken;
  }

  const res = await fetch(OLI_AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username:   process.env.OLI_USERNAME,
      password:   process.env.OLI_PASSWORD,
      grant_type: "password",
    }),
  });

  if (!res.ok) {
    throw new Error(`OLI auth failed: ${res.status} ${await res.text()}`);
  }

  const data     = await res.json();
  _cachedToken   = data.access_token;
  _tokenExpiry   = Date.now() + (data.expires_in * 1000);

  console.log(`  [OLI] Token acquired, expires in ${data.expires_in}s`);
  return _cachedToken;
}

module.exports = { getToken };
