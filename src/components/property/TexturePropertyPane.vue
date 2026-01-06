<!--
  材质属性面板（专家模式）
-->
<script setup>
import { nextTick, ref, computed, watch } from 'vue';


const props = defineProps({
  texure: { type: Object, default: null }
});

const texureProp = computed(() => props.texure);

const emits = defineEmits(['change-texture']);
/**
 * 贴图配置表单响应式对象
 * 贴图配置结构：
 {
  // 重复
  repeat: [1, 1],
  // 偏移
  offset: [0, 0],
  // 中心
  center: [0, 0],
  // 旋转
  rotation: 0,
  // 环绕模式
  wrapS: 'RepeatWrapping',
  wrapT: 'RepeatWrapping',

  // 其他属性，暂不开放修改
  width: 1024,
  height: 1024,
  matrix: null,
  matrixAutoUpdate: true,
  anisotropy: 1,
  channel: 0,
  colorSpace: 'sRGB',
  mapping: 'UVMapping',
  magFilter: 'LinearFilter',
  minFilter: 'LinearMipmapLinearFilter',
  needsUpdate: false,
  needsPMREMUpdate: false,
  premultiplyAlpha: false,
}
 */
const textureFormRef = ref(null);

const WrappingOptions = [
  {label: 'RepeatWrapping', value: THREE.RepeatWrapping},
  {label: 'ClampToEdgeWrapping', value: THREE.ClampToEdgeWrapping},
  {label: 'MirroredRepeatWrapping', value: THREE.MirroredRepeatWrapping},
];

// 监听对象变化，更新材质属性
watch(texureProp, () => {
  updateTextureForm();
}, { immediate: true });

function updateTextureForm(){
  let texture = texureProp.value;
  if(texture) {
    textureFormRef.value = {
      repeat: [parseFloat(texture.repeat.x), parseFloat(texture.repeat.y)],
      offset: [texture.offset.x, texture.offset.y],
      center: [texture.center.x, texture.center.y],
      rotation: texture.rotation,
      wrapS: texture.wrapS,
      wrapT: texture.wrapT,
    };
  }
}

function changeTexture() {
  let val = {...textureFormRef.value};
  emits('change-texture', val);
}
</script>

<template>
  <div v-if="textureFormRef" class="property-pane">
    <el-form label-width="80px">
      <el-form-item label="重复">
        <!-- repeat: 纹理在U/V方向的重复次数 -->
        <el-input-number
          v-model="textureFormRef.repeat[0]"
          :min="0.01"
          :step="0.01"
          @change="changeTexture"
          size="small"
          controls-position="right"
          style="width:5em"
        /> ×
        <el-input-number
          v-model="textureFormRef.repeat[1]"
          :min="0.01"
          :step="0.01"
          @change="changeTexture"
          size="small"
          controls-position="right"
          style="width:5em"
        />
      </el-form-item>
      <el-form-item label="偏移">
        <!-- offset: 纹理在U/V方向的偏移 -->
        <el-input-number
          v-model="textureFormRef.offset[0]"
          :min="-1"
          :max="1"
          :step="0.01"
          @change="changeTexture"
          size="small"
          controls-position="right"
          style="width:5em"
        /> ×
        <el-input-number
          v-model="textureFormRef.offset[1]"
          :min="-1"
          :max="1"
          :step="0.01"
          @change="changeTexture"
          size="small"
          controls-position="right"
          style="width:5em"
        />
      </el-form-item>
      <el-form-item label="中心">
        <!-- center: 旋转中心点 -->
        <el-input-number
          v-model="textureFormRef.center[0]"
          :min="0"
          :max="1"
          :step="0.01"
          @change="changeTexture"
          size="small"
          controls-position="right"
          style="width:5em"
        /> ×
        <el-input-number
          v-model="textureFormRef.center[1]"
          :min="0"
          :max="1"
          :step="0.01"
          @change="changeTexture"
          size="small"
          controls-position="right"
          style="width:5em"
        />
      </el-form-item>
      <el-form-item label="旋转">
        <!-- rotation: 纹理旋转角度，单位弧度 -->
        <el-input-number
          v-model="textureFormRef.rotation"
          :min="-6.28"
          :max="6.28"
          :step="0.01"
          @change="changeTexture"
          size="small"
          controls-position="right"
          style="width:5em"
        />
      </el-form-item>
      <el-form-item label="wrapS">
        <el-select v-model="textureFormRef.wrapS" size="small" placeholder="WrapS" @change="changeTexture">
          <el-option v-for="opt in WrappingOptions" :key="opt.value" :label="opt.label" :value="opt.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="wrapT">
        <el-select v-model="textureFormRef.wrapT" size="small" placeholder="WrapT" @change="changeTexture">
          <el-option v-for="opt in WrappingOptions" :key="opt.value" :label="opt.label" :value="opt.value"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
  </div>
</template>

<style lang="scss" scoped>
@use './PropertyPane.scss';
</style>
