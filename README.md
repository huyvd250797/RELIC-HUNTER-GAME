# RELIC HUNTER V0.2.1 – Visual & Animation Foundation

Bản này nâng cấp từ **V0.2.0 – Adventure Prototype**. Mục tiêu chính là bắt đầu đưa game từ trạng thái gameplay prototype sang trạng thái có cảm giác **đồ họa game + animation** rõ hơn.

## Điểm mới trong V0.2.1
- KAI không còn chỉ là một hình placeholder đứng yên.
- Thêm hệ thống animation nền tảng cho KAI bằng runtime sprite frames:
  - Idle
  - Run
  - Jump
  - Fall
  - Attack 1
  - Attack 2
  - Attack 3
  - Dash
  - Crescent Slash / Skill
  - Hurt
  - Death/Down pose nền tảng
- KAI có silhouette gần hơn với concept đã duyệt:
  - tóc tối màu
  - khăn/áo choàng teal
  - áo sáng + giáp/đai nâu đồng
  - Relic Blade phát sáng cyan
- Dash có ghost trail.
- Attack có slash arc lớn hơn, dễ đọc hơn.
- Skill có burst effect khi kích hoạt.
- Slime, Elite và Boss được làm lại texture runtime để bớt cảm giác hình khối.
- Môi trường Whispering Forest được nâng cấp:
  - parallax forest silhouettes
  - ruins/pillar layer
  - cyan relic glow
  - cây/cỏ foreground
  - platform có glow nhẹ
- Giữ toàn bộ gameplay của V0.2.0:
  - map đi cảnh
  - enemy wave
  - checkpoint
  - mini-boss/elite
  - treasure chest
  - boss Forest Guardian
  - portal kết thúc màn
- Giữ joystick mobile + nút MOBA bên phải.

## Lưu ý quan trọng về đồ họa thật
V0.2.1 là **Visual & Animation Foundation**, chưa phải final art production.

Bản này dùng runtime generated sprite/texture để:
- có animation sớm
- test cảm giác di chuyển/đánh/skill với hình nhân vật rõ hơn
- giữ source nhẹ
- không phụ thuộc file sprite sheet ngoài

Bước art production thật sau này sẽ là thay runtime frames bằng sprite sheet/Spine/Aseprite export dựa trên tạo hình KAI đã duyệt.

## Chạy local
Không cần `npm install`.

```bash
npm run dev
```

Mở:

```text
http://localhost:5173
```

Nếu bị lỗi port 5173 đang dùng:

```powershell
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

hoặc đổi port trong `server.js`.

## Điều khiển PC
- `A/D` hoặc `←/→`: di chuyển
- `Space`: nhảy
- `J`: combo 3 hit
- `K`: dash
- `L`: Crescent Slash
- `R`: restart khi clear màn

## Mobile
- Xoay ngang màn hình.
- Bên trái: joystick.
- Bên phải:
  - Attack lớn
  - Skill
  - Dash
  - Jump mũi tên lên

## Luồng chơi
START → enemy wave → checkpoint → enemy wave → elite → treasure chest → boss gate → Forest Guardian → Exit Portal → WORLD CLEAR.

## Phiên bản tiếp theo đề xuất
Sau V0.2.1, có 2 hướng:

### Hướng A – V0.2.2 Visual Polish Fix
Nếu cần tiếp tục làm đẹp:
- thêm cooldown overlay trên skill buttons
- thêm damage numbers chuẩn hơn
- thêm enemy death animation
- thêm boss telegraph đẹp hơn
- thêm camera shake/slow motion có kiểm soát

### Hướng B – V0.3.0 Relic System
Nếu gameplay + visual foundation đã ổn:
- kill boss nhận Relic
- chọn 1 trong 3 Relic
- Root Prison / Nature Dash
- buff theo run
- build gameplay đầu tiên

Khuyến nghị: test V0.2.1 trên mobile trước. Nếu cảm giác animation ổn, đi tiếp V0.3.0 Relic System.

## Version
RELIC HUNTER V0.2.1 – Visual & Animation Foundation
