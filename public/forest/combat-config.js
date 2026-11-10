(function (root) {
  'use strict';
  const config = {
    movement: { jumpSpeed: 700, airJumpSpeed: 520, gravity: 1550 },
    time: { enemy: .35, counter: .25, player: .65 },
    staff: { attackDuration: 2.2, damageScale: .3, rangeScale: .85, heal: 30, healCooldown: 7, healWindup: .65, purgeRadius: 185, purgeCooldown: 4, purgeWindup: .22 },
    boss: {
      bossHP: 3000, playerHP: 300, damageScale: 4, bindSeconds: .9, summonLife: 12,
      rushSpeed: [0, 790, 1180, 1260], leapDuration: [0, 3.2, 2.1, 1.95], umbrellaReach: [0, 200, 250, 310], bloomRadius: [0, 64, 90, 120],
      catSpeed: 190, rabbitInterval: 1.65, rabbitFirstShot: .7, rabbitIntervals: [0, 1.65, 2.3, 4], rabbitCounts: [0, 3, 3, 2],
      flowerCounts: [0, 9, 7, 5], flowerIntervals: [0, .22, .32, .45], recoverMin: [0, 1.1, 1.65, 2.4], centerHatInterval: 2.8,
      butterflyCounts: [0, 4, 6, 8], butterflyGather: .65, butterflyFlight: 2.8, butterflySpeed: 135,
      thornWindup: 1.65, thornActive: .28, thornWidth: 22,
      laughDuration: [0, 1, .7, .45], counterDuration: [0, 2.5, 3.2, 3.8], counterBind: 1.8,
      rainInterval: 1.75, ricochetWaves: 4, ricochetPerWave: 3, ricochetInterval: 1.1,
      heartHP: 144, heartInterval: 20, heartBreakRest: 1,
      cardCounts: [0, 3, 5, 0], cardChance: .45, cardBounces: 2
    }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = config; else root.ForestCombatConfig = config;
})(typeof window !== 'undefined' ? window : globalThis);
