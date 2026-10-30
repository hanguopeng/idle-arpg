import type { CharacterStats, UniqueItem, UniqueRuleId } from '../types/game';

export function createBaseStats(): CharacterStats {
  return {
    max_hp: 1000,
    current_hp: 1000,
    shield: 0,
    max_shield: 100,
    armor: 150,
    all_res: 15,
    max_mana: 200,
    current_mana: 200,
    mana_regen: 20,
    atk_speed: 1.2,
    crit_rate: 10,
    crit_dmg: 150,
    cdr: 0,
    thorns: 20,
    dot_mult: 100,
  };
}

export function computeFinalStats(equippedItems: UniqueItem[]): {
  stats: CharacterStats;
  activeRules: Set<UniqueRuleId>;
} {
  const stats = createBaseStats();
  const activeRules = new Set<UniqueRuleId>();

  // Stage 1: 累加所有装备基础词缀与收集规则钩子
  for (const item of equippedItems) {
    activeRules.add(item.ruleId);
    for (const [key, val] of Object.entries(item.baseMods)) {
      const k = key as keyof CharacterStats;
      if (typeof val === 'number') {
        stats[k] += val;
      }
    }
  }

  // Stage 2: 跨系统属性转化 (Conversions)
  if (activeRules.has('REVERSE_HOURGLASS')) {
    stats.crit_rate += Math.floor(stats.all_res * 0.5);
    stats.atk_speed = Math.max(0.4, Number((stats.atk_speed - 0.15).toFixed(2)));
  }

  // 规则：剃刀边缘战靴 -> 每 10% CDR 转化为 +20% (即 +0.24) 攻速
  if (activeRules.has('RAZOR_EDGE_BOOTS')) {
    const bonusSpeed = (stats.cdr / 10) * 0.24;
    stats.atk_speed = Number((stats.atk_speed + bonusSpeed).toFixed(2));
  }

  // 规则：虚空虹吸胸甲 -> 最大生命以 150% 转化为护盾上限，生命锁定为 1
  if (activeRules.has('VOID_SIPHON_ARMOR')) {
    stats.max_shield += Math.floor(stats.max_hp * 1.5);
    stats.max_hp = 1;
  }

  // Stage 3: 硬性上限与规则锁死 (Hard Caps & Locks)
  stats.cdr = Math.min(80, stats.cdr);
  stats.all_res = Math.min(75, stats.all_res);

  if (activeRules.has('AGONIZING_THORNS_SHIELD')) {
    stats.crit_rate = 0; // 苦痛荆棘盾锁死暴击率为 0
  } else {
    stats.crit_rate = Math.min(100, stats.crit_rate);
  }

  if (activeRules.has('FRENZY_PULSE_WAND')) {
    stats.crit_dmg = 100; // 狂乱脉动魔杖锁死暴伤为 100%
  }

  if (activeRules.has('HUNGRY_VOID_AMULET')) {
    stats.mana_regen = 0; // 饥渴虚空护符锁死自然回蓝为 0
  }

  // 初始化当前生命/护盾/蓝量对齐上限
  stats.current_hp = stats.max_hp;
  stats.shield = stats.max_shield;
  stats.current_mana = stats.max_mana;

  return { stats, activeRules };
}
