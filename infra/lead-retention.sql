\set ON_ERROR_STOP on
\if :{?apply}
\else
  \set apply false
\endif
\if :{?not_before}
\else
  \set not_before ''
\endif

BEGIN;
SET LOCAL TIME ZONE 'Europe/Samara';
SET LOCAL lock_timeout = '3s';
SET LOCAL statement_timeout = '30s';

-- A finite cutover timestamp is required in both modes to protect existing leads.
CREATE TEMP TABLE retention_cutover (
  at timestamptz NOT NULL CHECK (isfinite(at) AND at <= CURRENT_TIMESTAMP)
) ON COMMIT DROP;
INSERT INTO retention_cutover VALUES (:'not_before'::timestamptz);

SELECT count(*) AS overdue_leads_requiring_review
FROM tibon.leads
LEFT JOIN tibon.telegram_notifications AS outbox ON outbox.lead_id = leads.id
WHERE leads.created_at + interval '1 month' <= CURRENT_TIMESTAMP
  AND (
    leads.created_at < (SELECT at FROM retention_cutover)
    OR leads.status NOT IN ('declined', 'archived')
    OR outbox.status IN ('pending', 'sending')
  );

\if :apply
  WITH candidates AS MATERIALIZED (
    SELECT id FROM tibon.leads
    WHERE created_at >= (SELECT at FROM retention_cutover)
      AND created_at + interval '1 month' <= CURRENT_TIMESTAMP
      AND status IN ('declined', 'archived')
    FOR UPDATE SKIP LOCKED
  ), locked_outbox AS MATERIALIZED (
    SELECT q.lead_id FROM tibon.telegram_notifications AS q
    JOIN candidates ON candidates.id = q.lead_id
    WHERE q.status IN ('sent', 'failed')
    FOR UPDATE OF q SKIP LOCKED
  ), deleted AS (
    DELETE FROM tibon.leads AS lead
    USING candidates
    WHERE lead.id = candidates.id
      AND (
        EXISTS (SELECT 1 FROM locked_outbox WHERE lead_id = lead.id)
        OR NOT EXISTS (SELECT 1 FROM tibon.telegram_notifications WHERE lead_id = lead.id)
      )
    RETURNING 1
  )
  SELECT count(*) AS deleted_leads FROM deleted
  \gset
  COMMIT;
  \echo deleted_leads=:deleted_leads
\else
  SELECT count(*) AS eligible_leads
  FROM tibon.leads
  LEFT JOIN tibon.telegram_notifications AS outbox ON outbox.lead_id = leads.id
  WHERE leads.created_at >= (SELECT at FROM retention_cutover)
    AND leads.created_at + interval '1 month' <= CURRENT_TIMESTAMP
    AND leads.status IN ('declined', 'archived')
    AND (outbox.status IS NULL OR outbox.status IN ('sent', 'failed'));
  ROLLBACK;
\endif
