<!--
  交互操作提示组件
  固定显示在视口，提示用户常用鼠标操作说明
  支持切换控制器类型（OrbitControls、MapControls、FlyControls）
-->
<script setup>
import { ElTag, ElIcon } from 'element-plus';
import { InfoFilled } from '@element-plus/icons-vue';
import { ref, computed } from 'vue';
import { useEditorConfig } from '../../composables/useEditorConfig.js';
import { useSceneManager } from '../../core/SceneManager.js';

// 控制悬停展开
const isHovered = ref(false);

// 获取编辑器配置
const { editorConfig, setControlsType, CONTROLS_OPTIONS } = useEditorConfig();

// 当前控制器类型
const controlsType = computed({
  get: () => editorConfig.controlsType,
  set: (val) => {
    setControlsType(val);
    // 通知SceneManager切换控制器
    const sceneManager = useSceneManager();
    // sceneManager会自动响应controlsType变化，无需手动调用
  }
});
</script>

<template>
  <div
    class="interaction-hints"
    :class="{ 'is-collapsed': !isHovered }"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <template v-if="isHovered">
      <template v-if="controlsType === 'FlyControls'">
        <el-tag class="hint-item" size="small" type="info" effect="dark">
          <span class="hint-key">W / S</span>
          <span class="hint-action">前进后退</span>
        </el-tag>
        <el-tag class="hint-item" size="small" type="info" effect="dark">
          <span class="hint-key">A / D</span>
          <span class="hint-action">左右平移</span>
        </el-tag>
        <el-tag class="hint-item" size="small" type="info" effect="dark">
          <span class="hint-key">Q / E</span>
          <span class="hint-action">镜头旋转</span>
        </el-tag>
        <el-tag class="hint-item" size="small" type="info" effect="dark">
          <span class="hint-key">R / F</span>
          <span class="hint-action">上下平移</span>
        </el-tag>
        <el-tag class="hint-item" size="small" type="info" effect="dark">
          <span class="hint-key">SPACE</span>
          <span class="hint-action">向上平移</span>
        </el-tag>
        <el-tag class="hint-item" size="small" type="info" effect="dark">
          <span class="hint-key">左键</span>
          <span class="hint-action">镜头转动</span>
        </el-tag>
        <el-tag class="hint-item" size="small" type="info" effect="dark">
          <span class="hint-key">右键</span>
          <span class="hint-action">目标移动</span>
        </el-tag>
        <el-tag class="hint-item" size="small" type="info" effect="dark">
          <span class="hint-key">滚轮</span>
          <span class="hint-action">缩放</span>
        </el-tag>
      </template>
      <template v-if="controlsType === 'OrbitControls'">
        <el-tag class="hint-item" size="small" type="info" effect="dark">
          <span class="hint-key">左键</span>
          <span class="hint-action">旋转视图</span>
        </el-tag>
        <el-tag class="hint-item" size="small" type="info" effect="dark">
          <span class="hint-key">右键</span>
          <span class="hint-action">平移视图</span>
        </el-tag>
        <el-tag class="hint-item" size="small" type="info" effect="dark">
          <span class="hint-key">滚轮</span>
          <span class="hint-action">缩放</span>
        </el-tag>
      </template>
      <template v-if="controlsType === 'MapControls'">
        <el-tag class="hint-item" size="small" type="info" effect="dark">
          <span class="hint-key">左键</span>
          <span class="hint-action">平移视图</span>
        </el-tag>
        <el-tag class="hint-item" size="small" type="info" effect="dark">
          <span class="hint-key">右键</span>
          <span class="hint-action">旋转视图</span>
        </el-tag>
        <el-tag class="hint-item" size="small" type="info" effect="dark">
          <span class="hint-key">滚轮</span>
          <span class="hint-action">缩放</span>
        </el-tag>
      </template>
      <select
        :value="controlsType"
        @change="e => controlsType = e.target.value"
        style="width: 140px; margin-bottom: 10px; height: 28px; border-radius: 4px; border: 1px solid #444; background: #23262e; color: #b0b8c9; padding-left: 8px;"
      >
        <option
          v-for="item in CONTROLS_OPTIONS"
          :key="item.value"
          :value="item.value"
        >{{ item.label }}</option>
      </select>
    </template>
    <template v-else>
      <el-icon class="hint-icon">
        <InfoFilled />
      </el-icon>
      <span class="hint-mode-text">
        {{ controlsType }}
      </span>
    </template>
  </div>
</template>

<style lang="scss" scoped>
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
