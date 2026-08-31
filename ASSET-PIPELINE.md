# RELIC HUNTER V0.4.2 – KAI Official Sprite Integration

## Mục tiêu

V0.4.2 đưa bộ sprite KAI chính thức đầu tiên vào game dựa trên pipeline đã chuẩn hóa ở V0.4.1.

## Nguyên tắc

- Sprite KAI nằm trong `public/assets/characters/kai/`.
- Game ưu tiên load asset thật.
- Nếu thiếu file, game fallback về runtime texture để không crash.
- Không thay đổi gameplay/combat logic khi thay sprite.

## Sprite KAI hiện có

- kai-idle.png
- kai-run.png
- kai-jump.png
- kai-fall.png
- kai-attack-1.png
- kai-attack-2.png
- kai-attack-3.png
- kai-dash.png
- kai-skill.png
- kai-hurt.png
- kai-death.png

## Kích thước hiện tại

96x96 px / state.

## Hướng nâng cấp tiếp theo

- Tách run thành nhiều frame animation thật.
- Tách idle breathing thành nhiều frame.
- Tạo attack anticipation/recovery frame.
- Tạo effect sprite sheet riêng cho Crescent Slash.
- Tích hợp Enemy/Boss official sprites.

## Bản tiếp theo

V0.4.3 – Enemy & Boss Official Sprite Integration.
