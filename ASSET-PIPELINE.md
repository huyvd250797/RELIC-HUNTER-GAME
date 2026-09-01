# RELIC HUNTER V0.6.1 – World 1 Puzzle Flow Fix & Difficulty Tuning

## Mục tiêu
V0.6.1 cải thiện puzzle flow của World 1, buộc người chơi phải quan sát và thu đủ key item trước khi vào Boss Arena.

## Puzzle Asset mới

```text
public/assets/maps/whispering-forest/props/
├── puzzle-moon-seal.png
├── puzzle-thorn-seal.png
└── puzzle-forest-seal.png
```

## Luật Root Gate

Root Gate mở khi đủ:

```text
Moon Seal + Thorn Seal + Forest Rune
```

Nếu thiếu, cổng không mở và game hiển thị thông báo seal còn thiếu.

## Logic chính

- `createPuzzleToken()` tạo seal token.
- `collectPuzzleToken()` thu Moon/Thorn Seal.
- `collectForestRune()` thu Forest Rune nhưng chưa mở gate nếu thiếu seal.
- `tryOpenRootGate()` kiểm tra đủ 3 dấu ấn.
- `updatePuzzleHud()` cập nhật UI puzzle.
- `canMeleeHit()` được siết chặt để không đánh xuyên tầng.

## Bản kế tiếp
V0.6.2 – World 1 Puzzle UX & Hint Polish.
