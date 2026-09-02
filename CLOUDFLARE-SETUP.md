# RELIC HUNTER V0.8.1 – Cloudflare Setup Notes

## Nếu đã deploy V0.7.1
V0.8.1 không yêu cầu migration D1 mới. Chỉ cần deploy lại Worker để cập nhật version và header response.

```powershell
cd worker
npm install
npx wrangler deploy --config wrangler.toml
```

## Nhớ giữ lại cấu hình thật

Trong `worker/wrangler.toml`, giữ:

```toml
account_id = "ACCOUNT_ID_THẬT"
database_id = "DATABASE_ID_THẬT"
```

Không commit token hoặc thông tin nhạy cảm.

## Test health

```powershell
curl.exe https://relic-hunter-cloud-save.huywork257.workers.dev/api/health
```

Kết quả nên có:

```json
{
  "ok": true,
  "service": "relic-hunter-cloud-save",
  "version": "0.8.1"
}
```

## Test dữ liệu

```powershell
npx wrangler d1 execute relic-hunter-db --remote --command="SELECT * FROM run_history ORDER BY created_at DESC LIMIT 5;"
```

## Nếu deploy lỗi
Chạy dry-run trước:

```powershell
npx wrangler deploy --dry-run --outdir .wrangler-dry
```

Nếu dry-run OK nhưng deploy lỗi, kiểm tra lại account_id, database_id, API token hoặc môi trường Node/Wrangler.


## V0.8.1 note

Bản V0.8.1 không yêu cầu migration D1 mới. Chỉ cần deploy lại Worker sau khi giữ nguyên `account_id` và `database_id` thật trong `worker/wrangler.toml`.
