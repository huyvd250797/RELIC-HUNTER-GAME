# RELIC HUNTER V0.3.1 – Relic Selection Input Fix

Bản V0.3.1 là bản fix nhỏ sau V0.3.0, tập trung sửa lỗi màn **CHOOSE YOUR RELIC** bị kẹt không chọn được trên PC/mobile.

## Đã fix trong V0.3.1

- Cho phép **click chuột** vào card Relic trên PC để chọn.
- Cho phép **tap chạm** vào card Relic trên mobile để chọn.
- Thêm phím tắt **1 / 2 / 3** để chọn Relic tương ứng trên PC.
- Thêm hướng dẫn ngay trên màn chọn Relic: `Click/tap vào card hoặc nhấn 1 / 2 / 3`.
- Sau khi chọn Relic, overlay sẽ đóng, physics resume và game tiếp tục bình thường.
- Fix vùng hitbox của card Relic bằng `Zone` riêng, tránh lỗi card nhìn thấy nhưng không bắt input.
- Giữ nguyên toàn bộ nội dung của V0.3.0 – Relic System.

## Nội dung Relic System đang có

- Hạ **Elite / Mini-boss** sẽ mở màn chọn Relic đầu tiên.
- Hạ **Forest Guardian Boss** sẽ mở màn chọn Boss Relic trước khi mở Exit Portal.
- Mỗi lần chọn sẽ hiển thị **3 Relic ngẫu nhiên**, người chơi chọn 1.
- Relic đã chọn được hiển thị ở HUD **RELIC BUILD** bên trái.
- Relic có tác động thật vào gameplay, không chỉ là UI.

## Danh sách Relic

### Fire Blade
Đòn đánh có 35% gây Burn, đốt sát thương theo thời gian.

### Thunder Dash
Dash xuyên qua quái hoặc boss sẽ gây sát thương sét.

### Root Prison
Crescent Slash trói quái và làm chậm boss trong thời gian ngắn.

### Blood Pact
Hạ quái hồi máu. Hạ Elite/Boss hồi nhiều máu hơn.

### Guardian Shell
Giảm sát thương KAI nhận vào.

### Wind Step
Dash hồi nhanh hơn và lướt xa hơn.

### Heavy Impact
Combo hit 3 gây thêm sát thương và choáng quái ngắn.

### Relic Surge
Crescent Slash mạnh hơn, bay nhanh hơn và hồi chiêu nhanh hơn.

## Cách chọn Relic

Khi màn chọn Relic hiện lên:

### PC
- Click trực tiếp vào card Relic.
- Hoặc nhấn `1`, `2`, `3` để chọn card tương ứng.

### Mobile
- Tap trực tiếp vào card Relic.

Sau khi chọn, game sẽ tự đóng overlay và tiếp tục màn chơi.

## Cách chạy local

Yêu cầu: Node.js 18+.

```bash
npm run dev
```

Mở:

```text
http://localhost:5173
```

Nếu port 5173 bị chiếm:

```powershell
$env:PORT=5174; npm run dev
```

Mở:

```text
http://localhost:5174
```

## Điều khiển PC

- `A/D` hoặc `←/→`: di chuyển
- `SPACE`: nhảy
- `J`: đánh thường / combo
- `K`: dash
- `L`: Crescent Slash
- `1 / 2 / 3`: chọn Relic khi màn chọn hiện lên
- `R`: restart sau khi clear/fail

## Điều khiển Mobile

- Xoay ngang màn hình.
- Bên trái: joystick ảo mờ.
- Bên phải:
  - Attack
  - Skill
  - Dash
  - Jump
- Khi chọn Relic: tap vào card Relic.

## Build production

```bash
npm run build
```

Sau lệnh này sẽ có thư mục `dist/`.

## Deploy Vercel

- Framework Preset: `Other`
- Build Command: `npm run build`
- Output Directory: `dist`
- Không cần Environment Variables

## Deploy Cloudflare Pages

- Build command: `npm run build`
- Build output directory: `dist`
- V0.3.1 chưa bind D1/Workers

## Roadmap kế tiếp

Sau V0.3.1, bản tiếp theo hợp lý là:

```text
V0.4.0 – Official Art Pack 1
```

Lý do đổi từ V0.3.1 sang V0.4.0: V0.3.1 đã được dùng cho bug fix chọn Relic. Official Art Pack là nâng cấp visual lớn hơn, nên tách thành V0.4.0 sẽ rõ ràng hơn.

## Version

`RELIC HUNTER V0.3.1 – Relic Selection Input Fix`
