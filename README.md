# RELIC HUNTER V0.8.0 – Quality / Performance / Polish

Bản này nâng cấp từ **V0.7.1 – Save Sync Fix & Offline Retry** và tập trung làm game ổn định, mượt và gần release hơn.

## Nội dung chính

### 1. Performance polish

- Thêm FX budget để tránh quá nhiều hiệu ứng tồn tại cùng lúc.
- Tự bật **LOW FX mode** khi frame time cao hoặc nhiều VFX.
- Dọn transient VFX khi kết thúc run/restart.
- Giảm camera shake và particle khi máy yếu/mobile.
- Throttle update HUD để giảm render text/graphics không cần thiết mỗi frame.
- Tối ưu một số VFX:
  - dash trail
  - hit spark
  - burn
  - lightning
  - root
  - death burst
  - ground crack
  - boss warning

### 2. UI / HUD polish

- HP bar có viền và đổi màu theo máu.
- Thêm text HP `current / 100`.
- Thêm trạng thái performance nhỏ: `QUALITY / LOW FX + FPS`.
- Cloud Save HUD giảm cập nhật dư thừa.
- Skill dock PC được polish label.
- Mobile touch hitbox lớn hơn, dễ tap hơn.

### 3. Stability polish

- Khi restart run, transient FX được clear trước.
- Save Sync status không bị spam update liên tục.
- Giữ nguyên retry queue/offline sync của V0.7.1.
- Worker health trả thêm version/timestamp và header no-store.

## Tính năng vẫn giữ nguyên

- World 1 Content Expansion.
- Puzzle seals: Moon / Thorn / Forest.
- Root Gate logic.
- Roguelite Run System.
- Relic System.
- Cloud Save + Workers + D1.
- Offline retry queue.
- KAI / Enemy / Boss sprite pipeline.
- Environment & VFX Polish.

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

## Deploy Worker Cloudflare

Nếu Boss đã deploy V0.7.1 rồi, V0.8.0 không bắt buộc migration mới. Chỉ cần giữ lại `account_id` và `database_id` thật trong `worker/wrangler.toml`, sau đó:

```powershell
cd worker
npm install
npx wrangler deploy --config wrangler.toml
```

Test Worker:

```powershell
curl.exe https://relic-hunter-cloud-save.huywork257.workers.dev/api/health
```

Kết quả mong muốn có version:

```json
{
  "ok": true,
  "service": "relic-hunter-cloud-save",
  "version": "0.8.0"
}
```

## Kiểm tra build

```powershell
node --check public/main.js
node --check worker/src/index.js
node build.js
```

## Phiên bản tiếp theo

```text
V0.8.1 – Final Bug Fix Pass
```

Bản tiếp theo nên tập trung test toàn bộ luồng trên PC/mobile, Cloudflare, restart run, puzzle flow, boss fight và save sync.
