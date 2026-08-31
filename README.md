# RELIC HUNTER V0.4.2 – KAI Official Sprite Integration

Bản này nâng cấp từ V0.4.1 và bắt đầu đưa **sprite chính thức đầu tiên của KAI** vào game.

## Nội dung chính

- Thêm bộ PNG sprite state đầu tiên cho KAI tại `public/assets/characters/kai/`.
- Game ưu tiên dùng sprite asset thật nếu file tồn tại.
- Giữ fallback runtime texture nếu asset thiếu hoặc bị đổi tên sai.
- Tích hợp KAI official sprite vào các state gameplay:
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
  - Death
- Cập nhật `asset-manifest.json` sang V0.4.2.
- Cập nhật tài liệu `ASSET-PIPELINE.md` và `SPRITE-INTEGRATION.md`.
- Giữ nguyên toàn bộ gameplay V0.4.1:
  - Relic System
  - chọn Relic bằng click/tap hoặc phím 1/2/3
  - PC skill dock + cooldown trên icon
  - Mobile joystick + nút MOBA
  - checkpoint, elite, chest, boss, exit portal

## File sprite KAI đã có

```text
public/assets/characters/kai/
├── kai-idle.png
├── kai-run.png
├── kai-jump.png
├── kai-fall.png
├── kai-attack-1.png
├── kai-attack-2.png
├── kai-attack-3.png
├── kai-dash.png
├── kai-skill.png
├── kai-hurt.png
├── kai-death.png
└── SPRITE-INTEGRATION.md
```

## Cách chạy

Giải nén ZIP, mở terminal tại thư mục có `package.json`, chạy:

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

## Ghi chú

Sprite trong V0.4.2 là **official sprite integration bước đầu** theo phong cách KAI đã chốt: tóc tối màu, khăn teal, áo sáng, chi tiết đồng, Relic Blade cyan.

Bản sau có thể nâng từ static state sprite sang spritesheet frame-by-frame hoặc Spine animation.

## Phiên bản tiếp theo

```text
V0.4.3 – Enemy & Boss Official Sprite Integration
```

Bản đó sẽ bắt đầu thay Slime, Elite và Forest Guardian bằng asset chính thức đầu tiên.
