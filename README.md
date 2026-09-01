# RELIC HUNTER V0.6.1 – World 1 Puzzle Flow Fix & Difficulty Tuning

Bản này nâng cấp từ **V0.6.0 – World 1 Content Expansion**.

Trọng tâm: làm cho World 1 bớt chạy thẳng, buộc người chơi phải quan sát, thử đường nhảy, lấy đủ dấu ấn và suy nghĩ trước khi vượt qua Root Gate.

## Nội dung chính

### 1. Puzzle Flow mới: 3 dấu ấn mở Root Gate

Root Gate không còn mở chỉ bằng Forest Rune. Người chơi phải thu đủ:

```text
Moon Seal   – nằm ở khu Mossy Rock Block
Thorn Seal  – nằm ở khu Fallen Tree
Forest Rune – nằm ở Ancient Ruins
```

Sau khi đủ 3 dấu ấn, Root Gate mới mở.

### 2. Mossy Rock Block khó hơn

Khu đá chắn đường đã được chỉnh lại thành bài toán quan sát đường cao:

```text
Không chạy thẳng được
→ tìm bệ thấp
→ nhảy lên bệ giữa
→ lên seal ledge
→ lấy Moon Seal
→ vượt đá
```

### 3. Fallen Tree có timing hơn

Khu cây đổ cần Jump + Dash hợp lý để lấy Thorn Seal. Nếu bỏ qua, người chơi vẫn sẽ bị chặn ở Root Gate và phải quay lại tìm seal còn thiếu.

### 4. Ancient Root Gate có điều kiện rõ hơn

Root Gate hiện kiểm tra đủ 3 điều kiện:

```text
Moon Seal collected
+ Thorn Seal collected
+ Forest Rune collected
= Gate opened
```

Nếu chưa đủ, game sẽ nhắc seal còn thiếu.

### 5. UI Puzzle HUD

Thêm HUD trạng thái puzzle:

```text
PUZZLE SEALS 0/3 • □ Moon  □ Thorn  □ Forest
```

HUD sẽ cập nhật khi người chơi lấy từng dấu ấn.

### 6. Difficulty Tuning

Đã tinh chỉnh:

- Giảm nhẹ reward coin/heal để run không quá dễ.
- Area Root Gate Trial chỉ clear khi giải xong puzzle.
- Checkpoint Root Gate chỉ kích hoạt sau khi cổng đã mở.
- Boss chỉ kích hoạt sau khi Root Gate đã mở.
- Đòn chém KAI kiểm tra tầng combat chặt hơn, giảm lỗi chém xuyên xuống dưới.

## Vẫn giữ nguyên

- Roguelite Run System
- Relic System
- KAI / Enemy / Boss sprite pipeline
- Environment & VFX Polish
- PC skill dock
- Mobile joystick + MOBA button
- Run Summary
- Retry / New Run

## Cách chạy

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
V0.6.2 – World 1 Puzzle UX & Hint Polish
```

Bản tiếp theo nên làm hệ thống hint tốt hơn: chỉ gợi ý khi người chơi kẹt lâu, thêm visual cue, điều chỉnh khoảng nhảy và vị trí platform.
