# RELIC HUNTER V0.8.1 – Final Bug Fix Pass

Bản này nâng cấp từ **V0.8.0 – Quality / Performance / Polish** và tập trung rà lỗi cuối trước khi lên **V0.9.0 – Release Content Lock**.

## Nội dung cập nhật

### 1. UI / Click / Tap Reliability

- Tăng độ ổn định click/tap cho Relic card.
- Tăng fallback pointer cho PC skill dock.
- Nút `NEW RUN / RETRY` dùng `safeRestartRun()` để tránh restart khi physics/UI còn treo.
- Bắt cả `pointerdown` và `pointerup` cho các màn overlay quan trọng.
- Tắt context menu chuột phải để tránh làm kẹt input trong web game.

### 2. Restart Run Stability

- Clear transient VFX trước khi restart.
- Resume physics nếu đang bị pause.
- Đóng relic overlay/summary overlay trước khi restart.
- Chặn double restart khi người chơi vừa nhấn R vừa click nút.

### 3. Combat Hitbox Final Guard

- Siết lại tầng combat của đòn chém KAI.
- Quái khác tầng không bị mất máu chỉ vì gần theo đường chéo.
- Boss vẫn có tolerance riêng vì hitbox lớn hơn.
- Vẫn giữ kiểm tra vật cản giữa KAI và mục tiêu.

### 4. Cloud Save Edge-case Fix

- Thêm guard chống sync cùng một run nhiều lần đồng thời.
- Retry watchdog kiểm tra queue nếu online lại nhưng event `online` không bắn.
- Version save payload và Worker health cập nhật lên `0.8.1`.
- Không yêu cầu migration D1 mới so với V0.8.0/V0.7.1.

### 5. Final Stability Watch

- Tự resume physics nếu không còn ở màn Relic/Run Summary nhưng physics vẫn pause.
- Clamp actor định kỳ để giảm lỗi rơi khỏi nền.
- Giữ LOW FX/performance mode từ V0.8.0.

## Cloudflare Worker

Bản này **không cần migration mới**. Nếu đã apply migration `0002_sync_receipts.sql`, chỉ deploy lại Worker:

```powershell
cd worker
npm install
npx wrangler deploy --config wrangler.toml
```

Test:

```powershell
curl.exe https://relic-hunter-cloud-save.huywork257.workers.dev/api/health
```

Kết quả mong muốn có:

```json
{
  "ok": true,
  "service": "relic-hunter-cloud-save",
  "version": "0.8.1"
}
```

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

## Phiên bản tiếp theo

```text
V0.9.0 – Release Content Lock
```

Bản kế tiếp sẽ khóa nội dung chính trước khi lên **V1.0.0 – Release Candidate**.
