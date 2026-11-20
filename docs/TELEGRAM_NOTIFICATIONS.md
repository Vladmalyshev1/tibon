# TIBON — Telegram notifications

M7 uses a separate Telegram worker and the existing PostgreSQL database. The public API commits a lead and its outbox row in the same transaction. Telegram runs after commit, and Telegram failures have no effect on the HTTP response. Existing leads are retained without creating historical delivery jobs. The PDF form records `menu_adults` or `menu_kids` so the recipient can see which menu was requested.

## Bot setup and local startup

Use a dedicated bot and the authorized administrator's private chat or a restricted group. Before enabling delivery for real leads, obtain the approved data policy and consent text covering use of Telegram. Complete the [production readiness checks](PRODUCTION_READINESS.md).

1. Open [@BotFather](https://t.me/BotFather), run `/newbot`, and follow the prompts. Put the token in `TELEGRAM_BOT_TOKEN` in the root `.env` or the worker's secret environment.
2. In the intended chat, send the bot a `/start` command. For a group, add the bot and send `/start@your_bot_name`. Run `python -m app.notifications chat-ids` from `backend/` with the backend virtual environment active. It prints numeric IDs only. Set `TELEGRAM_CHAT_ID` to the chosen ID. Use a dedicated bot without a webhook for this discovery command.
3. With PostgreSQL running and the project installed, apply the migration and start the worker in a separate terminal. Use a process supervisor for a deployed worker.

```powershell
Set-Location backend
..\.venv\Scripts\python.exe -m alembic upgrade head
..\.venv\Scripts\python.exe -m app.notifications run
```

Start FastAPI as described in [ARCHITECTURE.md](ARCHITECTURE.md). In deployment, give Telegram credentials to the worker only. Run development and automation against an isolated PostgreSQL database and mock Telegram so queued fixtures cannot reach a real chat.

## Delivery and operator commands

- `python -m app.notifications status` prints counts by state. `python -m app.notifications status --lead-id UUID` prints the state, attempts, relevant timestamps, and a safe error code for a single UUID. These commands require local DB access and work without Telegram credentials.
- PostgreSQL assigns work to concurrent workers via `FOR UPDATE SKIP LOCKED`. A 60-second lease allows recovery after a worker stops. Telegram requests have a 10-second deadline. Network errors, temporary API errors and malformed replies retry automatically. Retry spacing starts at 15 seconds and doubles, respecting Telegram's `retry_after` when longer. Telegram client errors other than 408 and 429 terminate delivery for that job. Each cycle has at most five attempts.
- After resolving a terminal failure, `python -m app.notifications retry --lead-id UUID` requeues that one failed job. This starts a new bounded cycle. Check the destination chat for the UUID before requeuing when the previous result is uncertain.
- The queue prevents duplicate jobs for repeated API submissions. Telegram `sendMessage` has no client-supplied idempotency key. If Telegram accepts a message and the reply is lost, or the worker stops before saving the result, a retry may deliver the same UUID again. Each message includes the UUID for that reason.
- Messages contain the lead UUID, name, phone, format, and populated optional fields. The worker sends plain text, disables link previews and requests Telegram's protected-content handling. Queue rows store operational metadata and refer to the lead by UUID. They are deleted along with the lead. Application logs omit the bot token, message bodies, personal values and upstream error details.

[Telegram bot setup](https://core.telegram.org/bots/tutorial) · [Telegram Bot API](https://core.telegram.org/bots/api) · [PostgreSQL row locking](https://www.postgresql.org/docs/18/sql-select.html#SQL-FOR-UPDATE-SHARE)
