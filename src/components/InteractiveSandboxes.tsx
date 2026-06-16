import React, { useState } from "react";
import { Terminal, Send, Play, Filter, Database, CheckCircle2, AlertCircle } from "lucide-react";

interface SandboxProps {
  type: "api_simulator" | "regex_tester" | "sql_query_filter";
}

export default function InteractiveSandbox({ type }: SandboxProps) {
  // States for API Simulator
  const [apiChannel, setApiChannel] = useState<"telebirr" | "cbe_birr" | "chapa">("chapa");
  const [apiAmount, setApiAmount] = useState<string>("250.00");
  const [apiCurrency, setApiCurrency] = useState<string>("ETB");
  const [apiStatus, setApiStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [apiResponse, setApiResponse] = useState<string>("");

  // States for Regex Log Parser
  const [logInput, setLogInput] = useState<string>(
    "2026-06-12 11:32:04 [INFO] [OmniPay-Gateway] CBE Birr webhook received successfully for ref_8722\n2026-06-12 11:34:11 [WARN] [Chapa-Integrator] Session timeout in 120s for user_981\n2026-06-12 11:35:50 [ERROR] [Auth-Secure] Invalid authorization token from 197.156.12.8"
  );
  const [logFilter, setLogFilter] = useState<"ALL" | "INFO" | "WARN" | "ERROR">("ALL");

  // States for SQL Schema Studio
  const [sqlTable, setSqlTable] = useState<"articles" | "authors" | "translations">("articles");
  const [sqlLang, setSqlLang] = useState<"ALL" | "amh" | "orm" | "eng">("ALL");
  const [sqlLimit, setSqlLimit] = useState<number>(3);

  // Run API Simulator
  const runApiSimulation = () => {
    setApiStatus("loading");
    setApiResponse("");
    setTimeout(() => {
      const isSuccess = parseFloat(apiAmount) > 0;
      if (isSuccess) {
        setApiStatus("success");
        const txId = `tx_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        const gatewayFee = (parseFloat(apiAmount) * 0.015).toFixed(2);
        setApiResponse(
          JSON.stringify(
            {
              status: "success",
              statusCode: 201,
              message: "Charge initiated and authorized successfully",
              data: {
                transaction_id: txId,
                gateway_reference: `GW-REF-${apiChannel.toUpperCase()}-${Math.floor(Math.random() * 900000 + 100000)}`,
                amount: parseFloat(apiAmount).toFixed(2),
                currency: apiCurrency,
                channel: apiChannel,
                settlement_status: "PENDING_WEBHOOK_ACK",
                payment_url: `https://api.omnipay-africa.dev/checkout/${txId}`,
                breakdown: {
                  gross_amount: parseFloat(apiAmount).toFixed(2),
                  gateway_fee: gatewayFee,
                  merchant_net: (parseFloat(apiAmount) - parseFloat(gatewayFee)).toFixed(2)
                },
                timestamp: new Date().toISOString()
              }
            },
            null,
            2
          )
        );
      } else {
        setApiStatus("error");
        setApiResponse(
          JSON.stringify(
            {
              status: "failed",
              statusCode: 400,
              error: "INVALID_AMOUNT",
              message: "Amount parameter must be greater than 0.00"
            },
            null,
            2
          )
        );
      }
    }, 700);
  };

  // Run Log Parsing for display
  const parsedLogs = logInput.split("\n").filter((line) => {
    if (!line.trim()) return false;
    if (logFilter === "ALL") return true;
    return line.includes(`[${logFilter}]`);
  }).map((line, idx) => {
    const timeMatch = line.match(/^[\d-]+\s+[\d:]+/);
    const levelMatch = line.match(/\[(INFO|WARN|ERROR)\]/);
    const moduleMatch = line.match(/\[([A-Za-z0-9-]+)\]/g);
    
    const timestamp = timeMatch ? timeMatch[0] : "Unknown Time";
    const level = levelMatch ? levelMatch[1] : "INFO";
    // First match is level, second is module
    const moduleName = moduleMatch && moduleMatch.length > 1 ? moduleMatch[1].replace(/[\[\]]/g, "") : "System";
    const textMsg = line.substring(line.indexOf("]") + 1).substring(line.substring(line.indexOf("]") + 1).indexOf("]") + 2).trim();

    return { id: idx, timestamp, level, moduleName, textMsg };
  });

  // Run SQL builder
  const sampleData = {
    articles: [
      { id: 101, title: "Fintech Growth in East Africa", lang: "eng", author: "F. Tekalign", reads: "1.4k" },
      { id: 102, title: "የቴክኖሎጂ ማደግ በአዲስ አበባ", lang: "amh", author: "M. Bekele", reads: "920" },
      { id: 103, title: "Guddina Tekinolojii Oromiyaa", lang: "orm", author: "A. Kebede", reads: "410" },
      { id: 104, title: "Implementing Scalable Node Microservices", lang: "eng", author: "F. Tekalign", reads: "2.8k" },
      { id: 105, title: "የዳታቤዝ አስተዳደር መሰረታዊ መመሪያ", lang: "amh", author: "F. Tekalign", reads: "1.1k" }
    ],
    authors: [
      { id: 1, name: "Frealem Tekalign", role: "Full-Stack Software Engineer", experience: "4+ years", country: "ET" },
      { id: 2, name: "Marcus Bekele", role: "Product Manager", experience: "5+ years", country: "ET" },
      { id: 3, name: "Abebe Kebede", role: "UI Designer", experience: "2 years", country: "ET" }
    ],
    translations: [
      { id: 1, key: "title_home", amh: "ዋና ገጽ", orm: "Fuula Dura", eng: "Home Page" },
      { id: 2, key: "btn_save", amh: "አስቀምጥ", orm: "Save", eng: "Save" },
      { id: 3, key: "ph_search", amh: "ፈልግ", orm: "Barbaadi", eng: "Search..." }
    ]
  };

  const getSqlString = () => {
    let whereClause = "";
    if (sqlTable === "articles" && sqlLang !== "ALL") {
      whereClause = ` WHERE lang = '${sqlLang}'`;
    }
    return `SELECT * FROM customdb.${sqlTable}${whereClause} LIMIT ${sqlLimit};`;
  };

  const currentSqlData = sampleData[sqlTable].filter((row) => {
    if (sqlTable === "articles" && sqlLang !== "ALL") {
      return (row as any).lang === sqlLang;
    }
    return true;
  }).slice(0, sqlLimit);

  return (
    <div id={`sandbox-${type}`} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl mt-4 font-sans text-xs">
      {/* Sandbox Header */}
      <div className="bg-slate-950 px-4 py-2.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="font-mono font-bold tracking-wider text-slate-300 uppercase text-[10px]">
            Competency Playground - Live Web Simulation
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
        </div>
      </div>

      {/* Playgrounds Content */}
      <div className="p-4">
        {/* Type 1: API Simulator */}
        {type === "api_simulator" && (
          <div className="space-y-4 text-slate-300">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Channel Selector */}
              <div>
                <label className="block text-[10px] text-slate-500 font-semibold mb-1 uppercase">Payment Channel</label>
                <select
                  value={apiChannel}
                  onChange={(e) => setApiChannel(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="chapa">Chapa Pay API</option>
                  <option value="telebirr">Telebirr Web Redirect</option>
                  <option value="cbe_birr">CBE Birr API v2</option>
                </select>
              </div>

              {/* Amount Input */}
              <div className="col-span-2">
                <label className="block text-[10px] text-slate-500 font-semibold mb-1 uppercase">Transaction Amount</label>
                <div className="flex">
                  <span className="bg-slate-800 border border-r-0 border-slate-700 text-slate-400 rounded-l px-2 flex items-center justify-center font-mono">
                    {apiCurrency}
                  </span>
                  <input
                    type="number"
                    value={apiAmount}
                    onChange={(e) => setApiAmount(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-r p-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    placeholder="250.00"
                  />
                </div>
              </div>

              {/* Currency Selector */}
              <div>
                <label className="block text-[10px] text-slate-500 font-semibold mb-1 uppercase">Currency</label>
                <select
                  value={apiCurrency}
                  onChange={(e) => setApiCurrency(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="ETB">ETB (Ethiopian Birr)</option>
                  <option value="USD">USD (US Dollar)</option>
                </select>
              </div>
            </div>

            {/* Fire Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={runApiSimulation}
                disabled={apiStatus === "loading"}
                className="bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-bold px-4 py-1.5 rounded flex items-center gap-2 cursor-pointer transition disabled:opacity-50"
              >
                <Send className="w-3 h-3" />
                {apiStatus === "loading" ? "Executing API..." : "Send REST Request POST"}
              </button>
              <div className="flex items-center gap-1 text-slate-400 font-mono text-[10px]">
                <span className="text-blue-400 font-bold">POST</span>
                <span>/api/v1/charge/mock-link-route</span>
              </div>
            </div>

            {/* Simulated Response Block */}
            <div className="space-y-1.5 font-mono">
              <div className="flex items-center justify-between text-[10px] text-slate-400 bg-slate-950 px-3 py-1.5 rounded-t border-t border-x border-slate-800">
                <span>SIMULATED HTTP RESPONSE</span>
                {apiStatus === "success" && (
                  <span className="flex items-center gap-1 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-3 h-3" /> 201 CREATED
                  </span>
                )}
                {apiStatus === "error" && (
                  <span className="flex items-center gap-1 text-red-400 font-bold">
                    <AlertCircle className="w-3 h-3" /> 400 BAD REQUEST
                  </span>
                )}
                {apiStatus === "loading" && <span className="text-yellow-400 animate-pulse">PENDING RESPONSE...</span>}
                {apiStatus === "idle" && <span className="text-slate-500">Awaiting execution...</span>}
              </div>

              <div className="bg-slate-950 p-3 rounded-b border border-slate-800 min-h-[90px] overflow-x-auto text-slate-300">
                {apiStatus === "idle" ? (
                  <p className="text-slate-500 text-[10px] italic">
                    Configure parameters above and click "Send REST Request POST" to verify Frealem's backend framework response design.
                  </p>
                ) : apiStatus === "loading" ? (
                  <div className="flex flex-col gap-1 items-start">
                    <span className="text-yellow-400 animate-pulse font-mono text-[10px]">// Resolving mock financial webhook response...</span>
                    <span className="text-slate-600 animate-pulse font-mono text-[10px]">// Handshaking with Gateway ledger...</span>
                  </div>
                ) : (
                  <pre className="text-[10px] text-slate-200 leading-normal">{apiResponse}</pre>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Type 2: Regex Log Tester */}
        {type === "regex_tester" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Filter Level */}
              <div>
                <label className="block text-[10px] text-slate-400 font-semibold mb-1 uppercase">Filter Log Level</label>
                <div className="flex flex-wrap gap-1">
                  {(["ALL", "INFO", "WARN", "ERROR"] as const).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setLogFilter(lvl)}
                      className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold transition cursor-pointer ${
                        logFilter === lvl
                          ? "bg-blue-500 text-white"
                          : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Preset Feeder */}
              <div className="md:col-span-2">
                <label className="block text-[10px] text-slate-400 font-semibold mb-1 uppercase">Server Log Ingestion Engine</label>
                <div className="text-[10px] text-slate-500 font-mono italic">
                  Apply quick keyword filters. Re-written under 100 microseconds.
                </div>
              </div>
            </div>

            {/* Source Logs Text Area */}
            <div>
              <label className="block text-[10px] text-slate-500 font-semibold mb-1 uppercase">Raw Microservice Log Lines</label>
              <textarea
                value={logInput}
                onChange={(e) => setLogInput(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-[10px] text-emerald-300 font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
              />
            </div>

            {/* Results Output in Clean Grid */}
            <div className="space-y-1 bg-slate-950 p-2.5 rounded border border-slate-800">
              <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800 pb-1.5 mb-1.5">
                <span className="font-bold flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-blue-400" />
                  LOG ROUTER PARSE OUTPUT
                </span>
                <span className="font-mono text-[9px] text-slate-500">{parsedLogs.length} match(es)</span>
              </div>

              {parsedLogs.length === 0 ? (
                <p className="text-slate-500 italic text-[10px] text-center py-2">No matching logs found for this filter.</p>
              ) : (
                <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {parsedLogs.map((log) => (
                    <div key={log.id} className="flex flex-col md:flex-row md:items-center justify-between gap-1.5 border-b border-slate-900 pb-1 font-mono text-[9px]">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-mono">{log.timestamp}</span>
                        <span
                          className={`px-1 rounded text-[8px] font-bold ${
                            log.level === "ERROR"
                              ? "bg-red-500/15 text-red-400 border border-red-500/35"
                              : log.level === "WARN"
                              ? "bg-yellow-500/15 text-yellow-400 border border-yellow-500/35"
                              : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/35"
                          }`}
                        >
                          {log.level}
                        </span>
                        <span className="text-slate-300 font-semibold bg-slate-800 px-1 py-0.5 rounded">
                          {log.moduleName}
                        </span>
                      </div>
                      <span className="text-slate-200">{log.textMsg}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Type 3: SQL Relationship Studio */}
        {type === "sql_query_filter" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Table Selector */}
              <div>
                <label className="block text-[10px] text-slate-400 font-semibold mb-1 uppercase">Database Table</label>
                <select
                  value={sqlTable}
                  onChange={(e) => setSqlTable(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="articles">articles (CMS posts)</option>
                  <option value="authors">authors (Developer Team)</option>
                  <option value="translations">translations (Amharic/Oromoo)</option>
                </select>
              </div>

              {/* Language Selector (only for articles) */}
              <div>
                <label className="block text-[10px] text-slate-400 font-semibold mb-1 uppercase">Filter Language</label>
                <select
                  value={sqlLang}
                  onChange={(e) => setSqlLang(e.target.value as any)}
                  disabled={sqlTable !== "articles"}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-xs text-white focus:outline-none focus:border-orange-500 disabled:opacity-40"
                >
                  <option value="ALL">ALL (No lang Filter)</option>
                  <option value="amh">Amharic (amh)</option>
                  <option value="orm">Oromoo (orm)</option>
                  <option value="eng">English (eng)</option>
                </select>
              </div>

              {/* Limit Selector */}
              <div>
                <label className="block text-[10px] text-slate-400 font-semibold mb-1 uppercase">LIMIT SELECT</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={sqlLimit}
                  onChange={(e) => setSqlLimit(parseInt(e.target.value) || 3)}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-1 text-xs text-white focus:outline-none"
                />
              </div>

              {/* DB Status Badge */}
              <div className="flex items-center justify-center bg-slate-950/40 border border-slate-800 p-2 rounded">
                <div className="text-center">
                  <Database className="w-4 h-4 text-orange-400 mx-auto mb-1 animate-pulse" />
                  <span className="block text-[8px] font-mono tracking-wider text-slate-400">STATUS: REPLICA_UP</span>
                </div>
              </div>
            </div>

            {/* Generated SQL Code Block */}
            <div className="space-y-1 font-mono">
              <span className="block text-[9px] text-slate-500 uppercase">Interactive SQL Query Compiler</span>
              <div className="bg-slate-950 px-4 py-2 border border-slate-800 rounded text-amber-300 flex items-center justify-between text-[11px]">
                <span>{getSqlString()}</span>
                <Play className="w-3.5 h-3.5 text-orange-400" />
              </div>
            </div>

            {/* Table Row Visualizer */}
            <div className="bg-slate-950 rounded border border-slate-800 overflow-x-auto">
              <div className="p-2 border-b border-slate-800 bg-slate-950 text-[10px] text-slate-400 font-mono font-bold tracking-wider uppercase flex items-center gap-2">
                <span>COMPILED QUERY RESPONSE ROWS</span>
              </div>
              
              <table className="w-full text-left border-collapse text-[10px]">
                <thead>
                  <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400 font-mono">
                    <th className="p-2 text-slate-500">ID</th>
                    {sqlTable === "articles" && (
                      <>
                        <th className="p-2">Title</th>
                        <th className="p-2 text-center">Lang</th>
                        <th className="p-2">Author</th>
                        <th className="p-2 text-right">Reads</th>
                      </>
                    )}
                    {sqlTable === "authors" && (
                      <>
                        <th className="p-2">Name</th>
                        <th className="p-2">Role</th>
                        <th className="p-2 text-center">Country</th>
                      </>
                    )}
                    {sqlTable === "translations" && (
                      <>
                        <th className="p-2">Key</th>
                        <th className="p-2">Amharic (amh)</th>
                        <th className="p-2">Oromoo (orm)</th>
                        <th className="p-2">English (eng)</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 font-mono text-slate-300">
                  {currentSqlData.map((row: any) => (
                    <tr key={row.id} className="hover:bg-slate-900">
                      <td className="p-2 text-slate-500 font-semibold">{row.id}</td>
                      {sqlTable === "articles" && (
                        <>
                          <td className="p-2 text-emerald-400 font-sans font-medium">{row.title}</td>
                          <td className="p-2 text-center">
                            <span className="bg-slate-800 text-slate-300 font-bold px-1 rounded text-[8px]">
                              {row.lang}
                            </span>
                          </td>
                          <td className="p-2">{row.author}</td>
                          <td className="p-2 text-right text-amber-400">{row.reads}</td>
                        </>
                      )}
                      {sqlTable === "authors" && (
                        <>
                          <td className="p-2 text-orange-400 font-medium">{row.name}</td>
                          <td className="p-2">{row.role}</td>
                          <td className="p-2 text-center">{row.country}</td>
                        </>
                      )}
                      {sqlTable === "translations" && (
                        <>
                          <td className="p-2 text-orange-400 text-[9px] font-bold">{row.key}</td>
                          <td className="p-2 text-emerald-400 font-sans">{row.amh}</td>
                          <td className="p-2 font-sans">{row.orm}</td>
                          <td className="p-2 text-slate-400">{row.eng}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
