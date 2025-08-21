<!--
  交互操作提示组件
  固定显示在视口，提示用户常用鼠标操作说明
  新增：支持切换FlyControls键盘控制
-->
<script setup>
import { ElTag, ElCheckbox, ElIcon } from 'element-plus';
import { InfoFilled } from '@element-plus/icons-vue';
import { ref } from 'vue';
import { useSceneManager } from '../../core/SceneManager.js';

// 用于控制FlyControls启停
const flyControlEnabled = ref(false);
// 控制悬停展开
const isHovered = ref(false);

/**
 * 切换FlyControls启停
 * @param {boolean} val 是否启用FlyControls
 */
function onFlyControlChange(val) {
  const sceneManager = useSceneManager();
  sceneManager.setFlyControlEnabled(val);
}
</script>

<template>
  <div
    class="interaction-hints"
    :class="{ 'is-collapsed': !isHovered }"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <template v-if="isHovered">
      <template v-if="flyControlEnabled">
        <el-tag class="hint-item" size="small" type="info" effect="dark">
          <span class="hint-key">W / S</span>
          <span class="hint-action">前进 / 后退</span>
        </el-tag>
        <el-tag class="hint-item" size="small" type="info" effect="dark">
          <span class="hint-key">A / D</span>
          <span class="hint-action">左移 / 右移</span>
        </el-tag>
        <el-tag class="hint-item" size="small" type="info" effect="dark">
          <span class="hint-key">Q / E</span>
          <span class="hint-action">下移 / 上移</span>
        </el-tag>
        <el-tag class="hint-item" size="small" type="info" effect="dark">
          <span class="hint-key">鼠标拖动</span>
          <span class="hint-action">旋转视角</span>
        </el-tag>
      </template>
      <template v-else>
        <el-tag class="hint-item" size="small" type="info" effect="dark">
          <span class="hint-key">左键</span>
          <span class="hint-action">选择对象</span>
        </el-tag>
        <el-tag class="hint-item" size="small" type="info" effect="dark">
          <span class="hint-key">右键</span>
          <span class="hint-action">旋转视图</span>
        </el-tag>
        <el-tag class="hint-item" size="small" type="info" effect="dark">
          <span class="hint-key">滚轮</span>
          <span class="hint-action">缩放</span>
        </el-tag>
        <el-tag class="hint-item" size="small" type="info" effect="dark">
          <span class="hint-key">中键</span>
          <span class="hint-action">平移</span>
        </el-tag>
      </template>
      <!-- 键盘漫游勾选，用于启停FlyControls，放在底部 -->
      <el-checkbox
        v-model="flyControlEnabled"
        @change="onFlyControlChange"
        style="margin-top: 10px;"
      >
        键盘漫游
      </el-checkbox>
    </template>
    <template v-else>
      <el-icon class="hint-icon">
        <InfoFilled />
      </el-icon>
      <span class="hint-mode-text">
        {{ flyControlEnabled ? '键盘漫游' : '鼠标控制' }}
      </span>
    </template>
  </div>
</template>

<style scoped>
.interaction-hints {
  position: absolute;
  bottom: 20px;
  left: 20px;
  min-width: 140px;
  background: rgba(34, 38, 46, 0.92);
  border-radius: 10px;
  box-shadow: 0 4px 24px 0 rgba(0,0,0,0.18);
  padding: 16px 18px 12px 18px;
  backdrop-filter: blur(12px);
  z-index: 300;
  font-size: 13px;
  transition: box-shadow 0.2s, opacity 0.2s;
}

.interaction-hints.is-collapsed {
  min-width: 48px;
  min-height: 48px;
  padding: 8px;
  background: rgba(34, 38, 46, 0.5);
  box-shadow: none;
  opacity: 0.6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.interaction-hints:hover {
  box-shadow: 0 8px 32px 0 rgba(0,0,0,0.28);
  opacity: 1;
}

.hint-icon {
  font-size: 32px;
  color: #b0b8c9;
  opacity: 0.8;
  margin-right: 8px;
}

.hint-mode-text {
  color: #b0b8c9;
  font-size: 15px;
  opacity: 0.8;
  font-weight: 500;
}

.hint-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 8px;
  padding: 0 4px;
  box-sizing: border-box;
}

.hint-item:last-child {
  margin-bottom: 0;
}

.hint-key {
  background: #4a5060;
  color: #fff;
  padding: 2px 10px;
  border-radius: 4px;
  font-weight: 600;
  min-width: 40px;
  text-align: center;
  font-size: 12px;
  margin-left: -5px;
  margin-right: 5px;
}

.hint-action {
  color: #b0b8c9;
  font-size: 12px;
}
</style>
