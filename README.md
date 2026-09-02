# RELIC HUNTER V0.7.1 – Save Sync Fix & Offline Retry

Bản này nâng cấp từ **V0.7.0 – Cloud Save + Workers + D1** và tập trung sửa/hoàn thiện phần lưu dữ liệu Cloudflare sau khi deploy thật.

## Nội dung chính

- Chống lưu trùng run ở localStorage.
- Chống cộng trùng `player_progress` trên Cloudflare D1 khi retry cùng một run.
- Thêm idempotency key cho mỗi run.
- Thêm retry queue local `relic_hunter_sync_queue_v2`.
- Tự retry khi:
  - mở game lại
  - trình duyệt online trở lại
  - mỗi 12 giây nếu còn queue
- Thêm timeout 8.5s cho request sync để tránh treo.
- Thêm trạng thái sync rõ hơn trong HUD:
  - `SAVE: CLOUD READY`
  - `SAVE: SYNCING...`
  - `SAVE: CLOUD SYNCED`
  - `SAVE: LOCAL • RETRY QUEUE`
  - `SAVE: OFFLINE • QUEUE`
- Run Summary hiển thị thêm:
  - Sync status
  - Retry queue
- Worker API hỗ trợ duplicate-safe save.
- Worker API thêm route kiểm tra trạng thái sync:
  - `GET /api/sync-status?runId=...`

## Cloud config

File `public/cloud-save-config.js` đã được cấu hình theo Worker URL Boss đã deploy:

```js
window.RELIC_HUNTER_CLOUD = {
  enabled: true,
  apiBaseUrl: 'https://relic-hunter-cloud-save.huywork257.workers.dev',
  playerName: 'KAI',
  retryIntervalMs: 12000
};
```

Nếu đổi Worker URL khác, sửa lại `apiBaseUrl`.

## Cách chạy game local

```powershell
npm run dev
```

Mở:

```text
http://localhost:5173
```

Nếu port bị chiếm:

```powershell
$env:PORT=5174; npm run dev
```

## Cập nhật Cloudflare Worker

Vào thư mục `worker`:

```powershell
cd worker
npm install
```

Nếu đã có D1 database từ V0.7.0, chạy migration mới:

```powershell
npx wrangler d1 migrations apply relic-hunter-db --remote
```

Sau đó deploy Worker:

```powershell
npx wrangler deploy --config wrangler.toml
```

Nếu `wrangler.toml` trong máy Boss đã có `database_id` và `account_id`, hãy giữ lại/copy sang file mới trước khi deploy.

## Kiểm tra Worker

```powershell
curl.exe https://relic-hunter-cloud-save.huywork257.workers.dev/api/health
```

Kiểm tra bảng:

```powershell
npx wrangler d1 execute relic-hunter-db --remote --command="SELECT name FROM sqlite_master WHERE type='table';"
```

Kiểm tra run history:

```powershell
npx wrangler d1 execute relic-hunter-db --remote --command="SELECT * FROM run_history ORDER BY created_at DESC LIMIT 5;"
```

Kiểm tra progress không bị cộng trùng:

```powershell
npx wrangler d1 execute relic-hunter-db --remote --command="SELECT * FROM player_progress;"
```

## Ghi chú kỹ thuật

V0.7.1 không yêu cầu người chơi đăng nhập. Player ID được tạo cục bộ bằng localStorage. Cloud save hiện dùng public Worker endpoint và D1, không lưu token trong frontend.

## Phiên bản tiếp theo

```text
V0.8.0 – Quality / Performance / Polish
```
