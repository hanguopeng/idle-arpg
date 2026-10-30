<template>
  <div class="min-h-screen bg-[#FAF8F5] text-slate-800 p-6 font-sans selection:bg-amber-500/20">
    <!-- 顶部战术导航与离线效率基准栏 -->
    <header class="max-w-7xl mx-auto mb-6 bg-white/90 backdrop-blur-md border border-amber-200/80 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="w-3 h-8 rounded-full bg-gradient-to-b from-amber-500 to-orange-600"></div>
        <div>
          <h1 class="text-lg font-bold tracking-tight text-slate-900">
            AETHERFORGE // 暗黑挂机机制沙盒 v1.0
          </h1>
          <p class="text-xs text-slate-500">
            15 件规则改写暗金 × Gambit 战术触发器 × 实时 DPS 诊断仪
          </p>
        </div>
      </div>

      <!-- 一键流派预设验证 -->
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-xs font-semibold uppercase tracking-wider text-slate-400 mr-1">流派预设:</span>
        <button
          @click="store.applyPreset('CRIT_ENGINE')"
          class="px-3 py-1.5 text-xs font-medium rounded-lg border border-amber-300 bg-amber-50/70 text-amber-900 hover:bg-amber-100 transition cursor-pointer"
        >
          ⚡ 暴击耗蓝永动机
        </button>
        <button
          @click="store.applyPreset('THORNS_SELF_HIT')"
          class="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition cursor-pointer"
        >
          🛡️ 1血护盾自残荆棘流
        </button>
        <button
          @click="store.applyPreset('AILMENT_NUKE')"
          class="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition cursor-pointer"
        >
          ☠️ 极限叠层毒爆流
        </button>
        <button
          @click="store.applyPreset('NECRO_BOOM')"
          class="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition cursor-pointer"
        >
          💀 死灵自爆连携流
        </button>
      </div>

      <!-- 离线效率基准锁 -->
      <div class="flex items-center gap-4 bg-[#F4F1EA] px-4 py-2 rounded-xl border border-amber-900/10">
        <div>
          <div class="text-[11px] text-slate-500">当前实测效率 / 历史离线基准</div>
          <div class="text-sm font-bold text-slate-900">
            <span class="text-amber-600">{{ store.currentGpmScore }}</span>
            <span class="text-slate-400 mx-1">/</span>
            <span>{{ store.bestGpmBenchmark }} GPM</span>
          </div>
        </div>
        <button
          @click="store.lockBenchmark()"
          class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-amber-300 hover:bg-slate-800 transition cursor-pointer"
        >
          锁定离线基准
        </button>
      </div>
    </header>

    <!-- 主体三栏网格 -->
    <main class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      <!-- 左栏 (4列)：规则暗金装配与转换面板 -->
      <section class="lg:col-span-4 space-y-4">
        <div class="bg-white/90 border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-sm font-bold uppercase tracking-wider text-slate-700">
              1. 规则改写暗金库 ({{ store.equippedIds.length }}/15 已装备)
            </h2>
            <span class="text-xs text-amber-600 font-medium">点击自由混搭</span>
          </div>

          <div class="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            <div
              v-for="item in UNIQUES_DB"
              :key="item.id"
              @click="toggleEquip(item.id)"
              :class="[
                'p-3 rounded-xl border transition cursor-pointer',
                store.equippedIds.includes(item.id)
                  ? 'bg-amber-50/70 border-amber-400 shadow-xs'
                  : 'bg-slate-50/60 border-slate-200/70 opacity-75 hover:opacity-100'
              ]"
            >
              <div class="flex items-center justify-between mb-1">
                <span class="font-bold text-xs text-slate-900">{{ item.name }}</span>
                <span class="text-[10px] px-2 py-0.5 rounded bg-slate-200/80 text-slate-700 font-mono">
                  {{ item.slot }}
                </span>
              </div>
              <p class="text-xs text-emerald-700 font-medium leading-relaxed">
                ✦ {{ item.ruleText }}
              </p>
              <p class="text-[11px] text-rose-600 mt-0.5">
                ✖ {{ item.penaltyText }}
              </p>
            </div>
          </div>
        </div>

        <!-- 实时属性转化结算面板 -->
        <div class="bg-white/90 border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <h2 class="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3">
            属性转化管线结算面板
          </h2>
          <div class="grid grid-cols-2 gap-2.5 text-xs">
            <div class="p-2.5 rounded-lg bg-[#F8F6F1] flex justify-between">
              <span class="text-slate-500">最大生命:</span>
              <span class="font-mono font-bold text-slate-900">{{ store.runtimeStats.max_hp }}</span>
            </div>
            <div class="p-2.5 rounded-lg bg-[#F8F6F1] flex justify-between">
              <span class="text-slate-500">能量护盾上限:</span>
              <span class="font-mono font-bold text-cyan-700">{{ store.runtimeStats.max_shield }}</span>
            </div>
            <div class="p-2.5 rounded-lg bg-[#F8F6F1] flex justify-between">
              <span class="text-slate-500">最大法力 / 回蓝:</span>
              <span class="font-mono font-bold text-indigo-700">
                {{ store.runtimeStats.max_mana }} ({{ store.runtimeStats.mana_regen }}/s)
              </span>
            </div>
            <div class="p-2.5 rounded-lg bg-[#F8F6F1] flex justify-between">
              <span class="text-slate-500">施法频率:</span>
              <span class="font-mono font-bold text-amber-700">{{ store.runtimeStats.atk_speed }}/s</span>
            </div>
            <div class="p-2.5 rounded-lg bg-[#F8F6F1] flex justify-between">
              <span class="text-slate-500">暴击率 / 暴伤:</span>
              <span class="font-mono font-bold text-slate-900">
                {{ store.runtimeStats.crit_rate }}% / {{ store.runtimeStats.crit_dmg }}%
              </span>
            </div>
            <div class="p-2.5 rounded-lg bg-[#F8F6F1] flex justify-between">
              <span class="text-slate-500">护甲 / 荆棘面板:</span>
              <span class="font-mono font-bold text-emerald-700">
                {{ store.runtimeStats.armor }} / {{ store.runtimeStats.thorns }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- 中栏 (4列)：Gambit AI 触发器矩阵与实时战斗视窗 -->
      <section class="lg:col-span-4 space-y-4">
        <div class="bg-white/90 border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-sm font-bold uppercase tracking-wider text-slate-700">
              2. Gambit 技能触发优先级矩阵
            </h2>
            <span class="text-[11px] text-slate-400">每 0.1s 自上而下扫描</span>
          </div>

          <div class="space-y-3">
            <div
              v-for="(slot, idx) in store.gambitSlots"
              :key="slot.slotIndex"
              class="p-3 rounded-xl bg-[#F8F6F1] border border-slate-200/90 space-y-2"
            >
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-amber-700">
                  优先级 #{{ idx + 1 }}
                  <span
                    v-if="idx === 3 && store.activeRules.has('INFINITE_ECHO_CROWN')"
                    class="ml-1 px-1.5 py-0.5 text-[10px] bg-indigo-100 text-indigo-800 rounded"
                  >
                    头冠被动触发槽
                  </span>
                </span>
                <span class="text-[11px] font-mono text-slate-500">
                  CD: {{ slot.currentCd.toFixed(1) }}s
                </span>
              </div>

              <div class="grid grid-cols-12 gap-2">
                <select
                  v-model="slot.skillId"
                  @change="store.syncBuild()"
                  class="col-span-5 text-xs bg-white border border-slate-300 rounded-lg px-2 py-1.5 font-semibold"
                >
                  <option v-for="sk in SKILLS_DB" :key="sk.id" :value="sk.id">
                    {{ sk.name }}
                  </option>
                </select>

                <select
                  v-model="slot.condition"
                  class="col-span-5 text-xs bg-white border border-slate-300 rounded-lg px-2 py-1.5"
                >
                  <option value="ALWAYS">无条件释放</option>
                  <option value="TARGET_AILMENT_STACKS">目标异常层数 &gt;=</option>
                  <option value="SELF_MANA_ABOVE_PCT">自身法力% &gt;=</option>
                  <option value="SELF_SHIELD_ABOVE">自身护盾值 &gt;=</option>
                </select>

                <input
                  type="number"
                  v-model.number="slot.threshold"
                  class="col-span-2 text-xs bg-white border border-slate-300 rounded-lg px-1.5 py-1.5 text-center font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 实时挂机战斗状态监控 -->
        <div class="bg-white/90 border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-xs font-bold text-slate-800">{{ store.enemy.name }}</div>
              <div class="text-[11px] text-slate-500">
                流血: <b class="text-rose-600">{{ store.enemy.bleed_stacks }}层</b> ·
                中毒: <b class="text-emerald-600">{{ store.enemy.poison_stacks }}层</b> ·
                击杀: <b class="text-amber-600">{{ store.killCount }}</b>
              </div>
            </div>
            <button
              @click="store.toggleSimulation()"
              :class="[
                'px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs',
                store.isRunning
                  ? 'bg-rose-600 text-white hover:bg-rose-700'
                  : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
              ]"
            >
              {{ store.isRunning ? '⏸ 暂停挂机实测' : '▶ 启动 0.1s 挂机引擎' }}
            </button>
          </div>

          <!-- 首领血条 -->
          <div>
            <div class="flex justify-between text-[11px] font-mono mb-1">
              <span>BOSS HP</span>
              <span>{{ Math.round(store.enemy.current_hp) }} / {{ store.enemy.max_hp }}</span>
            </div>
            <div class="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                class="h-full bg-rose-500 transition-all duration-100"
                :style="{ width: `${(store.enemy.current_hp / store.enemy.max_hp) * 100}%` }"
              ></div>
            </div>
          </div>

          <!-- 角色护盾 / 生命 / 法力实时状态条 -->
          <div class="space-y-2 pt-2 border-t border-slate-100">
            <div>
              <div class="flex justify-between text-[11px] font-mono">
                <span class="text-cyan-700">能量护盾 (SHIELD)</span>
                <span>{{ Math.round(store.runtimeStats.shield) }} / {{ store.runtimeStats.max_shield }}</span>
              </div>
              <div class="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  class="h-full bg-cyan-500 transition-all duration-100"
                  :style="{ width: `${Math.min(100, (store.runtimeStats.shield / Math.max(1, store.runtimeStats.max_shield)) * 100)}%` }"
                ></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-[11px] font-mono">
                <span class="text-indigo-700">法力流转 (MANA)</span>
                <span>{{ Math.round(store.runtimeStats.current_mana) }} / {{ store.runtimeStats.max_mana }}</span>
              </div>
              <div class="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  class="h-full bg-indigo-500 transition-all duration-100"
                  :style="{ width: `${(store.runtimeStats.current_mana / store.runtimeStats.max_mana) * 100}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 右栏 (4列)：DPS 诊断仪与战斗触发流日志 -->
      <section class="lg:col-span-4 space-y-4">
        <div class="bg-white/90 border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-sm font-bold uppercase tracking-wider text-slate-700">
              3. 实时 DPS 构成与卡点诊断仪
            </h2>
            <span class="text-xs font-mono font-bold text-amber-600">
              {{ store.currentDps.toLocaleString() }} DPS
            </span>
          </div>

          <!-- 伤害构成占比条 -->
          <div class="space-y-2.5 mb-4">
            <div
              v-for="(dmg, source) in store.damageBySource"
              :key="source"
              class="text-xs"
            >
              <div class="flex justify-between mb-1">
                <span class="font-medium text-slate-700">{{ source }}</span>
                <span class="font-mono text-slate-500">
                  {{ dmg.toLocaleString() }} ({{ Math.round((dmg / Math.max(1, store.totalDamageDealt)) * 100) }}%)
                </span>
              </div>
              <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  class="h-full bg-amber-500"
                  :style="{ width: `${(dmg / Math.max(1, store.totalDamageDealt)) * 100}%` }"
                ></div>
              </div>
            </div>
            <div v-if="store.totalDamageDealt === 0" class="text-xs text-slate-400 py-4 text-center">
              点击【启动 0.1s 挂机引擎】观察各乘区伤害飞轮占比
            </div>
          </div>

          <!-- 循环健康度诊断 -->
          <div class="p-3 rounded-xl bg-[#F8F6F1] border border-slate-200/80 text-xs flex justify-between items-center">
            <span class="text-slate-600">缺蓝断档率 (Mana Starvation):</span>
            <span
              :class="[
                'font-mono font-bold',
                manaStarveRate > 15 ? 'text-rose-600' : 'text-emerald-700'
              ]"
            >
              {{ manaStarveRate }}% {{ manaStarveRate > 15 ? '(需补充回蓝暗金!)' : '(循环丝滑)' }}
            </span>
          </div>
        </div>

        <!-- 实时触发战斗日志 -->
        <div class="bg-white/90 border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <h2 class="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3">
            实时机制触发日志 (Combat Stream)
          </h2>
          <div class="space-y-1.5 h-[250px] overflow-y-auto font-mono text-[11px] pr-1">
            <div
              v-for="log in store.logs"
              :key="log.id"
              :class="[
                'px-2 py-1 rounded',
                log.type === 'PROC' ? 'bg-amber-50 text-amber-900 font-semibold' :
                log.type === 'SYSTEM' ? 'bg-slate-900 text-amber-300' : 'text-slate-600'
              ]"
            >
              <span class="text-slate-400 mr-1.5">[{{ log.time }}]</span>
              <span>{{ log.text }}</span>
            </div>
          </div>
        </div>
      </section>

    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { UNIQUES_DB, SKILLS_DB } from '../config/gameData';
import { useCombatStore } from '../stores/useCombatStore';

const store = useCombatStore();

function toggleEquip(id: string) {
  const idx = store.equippedIds.indexOf(id);
  if (idx >= 0) {
    store.equippedIds.splice(idx, 1);
  } else {
    store.equippedIds.push(id);
  }
  store.syncBuild();
}

const manaStarveRate = computed(() => {
  if (store.totalTicks <= 0) return 0;
  return Math.round((store.manaStarveTicks / store.totalTicks) * 100);
});
</script>
