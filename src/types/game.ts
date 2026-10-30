export type SkillTag = 'PHYSICAL' | 'SPELL' | 'PROJECTILE' | 'HIT' | 'TOXIN' | 'SUMMON' | 'BUFF' | 'LIGHTNING' | 'AOE';

export interface CharacterStats {
  max_hp: number;
  current_hp: number;
  shield: number;
  max_shield: number;
  armor: number;
  all_res: number;        // 百分比，如 75 代表 75%
  max_mana: number;
  current_mana: number;
  mana_regen: number;
  atk_speed: number;      // 每秒施法/攻击次数
  crit_rate: number;      // 百分比
  crit_dmg: number;       // 百分比，默认 150
  cdr: number;            // 冷却缩减百分比，上限 80
  thorns: number;         // 荆棘物理面板
  dot_mult: number;       // 持续伤害总倍率百分比
}

export type ConditionType =
  | 'ALWAYS'
  | 'SELF_HP_BELOW_PCT'
  | 'SELF_SHIELD_ABOVE'
  | 'SELF_MANA_ABOVE_PCT'
  | 'TARGET_AILMENT_STACKS'
  | 'ON_CRIT_PROC'
  | 'ON_HIT_TAKEN';

export interface GambitSlot {
  slotIndex: number;      // 0 ~ 3 (优先级从高到低)
  skillId: string;
  condition: ConditionType;
  threshold: number;      // 条件阈值，如 30 代表 30% 或 30 层
  currentCd: number;      // 运行时剩余冷却 (秒)
}

export interface SkillConfig {
  id: string;
  name: string;
  tags: SkillTag[];
  manaCost: number;       // 负数代表百分比最大法力消耗
  cooldown: number;
  description: string;
}

// 15件规则暗金的核心机制钩子枚举
export type UniqueRuleId =
  | 'VOID_SIPHON_ARMOR'       // 虚空虹吸胸甲：生命锁定为1，最大生命150%转护盾，护盾不自然恢复
  | 'AGONIZING_THORNS_SHIELD' // 苦痛荆棘盾：技能附加250%荆棘伤害，暴击率锁死0%
  | 'IRON_MAIDEN_RING'        // 铁处女之戒：放技能自残10%护甲物理伤（视作受击），恢复降低30%
  | 'FRENZY_PULSE_WAND'       // 狂乱脉动魔杖：暴击时所有技能CD -0.5秒，暴伤锁死100%
  | 'INFINITE_ECHO_CROWN'     // 无限回响头冠：4号槽变被动，每耗200蓝自动触发，主动蓝耗翻倍
  | 'HUNGRY_VOID_AMULET'      // 饥渴虚空护符：击中回4%最大蓝，自然回蓝归零且每秒流失8%当前蓝
  | 'DECAY_BONE_URN'          // 凋零骨瓮：腐化骷髅自爆倍率翻倍，召唤冷却+2秒
  | 'CORPSE_SHROUD_ARMOR'     // 尸爆师的裹尸布：召唤物自爆时额外触发一次毒素裂地猛击，本体直伤-50%
  | 'SYMBIOTIC_SOUL_RING'     // 共生魂戒：生命上限与护甲100%同步加成召唤物，自身承伤+15%
  | 'CRIMSON_ALCHEMY_GLOVES'  // 猩红炼金手套：流血与中毒每跳可暴击并额外叠1层，异常持续缩短
  | 'RAZOR_EDGE_BOOTS'        // 剃刀边缘战靴：每10%冷却缩减转化为20%攻速，击中直伤降低70%
  | 'PATIENT_HUNTER_BELT'     // 耐心猎手腰带：目标每层异常使瘟疫引爆倍率+12%，但引爆CD增至8秒
  | 'REVERSE_HOURGLASS'       // 逆流沙漏：将全元素抗性溢出值100%转化为额外暴击率
  | 'GREEDY_GAMBLER_RING'     // 贪婪赌徒指环：掉落与GPM效率额外提升+45%，但首领攻击力提高50%
  | 'ARTISAN_BLANK_IDOL';     // 工匠的空白神像：全属性均衡增幅，提供T0级复合词缀加成

export interface UniqueItem {
  id: string;
  name: string;
  slot: 'WEAPON' | 'OFFHAND' | 'HELMET' | 'ARMOR' | 'GLOVES' | 'AMULET' | 'RING' | 'BELT' | 'BOOTS' | 'IDOL';
  ruleId: UniqueRuleId;
  baseMods: Partial<CharacterStats>;
  ruleText: string;
  penaltyText: string;
}

export interface EnemyState {
  name: string;
  max_hp: number;
  current_hp: number;
  atk: number;
  atk_interval: number;
  bleed_stacks: number;
  poison_stacks: number;
}
