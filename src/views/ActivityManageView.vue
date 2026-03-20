<template>
  <div class="activity-page">
    <section class="hero-shell">
      <div class="hero-main card-surface">
        <div class="eyebrow">专题活动配置</div>
        <h1>活动中心与前台专题入口的前端配置预览</h1>
        <p>
          这页先用纯前端结构把“活动管理 / 专题活动配置”模块补齐，方便我们演示活动 banner、专题入口、规则说明、消息模板和前台推荐位的排版形态。
        </p>
        <div class="hero-tags">
          <span>活动配置</span>
          <span>消息模板</span>
          <span>前台专题入口</span>
        </div>
      </div>

      <aside class="hero-side card-surface">
        <div class="side-title">配置摘要</div>
        <div class="side-list">
          <div class="side-item">
            <span>当前状态</span>
            <strong>前端预演版</strong>
          </div>
          <div class="side-item">
            <span>活动数量</span>
            <strong>{{ summary.total }} 个</strong>
          </div>
          <div class="side-item">
            <span>专题入口</span>
            <strong>首页 / 发布页 / 详情页</strong>
          </div>
        </div>
      </aside>
    </section>

    <section class="summary-grid">
      <article class="summary-card card-surface sky">
        <div class="summary-label">活动总数</div>
        <div class="summary-value">{{ summary.total }}</div>
        <div class="summary-copy">当前前端预演的专题活动数量</div>
      </article>
      <article class="summary-card card-surface mint">
        <div class="summary-label">进行中</div>
        <div class="summary-value">{{ summary.active }}</div>
        <div class="summary-copy">正在首页与详情页露出的活动</div>
      </article>
      <article class="summary-card card-surface warm">
        <div class="summary-label">征集中</div>
        <div class="summary-value">{{ summary.collecting }}</div>
        <div class="summary-copy">等待更多投稿与参与绑定的活动</div>
      </article>
      <article class="summary-card card-surface ice">
        <div class="summary-label">活动内容数</div>
        <div class="summary-value">{{ summary.entries }}</div>
        <div class="summary-copy">活动聚合的帖子内容总量</div>
      </article>
    </section>

    <section class="toolbar-shell card-surface">
      <div>
        <div class="section-title">筛选与配置状态</div>
        <div class="section-copy">当前页面仅做前端承接，不依赖后端接口，后续可直接替换为真实活动配置数据。</div>
      </div>
      <div class="chip-group">
        <button :class="['chip-btn', selectedStatus === '全部' ? 'chip-btn-active' : '']" @click="selectedStatus = '全部'">全部</button>
        <button :class="['chip-btn', selectedStatus === '进行中' ? 'chip-btn-active' : '']" @click="selectedStatus = '进行中'">进行中</button>
        <button :class="['chip-btn', selectedStatus === '征集中' ? 'chip-btn-active' : '']" @click="selectedStatus = '征集中'">征集中</button>
      </div>
    </section>

    <section class="content-grid">
      <div class="activity-column">
        <article class="activity-card card-surface" v-for="item in filteredActivities" :key="item.id">
          <div class="activity-head">
            <div>
              <div class="activity-meta-row">
                <span class="status-tag">{{ item.status }}</span>
                <span class="period-copy">{{ item.period }}</span>
              </div>
              <h3>{{ item.title }}</h3>
            </div>
            <div class="activity-rank">{{ item.entries }} 篇</div>
          </div>
          <p class="activity-description">{{ item.description }}</p>
          <div class="activity-foot">
            <span>奖励机制：{{ item.reward }}</span>
            <span>前台入口：{{ item.entryPoint }}</span>
          </div>
        </article>
      </div>

      <div class="config-column">
        <article class="config-card card-surface">
          <div class="section-title">前台活动页建议内容</div>
          <ul class="bullet-list">
            <li>顶部 banner 与专题简介</li>
            <li>活动规则、时间和参与条件</li>
            <li>一键报名 / 绑定到发布页</li>
            <li>我的活动入口与活动状态展示</li>
          </ul>
        </article>

        <article class="config-card card-surface">
          <div class="section-title">后台后续可接的数据点</div>
          <ul class="bullet-list">
            <li>活动状态、起止时间、奖励规则</li>
            <li>参与人数、活动内容数、导购点击</li>
            <li>消息模板、审核约束、运营备注</li>
            <li>首页专题入口排序与推荐位开关</li>
          </ul>
        </article>

        <article class="config-card card-surface accent-card">
          <div class="section-title">前端设计说明</div>
          <p class="section-copy">
            这页沿用校园公告栏式运营面板视觉：圆角玻璃卡片、蓝绿主题高亮、标签式筛选和双栏信息结构，方便和移动端活动中心保持统一感。
          </p>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";

const activities = ref([
  {
    id: "spring-library-week",
    title: "图书馆清爽穿搭周",
    period: "03.20 - 03.31",
    status: "进行中",
    entries: 126,
    reward: "首页专题曝光 + 品牌合作推荐",
    entryPoint: "首页热门活动 / 发布页绑定",
    description: "面向早八、自习、图书馆等校园高频场景，征集清爽、耐看、预算友好的内容。"
  },
  {
    id: "club-style-challenge",
    title: "社团活动出片挑战",
    period: "03.18 - 04.05",
    status: "进行中",
    entries: 203,
    reward: "创作者成长积分 + 活动榜单展示",
    entryPoint: "首页专题入口 / 详情活动归属",
    description: "面向社团招新、合照、路演、主持等场景，强调上镜度和校园氛围。"
  },
  {
    id: "budget-outfit-plan",
    title: "百元预算穿搭计划",
    period: "长期征集",
    status: "征集中",
    entries: 97,
    reward: "理性消费专题位 + 导购扶持",
    entryPoint: "发布页专题绑定 / 我的活动",
    description: "鼓励预算敏感用户分享低成本、高复用、可直接抄作业的穿搭方案。"
  }
]);

const selectedStatus = ref("全部");

const filteredActivities = computed(() => {
  if (selectedStatus.value === "全部") {
    return activities.value;
  }
  return activities.value.filter((item) => item.status === selectedStatus.value);
});

const summary = computed(() => ({
  total: activities.value.length,
  active: activities.value.filter((item) => item.status === "进行中").length,
  collecting: activities.value.filter((item) => item.status !== "进行中").length,
  entries: activities.value.reduce((sum, item) => sum + item.entries, 0)
}));
</script>

<style scoped>
.activity-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.card-surface {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(109, 160, 196, 0.14);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(16px);
  box-shadow: 0 22px 48px rgba(73, 122, 156, 0.1);
}

.card-surface::after {
  content: "";
  position: absolute;
  inset: auto -36px -40px auto;
  width: 150px;
  height: 150px;
  border-radius: 34px;
  background: linear-gradient(135deg, rgba(86, 194, 241, 0.12), rgba(90, 220, 178, 0.12));
  transform: rotate(18deg);
}

.hero-shell {
  display: grid;
  grid-template-columns: minmax(0, 1.8fr) minmax(280px, 0.9fr);
  gap: 18px;
}

.hero-main,
.hero-side,
.toolbar-shell,
.activity-card,
.config-card,
.summary-card {
  padding: 26px 28px;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(84, 182, 233, 0.12);
  color: #4b9ad1;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
}

.hero-main h1 {
  position: relative;
  z-index: 1;
  margin: 16px 0 14px;
  font-size: clamp(28px, 3.1vw, 46px);
  line-height: 1.12;
  letter-spacing: -0.04em;
}

.hero-main p,
.section-copy,
.activity-description,
.side-item span,
.summary-copy,
.activity-foot,
.bullet-list {
  position: relative;
  z-index: 1;
  color: #5a7084;
  line-height: 1.8;
}

.hero-tags {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 22px;
}

.hero-tags span,
.status-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 9px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: inset 0 0 0 1px rgba(103, 155, 188, 0.12);
  font-size: 12px;
  font-weight: 700;
  color: #2f5168;
}

.hero-side {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.side-title,
.section-title {
  position: relative;
  z-index: 1;
  font-size: 18px;
  font-weight: 700;
  color: #203244;
}

.side-list {
  position: relative;
  z-index: 1;
  margin-top: 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.side-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-bottom: 14px;
  border-bottom: 1px dashed rgba(114, 159, 190, 0.18);
}

.side-item:last-child {
  padding-bottom: 0;
  border-bottom: 0;
}

.side-item strong {
  color: #1c3142;
  font-size: 15px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.summary-card {
  min-height: 176px;
}

.summary-label {
  position: relative;
  z-index: 1;
  color: #6d8496;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.summary-value {
  position: relative;
  z-index: 1;
  margin-top: 16px;
  font-size: 42px;
  font-weight: 800;
  letter-spacing: -0.05em;
  color: #1b3143;
}

.summary-copy {
  margin-top: 12px;
}

.sky { background: linear-gradient(180deg, rgba(255,255,255,0.9), rgba(233,246,255,0.95)); }
.mint { background: linear-gradient(180deg, rgba(255,255,255,0.9), rgba(233,252,245,0.95)); }
.warm { background: linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,246,233,0.95)); }
.ice { background: linear-gradient(180deg, rgba(255,255,255,0.9), rgba(242,248,255,0.95)); }

.toolbar-shell {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.chip-group {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.chip-btn {
  border: 0;
  padding: 10px 16px;
  border-radius: 999px;
  background: #eef5fb;
  color: #5f768c;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.24s cubic-bezier(.22, 1, .36, 1);
}

.chip-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 26px rgba(73, 122, 156, 0.08);
}

.chip-btn-active {
  background: linear-gradient(135deg, #58bdf0 0%, #56d3a7 100%);
  color: #fff;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(300px, 0.85fr);
  gap: 18px;
}

.activity-column,
.config-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-head,
.activity-foot,
.activity-meta-row {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.activity-meta-row {
  justify-content: flex-start;
  margin-bottom: 12px;
}

.period-copy {
  color: #6f8799;
  font-size: 13px;
  font-weight: 600;
}

.activity-card h3 {
  position: relative;
  z-index: 1;
  margin: 0;
  font-size: 24px;
  line-height: 1.25;
  letter-spacing: -0.03em;
}

.activity-description {
  margin: 16px 0 20px;
}

.activity-rank {
  position: relative;
  z-index: 1;
  padding: 10px 14px;
  border-radius: 18px;
  background: rgba(83, 171, 224, 0.1);
  color: #3471a1;
  font-weight: 700;
  white-space: nowrap;
}

.activity-foot {
  padding-top: 16px;
  border-top: 1px dashed rgba(111, 155, 186, 0.2);
  flex-wrap: wrap;
}

.bullet-list {
  position: relative;
  z-index: 1;
  margin: 14px 0 0;
  padding-left: 20px;
}

.accent-card {
  background: linear-gradient(180deg, rgba(255,255,255,0.9), rgba(240,251,247,0.96));
}

@media (max-width: 1200px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .content-grid,
  .hero-shell {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .toolbar-shell,
  .activity-head,
  .activity-foot {
    flex-direction: column;
    align-items: flex-start;
  }

  .hero-main,
  .hero-side,
  .toolbar-shell,
  .activity-card,
  .config-card,
  .summary-card {
    padding: 22px;
  }
}
</style>
