# RELIC HUNTER V0.8.0 – Quality / Performance / Polish

## Mục tiêu
V0.8.0 không mở thêm hệ thống lớn. Bản này làm sạch chất lượng tổng thể trước khi đi vào các bản gần release.

## Quality additions

### FX Budget
Game có bộ giới hạn VFX:

- Desktop: khoảng 46 FX sống cùng lúc.
- Mobile: khoảng 28 FX sống cùng lúc.
- Khi frame time cao, game tự bật LOW FX mode.

### Cleanup
Transient FX được theo dõi và tự destroy sau thời gian ngắn. Khi kết thúc run/restart, các FX này được clear để tránh tồn dư.

### UI Throttle
HUD không còn vẽ lại quá dày mỗi frame nếu không cần thiết.

### Mobile Feel
Touch hitbox của nút mobile được mở rộng, joystick giảm độ che màn hình.

## Asset pipeline vẫn giữ
Các thư mục asset của KAI, enemy, boss, VFX, UI, map vẫn giữ nguyên từ V0.4.x đến V0.7.x.

## Ghi chú
Đây vẫn chưa phải production art cuối. Đây là bản polish chất lượng, hiệu năng và độ ổn định.
