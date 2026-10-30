import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { CharacterStats, GambitSlot, UniqueItem, EnemyState, UniqueRuleId } from '../types/game';
import { SKILLS_DB, UNIQUES_DB } from '../config/gameData';
import { computeFinalStats } from '../engine/statPipeline';

export interface CombatLogEntry {
  id: number;
  time: string;
  type: 'SKILL' | 'PROC' | 'DOT' | 'DAMAGE_TAKEN' | 'SYSTEM';
  text: string;
}

export const useCombatStore = defineStore('combat', () => {
  // 1. 装备与流派预设状态
  const equippedIds = ref<string[]>(['uq_frenzy_wand', 'uq_echo_crown', 'uq_void_amulet']);
  
  const equippedItems = computed<UniqueItem[]>(() =>
    UNIQUES_DB.filter(item => equippedIds.value.includes(item.id))
  );

  // 2. Gambit 战术槽配置 (4个优先级槽位)
  const gambitSlots = ref<GambitSlot[]>([
    { slotIndex: 0, skillId: 'sk_02', condition: 'ALWAYS', threshold: 0, currentCd: 0 },
    { slotIndex: 1, skillId: 'sk_05', condition: 'SELF_SHIELD_ABOVE', threshold: 0, currentCd: 0 },
    { slotIndex: 2, skillId: 'sk_01', condition: 'ALWAYS', threshold: 0, currentCd: 0 },
    { slotIndex: 3, skillId: 'sk_06', condition: 'ALWAYS', threshold: 0, currentCd: 0 },
  ]);

  // 3. 运行时战斗状态
  const isRunning = ref(false);
  const elapsedSeconds = ref(0);
  const actionCooldown = ref(0); // 角色全局施法间隔帧
  const manaSpentAccumulator = ref(0); // 用于【无限回响头冠】累计耗蓝检测

  const initialCalc = computeFinalStats(equippedItems.value);
  const runtimeStats = ref<CharacterStats>(initialCalc.stats);
  const activeRules = ref<Set<UniqueRuleId>>(initialCalc.activeRules);

  const enemy = ref<EnemyState>({
    name: '深渊泰坦·木桩首领 (Lv.85)',
    max_hp: 50000,
    current_hp: 50000,
    atk: 160,
    atk_interval: 1.5,
    bleed_stacks: 0,
    poison_stacks: 0,
  });
  let enemyAtkTimer = 0;

  // 4. 实时诊断仪统计数据 (Diagnostic Metrics)
  const damageBySource = ref<Record<string, number>>({});
  const totalDamageDealt = ref(0);
  const killCount = ref(0);
  const manaStarveTicks = ref(0); // 因缺蓝发呆的 Tick 计数
  const totalTicks = ref(0);
  const bestGpmBenchmark = ref(1240); // 历史最高离线效率分
  const logs = ref<CombatLogEntry[]>([]);
  let logSeq = 1;

  function addLog(type: CombatLogEntry['type'], text: string) {
    logs.value.unshift({
      id: logSeq++,
      time: `${elapsedSeconds.value.toFixed(1)}s`,
      type,
      text,
    });
    if (logs.value.length > 50) logs.value.pop();
  }

  function recordDamage(sourceName: string, amount: number) {
    const dmg = Math.round(amount);
    if (dmg <= 0) return;
    totalDamageDealt.value += dmg;
    damageBySource.value[sourceName] = (damageBySource.value[sourceName] || 0) + dmg;
    enemy.value.current_hp -= dmg;

    if (enemy.value.current_hp <= 0) {
      killCount.value += 1;
      enemy.value.current_hp = enemy.value.max_hp;
      enemy.value.bleed_stacks = 0;
      enemy.value.poison_stacks = 0;
      addLog('SYSTEM', `⚡ 击杀首领！累计击杀: ${killCount.value}，战利品效率跃升！`);
    }
  }

  // 重新计算装备与属性并重置沙盒
  function syncBuild() {
    const res = computeFinalStats(equippedItems.value);
    runtimeStats.value = res.stats;
    activeRules.value = res.activeRules;
    elapsedSeconds.value = 0;
    totalDamageDealt.value = 0;
    killCount.value = 0;
    manaStarveTicks.value = 0;
    totalTicks.value = 0;
    manaSpentAccumulator.value = 0;
    damageBySource.value = {};
    enemy.value.current_hp = enemy.value.max_hp;
    enemy.value.bleed_stacks = 0;
    enemy.value.poison_stacks = 0;
    gambitSlots.value.forEach(s => (s.currentCd = 0));
    logs.value = [];
    addLog('SYSTEM', '已重载流派配装与属性转化管线。');
  }

  // 一键应用预设流派
  function applyPreset(presetKey: 'CRIT_ENGINE' | 'THORNS_SELF_HIT' | 'AILMENT_NUKE' | 'NECRO_BOOM') {
    if (presetKey === 'CRIT_ENGINE') {
      equippedIds.value = ['uq_frenzy_wand', 'uq_echo_crown', 'uq_void_amulet'];
      gambitSlots.value = [
        { slotIndex: 0, skillId: 'sk_02', condition: 'ALWAYS', threshold: 0, currentCd: 0 },
        { slotIndex: 1, skillId: 'sk_05', condition: 'SELF_SHIELD_ABOVE', threshold: 0, currentCd: 0 },
        { slotIndex: 2, skillId: 'sk_01', condition: 'ALWAYS', threshold: 0, currentCd: 0 },
        { slotIndex: 3, skillId: 'sk_06', condition: 'ALWAYS', threshold: 0, currentCd: 0 },
      ];
    } else if (presetKey === 'THORNS_SELF_HIT') {
      equippedIds.value = ['uq_void_armor', 'uq_thorns_shield', 'uq_maiden_ring', 'uq_razor_boots'];
      gambitSlots.value = [
        { slotIndex: 0, skillId: 'sk_05', condition: 'SELF_SHIELD_ABOVE', threshold: 0, currentCd: 0 },
        { slotIndex: 1, skillId: 'sk_01', condition: 'ALWAYS', threshold: 0, currentCd: 0 },
        { slotIndex: 2, skillId: 'sk_02', condition: 'ALWAYS', threshold: 0, currentCd: 0 },
        { slotIndex: 3, skillId: 'sk_04', condition: 'ALWAYS', threshold: 0, currentCd: 0 },
      ];
    } else if (presetKey === 'AILMENT_NUKE') {
      equippedIds.value = ['uq_hunter_belt', 'uq_razor_boots', 'uq_crimson_gloves', 'uq_frenzy_wand'];
      gambitSlots.value = [
        { slotIndex: 0, skillId: 'sk_03', condition: 'TARGET_AILMENT_STACKS', threshold: 15, currentCd: 0 },
        { slotIndex: 1, skillId: 'sk_04', condition: 'ALWAYS', threshold: 0, currentCd: 0 },
        { slotIndex: 2, skillId: 'sk_01', condition: 'ALWAYS', threshold: 0, currentCd: 0 },
        { slotIndex: 3, skillId: 'sk_02', condition: 'ALWAYS', threshold: 0, currentCd: 0 },
      ];
    } else if (presetKey === 'NECRO_BOOM') {
      equippedIds.value = ['uq_bone_urn', 'uq_corpse_shroud', 'uq_soul_ring', 'uq_blank_idol'];
      gambitSlots.value = [
        { slotIndex: 0, skillId: 'sk_04', condition: 'ALWAYS', threshold: 0, currentCd: 0 },
        { slotIndex: 1, skillId: 'sk_03', condition: 'TARGET_AILMENT_STACKS', threshold: 12, currentCd: 0 },
        { slotIndex: 2, skillId: 'sk_05', condition: 'ALWAYS', threshold: 0, currentCd: 0 },
        { slotIndex: 3, skillId: 'sk_01', condition: 'ALWAYS', threshold: 0, currentCd: 0 },
      ];
    }
    syncBuild();
  }

  // Gambit 条件校验器
  function evaluateGambit(slot: GambitSlot): boolean {
    const s = runtimeStats.value;
    const e = enemy.value;
    switch (slot.condition) {
      case 'ALWAYS':
        return true;
      case 'SELF_HP_BELOW_PCT':
        return (s.current_hp / s.max_hp) * 100 <= slot.threshold;
      case 'SELF_SHIELD_ABOVE':
        return s.shield >= slot.threshold;
      case 'SELF_MANA_ABOVE_PCT':
        return (s.current_mana / s.max_mana) * 100 >= slot.threshold;
      case 'TARGET_AILMENT_STACKS':
        return e.bleed_stacks + e.poison_stacks >= slot.threshold;
      default:
        return true;
    }
  }

  // 执行具体技能与暗金规则联动
  function executeSkill(skillId: string, isAutoProc = false) {
    const skill = SKILLS_DB[skillId];
    const s = runtimeStats.value;
    const rules = activeRules.value;

    // 1. 铁处女之戒：释放技能时先自残 10% 护甲值，视作受击触发荆棘
    if (!isAutoProc && rules.has('IRON_MAIDEN_RING')) {
      const selfDmg = Math.round(s.armor * 0.1);
      s.shield = Math.max(0, s.shield - selfDmg);
      recordDamage('荆棘自残反射 (铁处女之戒)', s.thorns * 1.5);
      addLog('PROC', `[铁处女之戒] 自残 ${selfDmg} 护盾，触发荆棘反击！`);
    }

    // 2. 计算苦痛荆棘盾附加直伤与战靴/裹尸布直伤惩罚
    const thornsBonus = rules.has('AGONIZING_THORNS_SHIELD') ? s.thorns * 2.5 : 0;
    let hitPenaltyMult = rules.has('RAZOR_EDGE_BOOTS') ? 0.3 : 1.0;
    if (rules.has('CORPSE_SHROUD_ARMOR')) hitPenaltyMult *= 0.5;

    // 判定暴击与狂乱脉动魔杖减 CD 钩子
    const rollCrit = (): boolean => {
      const isCrit = Math.random() * 100 < s.crit_rate;
      if (isCrit && rules.has('FRENZY_PULSE_WAND')) {
        gambitSlots.value.forEach(slot => {
          slot.currentCd = Math.max(0, slot.currentCd - 0.5);
        });
      }
      return isCrit;
    };

    // 击中回蓝钩子 (饥渴虚空护符)
    const triggerOnHit = () => {
      if (rules.has('HUNGRY_VOID_AMULET')) {
        const manaGain = s.max_mana * 0.04;
        s.current_mana = Math.min(s.max_mana, s.current_mana + manaGain);
      }
    };

    if (skillId === 'sk_01') {
      const isCrit = rollCrit();
      const critMult = isCrit ? s.crit_dmg / 100 : 1;
      const dmg = (150 + thornsBonus) * hitPenaltyMult * critMult;
      recordDamage(isAutoProc ? '尸爆连携冲击 (裹尸布)' : skill.name, dmg);
      triggerOnHit();
      enemy.value.bleed_stacks += 2;
      addLog(isAutoProc ? 'PROC' : 'SKILL', `${isAutoProc ? '[裹尸布连携] ' : ''}释放【裂地猛击】造成 ${Math.round(dmg)} 伤害，叠加 2 层流血`);
    } else if (skillId === 'sk_02') {
      let totalHit = 0;
      let crits = 0;
      for (let i = 0; i < 3; i++) {
        const isCrit = rollCrit();
        if (isCrit) crits++;
        const critMult = isCrit ? s.crit_dmg / 100 : 1;
        totalHit += (80 + thornsBonus) * hitPenaltyMult * critMult;
        triggerOnHit();
      }
      recordDamage(skill.name, totalHit);
      addLog('SKILL', `【奥术连射】3 发命中 ${Math.round(totalHit)} 伤害 (暴击 ${crits} 次)`);
    } else if (skillId === 'sk_03') {
      const totalStacks = enemy.value.bleed_stacks + enemy.value.poison_stacks;
      const beltMult = rules.has('PATIENT_HUNTER_BELT') ? 1 + totalStacks * 0.12 : 1;
      const nukeDmg = (120 + totalStacks * 180 * beltMult) * (s.dot_mult / 100);
      recordDamage('瘟疫引爆 (叠层结算)', nukeDmg);
      enemy.value.bleed_stacks = 0;
      enemy.value.poison_stacks = 0;
      addLog('SKILL', `💥【瘟疫引爆】清空 ${totalStacks} 层异常，引爆 ${Math.round(nukeDmg)} 巨额伤害！`);
    } else if (skillId === 'sk_04') {
      const basePool = (rules.has('VOID_SIPHON_ARMOR') ? s.max_shield : s.max_hp) + (rules.has('SYMBIOTIC_SOUL_RING') ? s.armor : 0);
      const urnMult = rules.has('DECAY_BONE_URN') ? 2.0 : 1.0;
      const boomDmg = (basePool * 0.35 * urnMult + thornsBonus) * (s.dot_mult / 100);
      recordDamage('腐化骷髅自爆', boomDmg);
      enemy.value.poison_stacks += rules.has('DECAY_BONE_URN') ? 6 : 4;
      addLog('SKILL', `💀【腐化骷髅】冲锋自爆造成 ${Math.round(boomDmg)} 毒伤`);
      if (rules.has('CORPSE_SHROUD_ARMOR')) {
        executeSkill('sk_01', true);
      }
    } else if (skillId === 'sk_05') {
      const gainShield = rules.has('IRON_MAIDEN_RING') ? 450 * 0.7 : 450;
      s.shield = Math.min(s.max_shield, s.shield + gainShield);
      addLog('SKILL', `🩸【鲜血献祭】转化生成 ${Math.round(gainShield)} 点能量护盾`);
    } else if (skillId === 'sk_06') {
      // 单次施法耗蓝转化上限为 1000 点法力
      const manaUsed = Math.min(1000, s.max_mana * 0.3);
      const stormDmg = (manaUsed * 12 + thornsBonus) * hitPenaltyMult;
      recordDamage(isAutoProc ? '超载雷暴 (头冠自动触发)' : skill.name, stormDmg);
      addLog(isAutoProc ? 'PROC' : 'SKILL', `⚡${isAutoProc ? '[无限回响触发]' : ''}【超载雷暴】倾泻 ${Math.round(manaUsed)} 法力造成 ${Math.round(stormDmg)} 闪电伤害！`);
    }
  }

  // 核心 0.1s Tick 推进函数
  let timerId: number | null = null;

  function stepTick() {
    const dt = 0.1;
    elapsedSeconds.value = Number((elapsedSeconds.value + dt).toFixed(1));
    totalTicks.value += 1;

    const s = runtimeStats.value;
    const rules = activeRules.value;

    // 1. 资源自然回复与流失结算
    if (rules.has('HUNGRY_VOID_AMULET')) {
      s.current_mana = Math.max(0, s.current_mana - s.current_mana * 0.08 * dt);
    } else {
      s.current_mana = Math.min(s.max_mana, s.current_mana + s.mana_regen * dt);
    }

    if (!rules.has('VOID_SIPHON_ARMOR')) {
      s.shield = Math.min(s.max_shield, s.shield + 25 * dt);
    }

    // 2. 技能槽冷却缩减推进
    gambitSlots.value.forEach(slot => {
      if (slot.currentCd > 0) {
        slot.currentCd = Math.max(0, Number((slot.currentCd - dt).toFixed(2)));
      }
    });

    // 3. 持续伤害 (DoT) 每秒跳字结算 (每 0.5 秒结算一次)
    if (totalTicks.value % 5 === 0) {
      let dotMult = s.dot_mult / 100;
      if (rules.has('CRIMSON_ALCHEMY_GLOVES') && Math.random() * 100 < s.crit_rate) {
        dotMult *= s.crit_dmg / 100;
        enemy.value.bleed_stacks += 1;
        enemy.value.poison_stacks += 1;
      }
      const dotDmg =
        (enemy.value.bleed_stacks * 40 + enemy.value.poison_stacks * 45) *
        dotMult *
        0.5;
      if (dotDmg > 0) {
        recordDamage('流血/中毒持续伤害', dotDmg);
      }
    }

    // 4. 敌人攻击与荆棘反伤结算
    enemyAtkTimer += dt;
    if (enemyAtkTimer >= enemy.value.atk_interval) {
      enemyAtkTimer = 0;
      const incomingMult =
        (rules.has('SYMBIOTIC_SOUL_RING') ? 1.15 : 1.0) *
        (rules.has('GREEDY_GAMBLER_RING') ? 1.5 : 1.0);
      const rawMitigated = enemy.value.atk * incomingMult * (1 - s.armor / (s.armor + 1200));
      if (s.shield >= rawMitigated) {
        s.shield -= rawMitigated;
      } else {
        const overflow = rawMitigated - s.shield;
        s.shield = 0;
        s.current_hp = Math.max(1, s.current_hp - overflow);
      }
      if (s.thorns > 0) {
        recordDamage('受击荆棘反伤', s.thorns);
      }
    }

    // 5. 角色主动技能 Gambit AI 扫描
    if (actionCooldown.value > 0) {
      actionCooldown.value = Math.max(0, actionCooldown.value - dt);
    } else {
      for (const slot of gambitSlots.value) {
        // 若佩戴【无限回响头冠】，第4号槽 (index 3) 转为纯被动，跳过主动释放
        if (slot.slotIndex === 3 && rules.has('INFINITE_ECHO_CROWN')) continue;

        if (slot.currentCd <= 0 && evaluateGambit(slot)) {
          const skill = SKILLS_DB[slot.skillId];
          let actualManaCost =
            skill.manaCost < 0
              ? s.max_mana * (Math.abs(skill.manaCost) / 100)
              : skill.manaCost;

          if (rules.has('INFINITE_ECHO_CROWN')) {
            actualManaCost *= 2;
          }

          if (s.current_mana >= actualManaCost) {
            // 1. 单次施法耗蓝上限封顶 1000 点
            const cappedManaCost = Math.min(1000, actualManaCost);
            s.current_mana -= cappedManaCost;

            // 2. 计入【无限回响头冠】蓄水池（单次最多计入 1000 点有效耗蓝）
            manaSpentAccumulator.value += cappedManaCost;

            // 计算技能实际冷却
            let baseCd = skill.cooldown;
            if (slot.skillId === 'sk_03' && rules.has('PATIENT_HUNTER_BELT')) {
              baseCd = 8.0;
            }
            if (slot.skillId === 'sk_04' && rules.has('DECAY_BONE_URN')) {
              baseCd += 2.0;
            }
            slot.currentCd = Number((baseCd * (1 - s.cdr / 100)).toFixed(2));
            actionCooldown.value = Number((1 / s.atk_speed).toFixed(2));

            executeSkill(slot.skillId, false);

            // 3. 检查【无限回响头冠】累计耗蓝 200 自动多重触发 4 号槽（单次最多连发 5 次）
            if (rules.has('INFINITE_ECHO_CROWN') && manaSpentAccumulator.value >= 200) {
              const passiveSkillId = gambitSlots.value[3].skillId;
              let burstCount = 0;
              while (manaSpentAccumulator.value >= 200 && burstCount < 5) {
                manaSpentAccumulator.value -= 200;
                burstCount++;
                executeSkill(passiveSkillId, true);
              }
              if (burstCount > 1) {
                addLog('PROC', `👑 [无限回响头冠] 单次倾泻巨额法力，瞬间达成 ${burstCount} 连发！`);
              }
            }
            break;
          } else {
            manaStarveTicks.value += 1;
          }
        }
      }
    }
  }

  function toggleSimulation() {
    if (isRunning.value) {
      if (timerId) clearInterval(timerId);
      isRunning.value = false;
    } else {
      isRunning.value = true;
      timerId = window.setInterval(stepTick, 100);
    }
  }

  // 计算实时 DPS 与离线基准评分 (GPM)
  const currentDps = computed(() => {
    if (elapsedSeconds.value <= 0) return 0;
    return Math.round(totalDamageDealt.value / elapsedSeconds.value);
  });

  const currentGpmScore = computed(() => {
    const gamblerMult = activeRules.value.has('GREEDY_GAMBLER_RING') ? 1.45 : 1.0;
    return Math.round((currentDps.value * 0.45 + killCount.value * 180) * gamblerMult);
  });

  function lockBenchmark() {
    if (currentGpmScore.value > bestGpmBenchmark.value) {
      bestGpmBenchmark.value = currentGpmScore.value;
      addLog('SYSTEM', `🏆 新纪录！已锁定离线挂机收益基准为 ${bestGpmBenchmark.value} GPM`);
    }
  }

  return {
    equippedIds,
    equippedItems,
    gambitSlots,
    isRunning,
    elapsedSeconds,
    runtimeStats,
    activeRules,
    enemy,
    damageBySource,
    totalDamageDealt,
    killCount,
    manaStarveTicks,
    totalTicks,
    currentDps,
    currentGpmScore,
    bestGpmBenchmark,
    logs,
    syncBuild,
    applyPreset,
    toggleSimulation,
    lockBenchmark,
  };
});
