import type { SkillConfig, UniqueItem } from '../types/game';

export const SKILLS_DB: Record<string, SkillConfig> = {
  sk_01: {
    id: 'sk_01',
    name: '裂地猛击',
    tags: ['PHYSICAL', 'HIT'],
    manaCost: 15,
    cooldown: 0,
    description: '造成 150 点基础物理伤害，100% 几率施加 2 层【流血】（每层每秒 40 点物理伤害）。'
  },
  sk_02: {
    id: 'sk_02',
    name: '奥术连射',
    tags: ['SPELL', 'PROJECTILE', 'HIT'],
    manaCost: 25,
    cooldown: 1.2,
    description: '发射 3 枚独立飞弹，每枚造成 80 点法术伤害并独立判定暴击与击中回蓝。'
  },
  sk_03: {
    id: 'sk_03',
    name: '瘟疫引爆',
    tags: ['SPELL', 'TOXIN', 'AOE'],
    manaCost: 40,
    cooldown: 3.0,
    description: '引爆目标所有【流血/中毒】层数，每层造成 180 点爆发伤害并清空层数。'
  },
  sk_04: {
    id: 'sk_04',
    name: '腐化骷髅',
    tags: ['SUMMON', 'TOXIN'],
    manaCost: 45,
    cooldown: 3.5,
    description: '召唤自爆骷髅冲击敌人，造成角色最大生命/护盾池 35% 的毒素伤害并附加 4 层【中毒】。'
  },
  sk_05: {
    id: 'sk_05',
    name: '鲜血献祭',
    tags: ['SPELL', 'BUFF'],
    manaCost: 0,
    cooldown: 4.0,
    description: '献祭生命或护甲等效值，立即生成 450 点能量护盾并提升施法循环稳定性。'
  },
  sk_06: {
    id: 'sk_06',
    name: '超载雷暴',
    tags: ['SPELL', 'LIGHTNING', 'AOE'],
    manaCost: -30, // 消耗 30% 最大法力
    cooldown: 5.0,
    description: '倾泻 30% 最大法力值，每消耗 1 点法力造成 12 点闪电范围伤害。'
  }
};

export const UNIQUES_DB: UniqueItem[] = [
  {
    id: 'uq_void_armor',
    name: '1. 虚空虹吸胸甲',
    slot: 'ARMOR',
    ruleId: 'VOID_SIPHON_ARMOR',
    baseMods: { max_hp: 600, max_shield: 300, all_res: 20 },
    ruleText: '最大生命锁定为 1；所有最大生命以 150% 倍率转化为能量护盾上限。',
    penaltyText: '能量护盾无法随时间自然充能。'
  },
  {
    id: 'uq_thorns_shield',
    name: '2. 苦痛荆棘盾',
    slot: 'OFFHAND',
    ruleId: 'AGONIZING_THORNS_SHIELD',
    baseMods: { armor: 450, thorns: 280 },
    ruleText: '所有主动技能附加等同于【荆棘反射 250%】的物理直伤。',
    penaltyText: '你的暴击率永久锁定为 0%。'
  },
  {
    id: 'uq_maiden_ring',
    name: '3. 铁处女之戒',
    slot: 'RING',
    ruleId: 'IRON_MAIDEN_RING',
    baseMods: { armor: 200, thorns: 150, cdr: 15 },
    ruleText: '每次释放技能对自己造成 10% 护甲值的物理伤害（视作被敌人击中，触发荆棘反击）。',
    penaltyText: '护盾与生命恢复效果降低 30%。'
  },
  {
    id: 'uq_frenzy_wand',
    name: '4. 狂乱脉动魔杖',
    slot: 'WEAPON',
    ruleId: 'FRENZY_PULSE_WAND',
    baseMods: { atk_speed: 0.4, crit_rate: 35, max_mana: 150 },
    ruleText: '每当技能暴击时，所有冷却中的技能剩余 CD 立即缩短 0.5 秒。',
    penaltyText: '暴击伤害倍率永久锁定为 100%（暴击无额外伤害）。'
  },
  {
    id: 'uq_echo_crown',
    name: '5. 无限回响头冠',
    slot: 'HELMET',
    ruleId: 'INFINITE_ECHO_CROWN',
    baseMods: { max_mana: 350, cdr: 20 },
    ruleText: '4 号技能槽变为被动触发：每累计消耗 200 点法力自动无消耗释放一次（支持单次多重连发，单次施法最多计入 1000 点耗蓝 / 连发 5 次）。',
    penaltyText: '所有主动技能的基础法力消耗翻倍（+100%）。'
  },
  {
    id: 'uq_void_amulet',
    name: '6. 饥渴虚空护符',
    slot: 'AMULET',
    ruleId: 'HUNGRY_VOID_AMULET',
    baseMods: { max_mana: 250, crit_rate: 15 },
    ruleText: '每次击中敌人（On-Hit）立刻恢复最大法力值的 4%。',
    penaltyText: '自然回蓝归零，且每秒自动流失 8% 当前法力。'
  },
  {
    id: 'uq_bone_urn',
    name: '7. 凋零骨瓮',
    slot: 'OFFHAND',
    ruleId: 'DECAY_BONE_URN',
    baseMods: { max_hp: 400, dot_mult: 35 },
    ruleText: '【腐化骷髅】召唤即刻剧烈自爆，自爆基础伤害翻倍（200%）并额外附加 2 层中毒。',
    penaltyText: '【腐化骷髅】的基础冷却时间增加 +2.0 秒。'
  },
  {
    id: 'uq_corpse_shroud',
    name: '8. 尸爆师的裹尸布',
    slot: 'ARMOR',
    ruleId: 'CORPSE_SHROUD_ARMOR',
    baseMods: { max_hp: 350, armor: 180, cdr: 15 },
    ruleText: '每当施放【腐化骷髅】自爆时，自动连携触发一次无消耗的毒素【裂地猛击】。',
    penaltyText: '角色本体的常规技能击中直伤降低 50%。'
  },
  {
    id: 'uq_soul_ring',
    name: '9. 共生魂戒',
    slot: 'RING',
    ruleId: 'SYMBIOTIC_SOUL_RING',
    baseMods: { max_hp: 450, armor: 220 },
    ruleText: '你的护甲值 100% 附加到【腐化骷髅】的自爆基础伤害池中。',
    penaltyText: '角色受到的首领攻击伤害提高 15%。'
  },
  {
    id: 'uq_crimson_gloves',
    name: '10. 猩红炼金手套',
    slot: 'GLOVES',
    ruleId: 'CRIMSON_ALCHEMY_GLOVES',
    baseMods: { crit_rate: 20, dot_mult: 30 },
    ruleText: '持续伤害（流血/中毒）每跳可产生暴击，暴击时自动为目标额外叠加 1 层流血与中毒。',
    penaltyText: '每次跳字后异常层数自然衰减 1 层。'
  },
  {
    id: 'uq_razor_boots',
    name: '11. 剃刀边缘战靴',
    slot: 'BOOTS',
    ruleId: 'RAZOR_EDGE_BOOTS',
    baseMods: { cdr: 30, atk_speed: 0.2 },
    ruleText: '每拥有 10% 冷却缩减 (CDR)，额外转化为 +20% 攻击/施法速度。',
    penaltyText: '所有技能的击中直伤降低 70%。'
  },
  {
    id: 'uq_hunter_belt',
    name: '12. 耐心猎手腰带',
    slot: 'BELT',
    ruleId: 'PATIENT_HUNTER_BELT',
    baseMods: { dot_mult: 40, max_hp: 300 },
    ruleText: '目标每有 1 层异常状态，【瘟疫引爆】结算伤害额外提高 +12%。',
    penaltyText: '【瘟疫引爆】基础冷却时间延长至 8.0 秒。'
  },
  {
    id: 'uq_hourglass',
    name: '13. 逆流沙漏',
    slot: 'IDOL',
    ruleId: 'REVERSE_HOURGLASS',
    baseMods: { all_res: 45, cdr: 10 },
    ruleText: '全元素抗性突破常规限制，将面板元素抗性的 50% 直接转化为额外暴击率。',
    penaltyText: '基础施法频率降低 0.15/s。'
  },
  {
    id: 'uq_gambler_ring',
    name: '14. 贪婪赌徒指环',
    slot: 'RING',
    ruleId: 'GREEDY_GAMBLER_RING',
    baseMods: { crit_dmg: 45, max_mana: 120 },
    ruleText: '离线挂机效率分（GPM）结算时额外获得 1.45 倍独立乘区加成。',
    penaltyText: '首领怪物的攻击力提高 50%。'
  },
  {
    id: 'uq_blank_idol',
    name: '15. 工匠的空白神像 (T0合成态)',
    slot: 'IDOL',
    ruleId: 'ARTISAN_BLANK_IDOL',
    baseMods: { atk_speed: 0.35, cdr: 15, dot_mult: 35, thorns: 120 },
    ruleText: '已吞噬 3 条蓝色魔法装备 T0 词缀：提供高额复合攻速、冷却、持续伤与荆棘。',
    penaltyText: '词缀已永久铭刻锁定。'
  }
];
