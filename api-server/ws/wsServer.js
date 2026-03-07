/**
 * wsServer.js
 * ─────────────────────────────────────────────────────────────────────────────
 * WebSocket server for real-time process data push.
 * Shares the same port as the HTTP server via an upgrade handler —
 * no separate port needed, so it works on any free-tier host (Railway,
 * Render, Fly.io) that exposes a single port.
 *
 * Message types sent to clients:
 *   { type: "connected", data: { ts, mode } }       — on connect
 *   { type: "tick",      data: { ts, kpis, units, alerts } } — every 2s
 *   { type: "pong" }                                  — response to ping
 *
 * TO REPLACE WITH REAL DCS DATA:
 *   Call broadcastTick(buildTickPayload(state, relTime)) from your
 *   OPC-UA subscription or PI AF event callback instead of the setInterval.
 */

const { WebSocketServer } = require("ws");

let _wss = null;
let _tickLoop = null;

/**
 * Attach a WebSocket server to an existing HTTP server (shares its port).
 * @param {http.Server} httpServer  - the Express http.Server instance
 * @param {object}      state       - shared mutable state from server.js
 * @param {function}    tick        - tickState() from server.js
 * @param {function}    relTime     - relativeTime() helper
 */
function initWsServer(httpServer, state, tick, relTime) {
  _wss = new WebSocketServer({ server: httpServer });

  _wss.on("connection", (ws, req) => {
    const ip = req.socket.remoteAddress;
    console.log(`  [WS] Client connected (${ip}) — ${_wss.clients.size} total`);

    // Send current snapshot immediately on connect
    ws.send(
      JSON.stringify({
        type: "connected",
        data: {
          ts: new Date().toISOString(),
          mode: process.env.OLI_MOCK !== "false" ? "mock" : "live",
        },
      }),
    );
    ws.send(
      JSON.stringify({ type: "tick", data: buildTickPayload(state, relTime) }),
    );

    ws.on("message", (raw) => {
      try {
        const msg = JSON.parse(raw);
        if (msg.type === "ping") ws.send(JSON.stringify({ type: "pong" }));
      } catch {}
    });

    ws.on("close", () =>
      console.log(
        `  [WS] Client disconnected — ${_wss.clients.size} remaining`,
      ),
    );

    ws.on("error", (err) =>
      console.error(`  [WS] Client error: ${err.message}`),
    );
  });

  // 2-second tick: mutate state, broadcast to all clients
  _tickLoop = setInterval(() => {
    tick();
    const payload = JSON.stringify({
      type: "tick",
      data: buildTickPayload(state, relTime),
    });
    _wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        try {
          client.send(payload);
        } catch {}
      }
    });
  }, 2000);

  console.log("  [WS] WebSocket server attached to HTTP server (same port)");
  return _wss;
}

function buildTickPayload(state, relTime) {
  const k = state.kpis;
  return {
    ts: new Date().toISOString(),
    kpis: {
      crudeThroughput: {
        value: k.crudeThroughput,
        unit: "MBPD",
        prev: k.crudeThroughputPrev,
        design: 365,
      },
      carbGasoline: {
        value: k.carbGasoline,
        unit: "MBPD",
        prev: k.carbGasPrev,
        sub: "RON 91.4 - Phase 3",
      },
      carbDiesel: {
        value: k.carbDiesel,
        unit: "MBPD",
        prev: k.carbDieselPrev,
        sub: "15 ppm S - ULSD",
      },
      jetFuel: {
        value: k.jetFuel,
        unit: "MBPD",
        prev: k.jetFuelPrev,
        sub: "Direct LAX pipeline",
      },
      cogenOutput: {
        value: k.cogenOutput,
        unit: "MW",
        prev: k.cogenPrev,
        sub: "400 MW nameplate",
      },
      crackSpread: {
        value: k.crackSpread,
        unit: "$/bbl",
        prev: k.crackSpreadPrev,
        sub: "West Coast realized",
      },
    },
    units: state.units,
    alerts: state.alerts.map((a) => ({ ...a, time: relTime(a.ts) })),
  };
}

function getClientCount() {
  return _wss ? _wss.clients.size : 0;
}

function closeWsServer() {
  if (_tickLoop) clearInterval(_tickLoop);
  if (_wss) _wss.close();
}

module.exports = { initWsServer, getClientCount, closeWsServer };
