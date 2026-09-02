// RELIC HUNTER V0.7.1 – Save Sync Fix & Offline Retry Config
// Đã cấu hình theo Worker URL Boss deploy thành công.
// Không chứa token/bí mật; đây chỉ là public API endpoint.
window.RELIC_HUNTER_CLOUD = {
  enabled: true,
  apiBaseUrl: 'https://relic-hunter-cloud-save.huywork257.workers.dev',
  playerName: 'KAI',
  retryIntervalMs: 12000
};
