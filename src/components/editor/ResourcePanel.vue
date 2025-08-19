<!--
  资源面板，包含资源/层级标签页和折叠按钮
-->
<template>
  <div class="resource-panel">
    <!-- 标签页头部 -->
    <div class="panel-tabs">
      <button 
        @click="props.setActiveLeftTab('primitives')" 
        :class="['tab-btn', { active: props.activeLeftTab === 'primitives' }]"
      >
        几何体
      </button>
      <button 
        @click="props.setActiveLeftTab('files')" 
        :class="['tab-btn', { active: props.activeLeftTab === 'files' }]"
      >
        文件
      </button>
      <button 
        @click="props.setActiveLeftTab('assets')" 
        :class="['tab-btn', { active: props.activeLeftTab === 'assets' }]"
      >
        资源
      </button>
      <button 
        @click="props.setActiveLeftTab('inspector')" 
        :class="['tab-btn', { active: props.activeLeftTab === 'inspector' }]"
      >
        层级
      </button>
    </div>
    <div class="panel-content">
      <VfsFilePanel v-show="props.activeLeftTab === 'files'" />
      <PrimitiveBrowser
        v-show="props.activeLeftTab === 'primitives'"
        :basicPrimitives="basicPrimitives"
        :extendedPrimitives="extendedPrimitives"
        :lightPrimitives="lightPrimitives"
        :otherPrimitives="otherPrimitives"
        @select="addPrimitive"
      />
      <AssetBrowser v-show="props.activeLeftTab === 'assets'" />
      <Inspector v-show="props.activeLeftTab === 'inspector'" @delete-selected="handleDeleteSelected" />
    </div>
  </div>
</template>

<script setup>
import { defineProps, ref, inject } from 'vue';
import AssetBrowser from './AssetBrowser.vue';
import Inspector from './Inspector.vue';
import VfsFilePanel from './VfsFilePanel.vue';
import PrimitiveBrowser from './PrimitiveBrowser.vue';

// 基础几何体相关数据
const basicPrimitives = ref([
  {
    type: 'box',
    name: '立方体',
    icon: '⬜',
    description: '创建一个立方体几何体'
  },
  {
    type: 'sphere',
    name: '球体',
    icon: '⚪',
    description: '创建一个球体几何体'
  },
  {
    type: 'cylinder',
    name: '圆柱体',
    icon: '🥫',
    description: '创建一个圆柱体几何体'
  },
  {
    type: 'plane',
    name: '平面',
    icon: '▭',
    description: '创建一个平面几何体'
  },
  {
    type: 'cone',
    name: '圆锥体',
    icon: '🔺',
    description: '创建一个圆锥体几何体'
  },
  {
    type: 'torus',
    name: '圆环体',
    icon: '🍩',
    description: '创建一个圆环体几何体'
  }
]);
const extendedPrimitives = ref([
  {
    type: 'dodecahedron',
    name: '十二面体',
    icon: '🎲',
    description: '创建一个十二面体几何体'
  },
  {
    type: 'icosahedron',
    name: '二十面体',
    icon: '💎',
    description: '创建一个二十面体几何体'
  },
  {
    type: 'octahedron',
    name: '八面体',
    icon: '🔸',
    description: '创建一个八面体几何体'
  },
  {
    type: 'tetrahedron',
    name: '四面体',
    icon: '🔻',
    description: '创建一个四面体几何体'
  },
  {
    type: 'ring',
    name: '环形',
    icon: '⭕',
    description: '创建一个环形几何体'
  },
  {
    type: 'tube',
    name: '管道',
    icon: '🌀',
    description: '创建一个管道几何体'
  }
]);
const lightPrimitives = ref([
  {
    type: 'directionalLight',
    name: '方向光',
    icon: '☀️',
    description: '创建一个方向光源'
  },
  {
    type: 'pointLight',
    name: '点光源',
    icon: '💡',
    description: '创建一个点光源'
  },
  {
    type: 'spotLight',
    name: '聚光灯',
    icon: '🔦',
    description: '创建一个聚光灯'
  },
  {
    type: 'ambientLight',
    name: '环境光',
    icon: '🌕',
    description: '创建一个环境光'
  },
  {
    type: 'hemisphereLight',
    name: '半球光',
    icon: '🌗',
    description: '创建一个半球光'
  }
]);
const otherPrimitives = ref([
  {
    type: 'camera',
    name: '相机',
    icon: '📷',
    description: '创建一个透视相机'
  },
  {
    type: 'group',
    name: '空对象',
    icon: '📦',
    description: '创建一个空的组对象'
  },
  {
    type: 'text',
    name: '文本',
    icon: '📝',
    description: '创建一个3D文本对象'
  },
  {
    type: 'sprite',
    name: '精灵',
    icon: '🎭',
    description: '创建一个精灵对象'
  }
]);

// 添加几何体到场景
const scene = inject('scene');
function addPrimitive(type) {
  const position = [
    Math.random() * 4 - 2,
    Math.random() * 2,
    Math.random() * 4 - 2
  ];
  scene.createPrimitive(type, { position });
}

// 接收父组件传递的 props
const props = defineProps({
  activeLeftTab: String,
  setActiveLeftTab: Function
});

const objectSelection = inject('objectSelection');

// 面板控制方法
function handleDeleteSelected() {
  if (objectSelection.hasSelection.value) {
    if (confirm('确定要删除选中的对象吗？')) {
      const selectedIds = Array.from(objectSelection.selectedObjectIds.value);
      selectedIds.forEach(id => {
        scene.removeObjectFromScene(id);
      });
      objectSelection.clearSelection();
    }
  }
}
</script>

<style scoped>
.resource-panel {
  width: 300px;
  height: 100%;
  background: #2a2a2a;
  border-left: 1px solid #444;
  display: flex;
  flex-direction: column;
  color: #fff;
  min-height: 0;
}
.panel-tabs {
  display: flex;
  background: #333;
  border-bottom: 1px solid #444;
}
.tab-btn {
  flex: 1;
  padding: 12px 16px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: #aaa;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.tab-btn:hover {
  background: #444;
  color: #fff;
}
.tab-btn.active {
  background: #2a2a2a;
  border-bottom-color: #007acc;
  color: #fff;
}
.panel-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.panel-toggle-btn {
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid #555;
  border-radius: 4px;
  color: #aaa;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 20;
}
.panel-toggle-btn:hover {
  background: #444;
  border-color: #777;
  color: #fff;
}
.panel-toggle-btn.active {
  background: #007acc;
  border-color: #0088dd;
  color: #fff;
}
.panel-toggle-btn.left.collapsed {
  left: 0;
  border-radius: 0 4px 4px 0;
  background: #222;
  border: 1px solid #555;
  z-index: 30;
}
</style>
