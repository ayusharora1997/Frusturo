import { useEffect, useMemo, useState } from "react";

// Proxied by Vite (see vite.config.js) to avoid CORS in local dev.
const N8N_WEBHOOK_PROD_PATH = "/n8n/webhook/c57ec200-84e8-4f5c-9dbe-9a828f638dca";
const N8N_WEBHOOK_PROD_URL = "https://n8n-production-6463.up.railway.app/webhook/c57ec200-84e8-4f5c-9dbe-9a828f638dca";

// Supabase read access (publishable/anon key). Table values come from Supabase only.
const SUPABASE_URL = "https://yxwamgzayylfvitvtevd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_RyD6aJy7_8gFlNAGMUiFKg_4d4QkLzR";

function todayISODate() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatMaybe(text) {
  const t = typeof text === "string" ? text.trim() : "";
  return t ? t : "--";
}

export default function JobSearchDashboard() {
  const [rawPost, setRawPost] = useState("");
  const [postLink, setPostLink] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successId, setSuccessId] = useState("");
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState("");
  const [postsHint, setPostsHint] = useState("");
  const [activePost, setActivePost] = useState(null);
  const [activeTab, setActiveTab] = useState("paste");

  const canSubmit = useMemo(() => rawPost.trim().length > 0 && !submitting, [rawPost, submitting]);

  useEffect(() => {
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadPosts() {
    setPostsLoading(true);
    setPostsError("");
    setPostsHint("");
    try {
      const url = new URL(`${SUPABASE_URL}/rest/v1/job_posts`);
      url.searchParams.set(
        "select",
        [
          "job_search_id",
          "created_at",
          "raw_post",
          "post_link",
          "person_name",
          "person_title",
          "date_of_search",
          "hiring_line",
          "job_role",
          "location",
          "salary",
          "experience",
          "responsibilities",
          "skills_required",
          "apply_link",
          "apply_email",
          "hashtags",
          "domain",
        ].join(",")
      );
      url.searchParams.set("order", "created_at.desc");
      url.searchParams.set("limit", "100");

      const res = await fetch(url.toString(), {
        method: "GET",
        headers: {
          apikey: SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
        },
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Supabase load failed (${res.status}). ${text}`.trim());
      }

      const json = await res.json();
      const rows = Array.isArray(json) ? json : [];
      setPosts(rows);

      // Supabase can return 200 [] when RLS policies filter everything.
      if (rows.length === 0) {
        setPostsHint("Supabase returned 0 rows. If the dashboard shows rows, your RLS SELECT policy is likely filtering anon reads.");
      }
    } catch (e) {
      setPostsError(e instanceof Error ? e.message : "Failed to load posts.");
    } finally {
      setPostsLoading(false);
    }
  }

  async function handleSubmit() {
    if (!canSubmit) return;

    setSubmitting(true);
    setError("");
    setSuccessId("");

    const jobSearchId = globalThis.crypto?.randomUUID
      ? globalThis.crypto.randomUUID()
      : `js_${Date.now()}_${Math.random().toString(16).slice(2)}`;

    // Send columns as named in your `public.job_posts` table.
    const payload = {
      raw_post: rawPost,
      post_link: postLink.trim() ? postLink.trim() : null,
      job_search_id: jobSearchId,
      person_name: null,
      person_title: null,
      date_of_search: todayISODate(),
      hiring_line: null,
      job_role: null,
      location: null,
      salary: null,
      experience: null,
      responsibilities: null,
      skills_required: null,
      apply_link: null,
      apply_email: null,
      hashtags: null,
      domain: null,
      job_id_processed: false,
      moved_to_matches: false,
    };

    try {
      const tryPost = async (path) => {
        const res = await fetch(path, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        return res;
      };

      const readBody = async (res) => {
        const text = await res.text().catch(() => "");
        try {
          return { text, json: JSON.parse(text) };
        } catch {
          return { text, json: null };
        }
      };

      const tryPostResilient = async (path, url) => {
        // In Vercel production there is no Vite dev proxy, so `/n8n/...` will 404 on the app domain.
        // Fall back to the absolute n8n URL when that happens.
        try {
          const res = await tryPost(path);
          if (res.ok) return res;
          if (res.status === 404 || res.status === 405) {
            return await tryPost(url);
          }
          return res;
        } catch {
          return await tryPost(url);
        }
      };

      let res = await tryPostResilient(N8N_WEBHOOK_PROD_PATH, N8N_WEBHOOK_PROD_URL);
      if (!res.ok) {
        const prodStatus = res.status;
        const { text: prodText, json: prodJson } = await readBody(res);
        const prodMsg = (prodJson && typeof prodJson.message === "string" ? prodJson.message : prodText).toLowerCase();

        if (prodStatus === 404 && prodMsg.includes("not registered")) {
          throw new Error("n8n production webhook is not registered. Activate the workflow in n8n to enable the /webhook/... endpoint, then submit again.");
        }
        throw new Error(`n8n production webhook failed (${prodStatus}).`);
      }

      setSuccessId(jobSearchId);
      setRawPost("");
      setPostLink("");
      loadPosts();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit post.");
    } finally {
      setSubmitting(false);
    }
  }

  const clamp2 = {
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FAFAF8",
        padding: 24,
        fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div
          style={{
            background: "#fff",
            border: "1px solid #E7E3DA",
            borderRadius: 12,
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 240 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "#111", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800 }}>
              JH
            </div>
            <div style={{ fontSize: 14, fontWeight: 750, color: "#222" }}>Job Hunt</div>
            <div style={{ fontSize: 12, color: "#6E6A63", background: "#FAFAF8", border: "1px solid #EFEADF", padding: "2px 8px", borderRadius: 999 }}>
              Ayush Arora
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            {[
              { id: "paste", label: "Paste & Search" },
              { id: "fitment", label: "Fitment Analysis" },
              { id: "outreach", label: "Outreach & Follow-up" },
            ].map((t) => {
              const isActive = activeTab === t.id;
              const isEnabled = t.id === "paste";
              return (
                <button
                  key={t.id}
                  onClick={() => (isEnabled ? setActiveTab(t.id) : setActiveTab(t.id))}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 10,
                    border: "1px solid #E7E3DA",
                    background: isActive ? "#111" : "#fff",
                    color: isActive ? "#fff" : "#222",
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: "pointer",
                    opacity: isEnabled ? 1 : 0.75,
                  }}
                  title={isEnabled ? "" : "Placeholder for tomorrow"}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 240, justifyContent: "flex-end" }}>
            <div style={{ fontSize: 12, color: "#085041", background: "#E1F5EE", border: "1px solid #BFE7DA", padding: "4px 10px", borderRadius: 8, fontWeight: 700 }}>
              0 to apply
            </div>
            <div style={{ fontSize: 12, color: "#791F1F", background: "#FCEBEB", border: "1px solid #F2CACA", padding: "4px 10px", borderRadius: 8, fontWeight: 700 }}>
              0 disqualified
            </div>
          </div>
        </div>

        {activeTab !== "paste" ? (
          <div style={{ background: "#fff", border: "1px solid #E7E3DA", borderRadius: 12, padding: 18, color: "#6E6A63" }}>
            <div style={{ fontSize: 16, fontWeight: 750, color: "#222", marginBottom: 6 }}>
              {activeTab === "fitment" ? "Fitment Analysis" : "Outreach & Follow-up"}
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.6 }}>
              Placeholder for tomorrow. Paste & Search is ready today.
            </div>
          </div>
        ) : null}

        <div style={{ fontSize: 18, fontWeight: 650, color: "#222", marginBottom: 4 }}>Paste LinkedIn post</div>
        <div style={{ fontSize: 13, color: "#777", marginBottom: 14 }}>Copy the full post text and submit.</div>

        <div style={{ background: "#fff", border: "1px solid #E7E3DA", borderRadius: 12, padding: 16 }}>
          <input
            value={postLink}
            onChange={(e) => setPostLink(e.target.value)}
            placeholder="LinkedIn post URL (optional)"
            inputMode="url"
            style={{
              width: "100%",
              padding: "12px 12px",
              borderRadius: 10,
              border: "1px solid #E7E3DA",
              outline: "none",
              fontSize: 14,
              lineHeight: 1.4,
              color: "#222",
              background: "#fff",
              fontFamily: "inherit",
              marginBottom: 10,
            }}
          />
          <textarea
            value={rawPost}
            onChange={(e) => setRawPost(e.target.value)}
            placeholder="Paste the full LinkedIn post here — including the job description, person name, hashtags, everything..."
            style={{
              width: "100%",
              minHeight: 220,
              resize: "vertical",
              padding: "14px 14px",
              borderRadius: 10,
              border: "1px solid #E7E3DA",
              outline: "none",
              fontSize: 14,
              lineHeight: 1.55,
              color: "#222",
              background: "#fff",
              fontFamily: "inherit",
            }}
          />

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {error ? (
                <div style={{ fontSize: 12, color: "#7A1F1F", background: "#FCEBEB", border: "1px solid #F2CACA", padding: "8px 10px", borderRadius: 8 }}>
                  {error}
                </div>
              ) : null}
              {successId ? (
                <div style={{ fontSize: 12, color: "#085041", background: "#E1F5EE", border: "1px solid #BFE7DA", padding: "8px 10px", borderRadius: 8 }}>
                  Saved. job_search_id: {successId}
                </div>
              ) : null}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              style={{
                flex: "0 0 auto",
                padding: "12px 18px",
                borderRadius: 10,
                border: "1px solid #E7E3DA",
                background: canSubmit ? "#111" : "#E7E3DA",
                color: canSubmit ? "#fff" : "#8D8A84",
                fontSize: 14,
                fontWeight: 600,
                cursor: canSubmit ? "pointer" : "not-allowed",
                minWidth: 140,
              }}
            >
              {submitting ? "Submitting..." : "Submit post"}
            </button>
          </div>
        </div>

        <div style={{ marginTop: 16, background: "#fff", border: "1px solid #E7E3DA", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #EFEADF" }}>
            <div style={{ fontSize: 14, fontWeight: 650, color: "#222" }}>
              All posts — {postsLoading ? "loading..." : postsError ? "error" : `${posts.length} found`}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={loadPosts}
                disabled={postsLoading}
                style={{
                  padding: "8px 12px",
                  borderRadius: 10,
                  border: "1px solid #E7E3DA",
                  background: postsLoading ? "#E7E3DA" : "#fff",
                  color: postsLoading ? "#8D8A84" : "#222",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: postsLoading ? "not-allowed" : "pointer",
                }}
              >
                Refresh
              </button>
            </div>
          </div>

          {postsError ? (
            <div style={{ padding: 14, fontSize: 12, color: "#7A1F1F", background: "#FCEBEB", borderTop: "1px solid #F2CACA" }}>{postsError}</div>
          ) : null}
          {!postsError && postsHint ? (
            <div style={{ padding: 14, fontSize: 12, color: "#6E6A63", background: "#FAFAF8", borderTop: "1px solid #EFEADF" }}>{postsHint}</div>
          ) : null}
          {!postsLoading && !postsError && posts.length === 0 ? (
            <div style={{ padding: 14, fontSize: 12, color: "#6E6A63", background: "#FAFAF8", borderTop: "1px solid #EFEADF" }}>
              No posts found in Supabase.
            </div>
          ) : null}

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 920 }}>
              <thead>
                <tr style={{ background: "#FBFBFA", borderBottom: "1px solid #EFEADF" }}>
                  {[
                    "Company & Role",
                    "Job Posted By",
                    "Location",
                    "Salary",
                    "Domain",
                    "Fit",
                    "Status",
                    "View In Detail",
                  ].map((h) => (
                    <th key={h} style={{ textAlign: "left", fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", color: "#8A867D", padding: "10px 12px", fontWeight: 700 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {posts.map((p) => (
                  <tr key={p.job_search_id} style={{ borderBottom: "1px solid #F3EFE6" }}>
                    <td style={{ padding: "12px 12px", verticalAlign: "top" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#222", ...clamp2 }}>{formatMaybe(p.job_role)}</div>
                      {p.post_link ? (
                        <div style={{ marginTop: 4 }}>
                          <a href={p.post_link} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#0C447C", textDecoration: "none" }}>
                            Open post
                          </a>
                        </div>
                      ) : null}
                    </td>
                    <td style={{ padding: "12px 12px", verticalAlign: "top" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#222", ...clamp2 }}>{formatMaybe(p.person_name)}</div>
                      <div style={{ fontSize: 12, color: "#6E6A63", marginTop: 2, ...clamp2 }}>{formatMaybe(p.person_title)}</div>
                    </td>
                    <td style={{ padding: "12px 12px", verticalAlign: "top", fontSize: 13, color: "#222", ...clamp2 }}>{formatMaybe(p.location)}</td>
                    <td style={{ padding: "12px 12px", verticalAlign: "top", fontSize: 13, color: "#222", ...clamp2 }}>{formatMaybe(p.salary)}</td>
                    <td style={{ padding: "12px 12px", verticalAlign: "top" }}>
                      {p.domain ? (
                        <span style={{ display: "inline-block", fontSize: 12, padding: "3px 8px", borderRadius: 6, background: "#F1EFE8", color: "#444441", border: "1px solid #EFEADF" }}>
                          {p.domain}
                        </span>
                      ) : (
                        <span style={{ color: "#8D8A84", fontSize: 13 }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "12px 12px", verticalAlign: "top", color: "#8D8A84", fontSize: 13 }}>—</td>
                    <td style={{ padding: "12px 12px", verticalAlign: "top", color: "#8D8A84", fontSize: 13 }}>—</td>
                    <td style={{ padding: "12px 12px", verticalAlign: "top" }}>
                      <button
                        onClick={() => setActivePost(p)}
                        style={{
                          padding: "6px 10px",
                          borderRadius: 8,
                          border: "1px solid #E7E3DA",
                          background: "#fff",
                          fontSize: 12,
                          fontWeight: 650,
                          cursor: "pointer",
                        }}
                      >
                        View →
                      </button>
                    </td>
                  </tr>
                ))}
                {!postsLoading && posts.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: 18, color: "#8D8A84", fontSize: 13 }}>
                      {postsError ? "Could not load posts. Fix the error above and click Refresh." : "No posts found. Click Refresh to load from Supabase."}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {activePost ? (
        <div
          onClick={() => setActivePost(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            justifyContent: "flex-end",
            padding: 18,
            zIndex: 50,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(640px, 100%)",
              height: "100%",
              background: "#fff",
              borderRadius: 14,
              border: "1px solid #E7E3DA",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ padding: "14px 16px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", borderBottom: "1px solid #EFEADF" }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 750, color: "#222" }}>{formatMaybe(activePost.job_role)}</div>
                <div style={{ fontSize: 12, color: "#6E6A63", marginTop: 4 }}>
                  {formatMaybe(activePost.person_name)} · {formatMaybe(activePost.person_title)}
                </div>
              </div>
              <button
                onClick={() => setActivePost(null)}
                style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #E7E3DA", background: "#fff", cursor: "pointer", fontWeight: 700 }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: 16, overflow: "auto" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                {activePost.location ? <span style={{ fontSize: 12, padding: "4px 10px", borderRadius: 999, background: "#F1EFE8", border: "1px solid #EFEADF" }}>{activePost.location}</span> : null}
                {activePost.salary ? <span style={{ fontSize: 12, padding: "4px 10px", borderRadius: 999, background: "#F1EFE8", border: "1px solid #EFEADF" }}>{activePost.salary}</span> : null}
                {activePost.domain ? <span style={{ fontSize: 12, padding: "4px 10px", borderRadius: 999, background: "#EEEDFE", border: "1px solid #DCD8FF", color: "#3C3489" }}>{activePost.domain}</span> : null}
                {activePost.date_of_search ? <span style={{ fontSize: 12, padding: "4px 10px", borderRadius: 999, background: "#FAFAF8", border: "1px solid #EFEADF", color: "#6E6A63" }}>{activePost.date_of_search}</span> : null}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ gridColumn: "1 / -1", padding: 12, borderRadius: 12, border: "1px solid #EFEADF", background: "#FAFAF8" }}>
                  <div style={{ fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", color: "#8A867D", fontWeight: 800, marginBottom: 8 }}>Post</div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
                    {activePost.post_link ? (
                      <a href={activePost.post_link} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#0C447C", textDecoration: "none", fontWeight: 650 }}>
                        Open post link
                      </a>
                    ) : null}
                    {activePost.apply_link ? (
                      <a href={activePost.apply_link} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#0C447C", textDecoration: "none", fontWeight: 650 }}>
                        Apply link
                      </a>
                    ) : null}
                    {activePost.apply_email ? <span style={{ fontSize: 12, color: "#444441" }}>Apply email: {activePost.apply_email}</span> : null}
                  </div>
                  <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontFamily: "inherit", fontSize: 13, lineHeight: 1.6, color: "#222" }}>
                    {formatMaybe(activePost.raw_post)}
                  </pre>
                </div>

                <div style={{ padding: 12, borderRadius: 12, border: "1px solid #EFEADF", background: "#fff" }}>
                  <div style={{ fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", color: "#8A867D", fontWeight: 800, marginBottom: 8 }}>Responsibilities</div>
                  <div style={{ fontSize: 13, color: "#222", lineHeight: 1.55 }}>{formatMaybe(activePost.responsibilities)}</div>
                </div>

                <div style={{ padding: 12, borderRadius: 12, border: "1px solid #EFEADF", background: "#fff" }}>
                  <div style={{ fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", color: "#8A867D", fontWeight: 800, marginBottom: 8 }}>Skills Required</div>
                  <div style={{ fontSize: 13, color: "#222", lineHeight: 1.55 }}>{formatMaybe(activePost.skills_required)}</div>
                </div>

                <div style={{ padding: 12, borderRadius: 12, border: "1px solid #EFEADF", background: "#fff" }}>
                  <div style={{ fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", color: "#8A867D", fontWeight: 800, marginBottom: 8 }}>Hashtags</div>
                  <div style={{ fontSize: 13, color: "#222", lineHeight: 1.55 }}>{formatMaybe(activePost.hashtags)}</div>
                </div>

                <div style={{ padding: 12, borderRadius: 12, border: "1px solid #EFEADF", background: "#fff" }}>
                  <div style={{ fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", color: "#8A867D", fontWeight: 800, marginBottom: 8 }}>Other</div>
                  <div style={{ fontSize: 13, color: "#222", lineHeight: 1.55 }}>
                    Experience: {formatMaybe(activePost.experience)}
                    <br />
                    Hiring line: {formatMaybe(activePost.hiring_line)}
                    <br />
                    Job search id: {formatMaybe(activePost.job_search_id)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
