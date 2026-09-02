# RELIC HUNTER V0.7.1 – Cloudflare Setup / Save Sync Fix

## 1. Giữ lại thông tin Cloudflare đang dùng

Nếu Boss đã deploy V0.7.0 thành công, trước khi thay source hãy giữ lại trong `worker/wrangler.toml`:

```toml
account_id = "ACCOUNT_ID_CUA_BOSS"

database_id = "DATABASE_ID_CUA_D1"
```

Không cần tạo D1 database mới nếu `relic-hunter-db` đã có.

## 2. Apply migration V0.7.1

V0.7.1 thêm bảng `sync_receipts` để hỗ trợ kiểm tra/ghi nhận retry sync.

```powershell
cd worker
npx wrangler d1 migrations apply relic-hunter-db --remote
```

Nếu Cloudflare hỏi:

```text
Your database may not be available to serve requests during the migration, continue? » (Y/n)
```

Nhập:

```text
Y
```

## 3. Deploy Worker mới

```powershell
npx wrangler deploy --config wrangler.toml
```

Sau khi deploy, test:

```powershell
curl.exe https://relic-hunter-cloud-save.huywork257.workers.dev/api/health
```

Kết quả mong muốn:

```json
{
  "ok": true,
  "service": "relic-hunter-cloud-save",
  "version": "0.7.1"
}
```

## 4. Test database

```powershell
npx wrangler d1 execute relic-hunter-db --remote --command="SELECT name FROM sqlite_master WHERE type='table';"
```

Nên thấy các bảng:

```text
players
run_history
player_progress
sync_receipts
```

## 5. Test trong game

Mở game local:

```powershell
npm run dev
```

Chơi xong 1 run. HUD nên đổi trạng thái:

```text
SAVE: SYNCING...
SAVE: CLOUD SYNCED
```

Nếu tắt mạng hoặc Worker lỗi:

```text
SAVE: LOCAL • RETRY QUEUE
SAVE: OFFLINE • QUEUE
```

Khi có mạng lại, game tự retry.

## 6. Kiểm tra dữ liệu lưu

```powershell
npx wrangler d1 execute relic-hunter-db --remote --command="SELECT id, result, time_ms, kills, coins_earned, version FROM run_history ORDER BY created_at DESC LIMIT 5;"
```

Kiểm tra không cộng trùng progress:

```powershell
npx wrangler d1 execute relic-hunter-db --remote --command="SELECT total_runs, wins, total_coins, boss_defeats FROM player_progress;"
```

## 7. Nếu deploy lỗi fetch failed

Trước đó Boss đã xử lý được bằng cách deploy rõ config:

```powershell
npx wrangler deploy --config wrangler.toml
```

Nếu lỗi lại, test:

```powershell
npx wrangler whoami
npx wrangler deploy --dry-run --outdir .wrangler-dry
```

Nếu dry-run OK nhưng deploy lỗi, kiểm tra lại account_id/database_id hoặc dùng API token.
