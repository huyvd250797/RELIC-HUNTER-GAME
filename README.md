# RELIC HUNTER V0.1.1 – Mobile Control Update

Phiên bản này nâng cấp giao diện điều khiển mobile để cảm giác chơi tự nhiên hơn trên điện thoại.

## Nội dung đã có
- KAI prototype: chạy, nhảy, dash có i-frame, combo 3 hit, Crescent Slash.
- 1 Corrupted Slime có AI đuổi theo người chơi.
- Boss Corrupted Forest Guardian: Charge, Ground Slam, Root Attack và Rage Phase 2.
- Player HP, Boss HP, skill cooldown, hit feedback, knockback, screen shake và boss intro camera.
- Keyboard + touch controls, thiết kế mobile landscape.
- **Nâng cấp mobile controls:**
  - Bên trái đổi sang **joystick ảo**.
  - Bên phải đổi sang layout kiểu **MOBA**.
  - **Nút đánh** là nút tròn lớn ở góc phải dưới.
  - Các **nút skill** là nút tròn nhỏ hơn, có icon kỹ năng.
  - **Nút nhảy** dùng icon **mũi tên lên**.
- Victory / Defeat / Restart.
- Concept art KAI tại `public/assets/reference/kai-concept.png`.
- Chưa có login, D1, Workers, inventory, relic hay cloud save — đúng scope prototype combat.

## 1. Chạy local
Yêu cầu: Node.js 18+ (khuyến nghị Node 20+).

Không cần `npm install` vì prototype không có package dependency local.

```bash
npm run dev
```

Sau đó mở:

```text
http://localhost:5173
```

> Phaser 3.90.0 đang được pin từ CDN trong `index.html`, vì vậy máy cần có Internet khi tải game.

## 2. Điều khiển PC
- `A/D` hoặc `←/→`: chạy
- `Space`: nhảy
- `J`: combo attack 3 hit
- `K`: dash / né
- `L`: Crescent Slash
- `R`: restart sau Victory/Defeat

## 3. Mobile
1. Mở URL game trên Chrome Android hoặc Safari iPhone.
2. Xoay điện thoại sang ngang.
3. **Bên trái:** kéo **joystick ảo** để di chuyển trái/phải.
4. **Bên phải:**
   - **Nút tròn lớn:** đánh thường / combo
   - **Nút tròn skill:** Crescent Slash
   - **Nút tròn dash:** né / lướt
   - **Nút mũi tên lên:** nhảy

## 4. Luồng chơi
START → Corrupted Slime → di chuyển qua BOSS GATE → Forest Guardian → Phase 2 khi boss còn 45% HP → Victory/Defeat.

## 5. Build production
```bash
npm run build
```

Sau lệnh trên sẽ có thư mục `dist/`.

## 6. Deploy Vercel
- Push source lên GitHub.
- Import repository vào Vercel.
- Framework Preset: `Other`.
- Build Command: `npm run build`.
- Output Directory: `dist`.
- Không cần Environment Variables.

## 7. Deploy Cloudflare Pages
- Kết nối repository GitHub.
- Build command: `npm run build`.
- Build output directory: `dist`.
- V0.1.1 chưa bind D1/Workers.

## 8. Tại sao chưa dùng hình KAI làm sprite trực tiếp?
Concept art hiện tại là character sheet/reference art, không phải sprite sheet animation. Prototype đang dùng texture vẽ runtime để kiểm thử gameplay ngay.

Sau khi combat được duyệt, art task tiếp theo là tạo bộ sprite KAI:
- Idle
- Run
- Jump
- Fall
- Attack 1
- Attack 2
- Attack 3
- Dash
- Crescent Slash
- Hurt
- Death

Khi có sprite sheet thật chỉ cần thay phần texture/animation, core combat vẫn được giữ nguyên.

## Version
`RELIC HUNTER V0.1.1 – Mobile Control Update`
