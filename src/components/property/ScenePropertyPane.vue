<!--
  场景属性面板
  用于查看和编辑当前场景的基础属性（如名称、背景色）。
  userData已抽取到SceneUserDataPropertyPane.vue独立管理。
-->
<script setup>
import * as THREE from 'three';
import FileUrlPropertyItem from './FileUrlPropertyItem.vue';
import { onMounted } from 'vue';

const viewerConfig = {};

const sceneConfig = {
  name: '',
  userData: {}
}
// viewerConfig的数据结构：
// {
//     "outputColorSpace": "srgb",
//     "toneMapping": "NoToneMapping",
//     "toneMappingExposure": 1,
//     "background": "#222", // 或者  <文件路径>
//     "backgroundParams": {
//        "intensity": 1,
//        "rotation": 0,
//        "blurriness": 0
// },
//     "environment": <文件路径>, // 或者 <颜色>
//     "environmentParams": {
//        "intensity": 1,
//        "rotation": 0
//     }
// }

// sceneConfig的数据结构：
// {
//     "name": "",
//     "userData": {}
// }


function initViewerConfig(config) {
  if(config.background) {
    config.backgroundParams = config.backgroundParams || {
       "intensity": 1,
       "rotation": 0,
       "blurriness": 0
    };
  }
  if(config.environment) {
    config.environmentParams = config.environmentParams || {
       "intensity": 1,
       "rotation": 0
    };
  } else {
    config.environment = undefined;
    config.environmentParams = undefined;
  }
  

  if(config.postProcessor) {
    if(!config.postProcessor.aoPass) {
      config.postProcessor.aoPass = {
        "enabled": false,
        "outputName": 'default',
        "aoParameters": {}, 
        "pdParameters": {}
      }
    }
    if(!config.postProcessor.ssrPass) {
      config.postProcessor.ssrPass = {
        "enabled": false,
        "outputName": 'default',
        "resolutionScale": 1.0,
        "thickness": 0.1,
        "maxDistance": 100,
        "fresnel": 0.2,
        "distanceAttenuation": 1.0,
        "maxDistance": 3,
        "bouncing": 0,
        "opacity": 1.0,
        "blur": 0
      }
    }
    if(!config.postProcessor.bloomPass) {
      config.postProcessor.bloomPass = {
        "enabled": false,
        "threshold": 1,
        "strength": 0.2,
        "radius": 0.2
      }
    }
    if(!config.postProcessor.aaPass) {
      config.postProcessor.aaPass = {
        "enabled": false,
        "method": 'ssaa',
        "ssaaPass": {
          "sampleLevel": 1
        },
        "taaPass": {
          "sampleLevel": 1,
          "accumulate": true
        }
      }
    }
  } else {
    config.postProcessor = {
      "enabled": false,
      "aoPass": {
        "enabled": false,
        "outputName": 'default',
        "aoParameters": {}, 
        "pdParameters": {}
      },
      "ssrPass": {
        "enabled": false,
        "outputName": 'default',
        "resolutionScale": 1.0,
        "thickness": 0.1,
        "maxDistance": 100,
        "fresnel": 0.2,
        "distanceAttenuation": 1.0,
        "maxDistance": 3,
        "bouncing": 0,
        "opacity": 1.0,
        "blur": 0
      },
      "bloomPass": {
        "enabled": false,
        "threshold": 1,
        "strength": 0.2,
        "radius": 0.2
      },
      "aaPass": {
        "enabled": false,
        "method": 'fxaa',
        "ssaaPass": {
          "sampleLevel": 1
        },
        "taaPass": {
          "sampleLevel": 1,
          "accumulate": true
        }
      }
    }
  }
}

function handleSceneNameChange(value) {
  setSceneName(value);
}

function handleViewerConfigChange(value) {
  initViewerConfig(viewerConfig);
  updateViewerConfig(viewerConfig);
}

onMounted(() => {
  initViewerConfig(viewerConfig);
});
</script>

<template>
  <div class="property-panel">
    

    <el-form class="scene-form" label-width="70px">
      <el-form-item label="场景名称">
        <el-input v-model="sceneConfig.name" placeholder="请输入场景名称" @change="handleSceneNameChange" />
      </el-form-item>
      <el-form-item label="色彩空间">
        <el-select v-model="viewerConfig.outputColorSpace" placeholder="请选择色彩空间" @change="handleViewerConfigChange">
          <el-option label="SRGBColorSpace" value="srgb" />
          <el-option label="LinearSRGBColorSpace" value="srgb-linear" />
        </el-select>
      </el-form-item>
      <el-form-item label="色调映射">
        <el-select v-model="viewerConfig.toneMapping" placeholder="请选择色调映射" @change="handleViewerConfigChange">
          <el-option label="无" :value="THREE.NoToneMapping" />
          <el-option label="线性" :value="THREE.LinearToneMapping" />
          <el-option label="曝光校正" :value="THREE.ReinhardToneMapping" />
          <el-option label="电影" :value="THREE.CineonToneMapping" />
          <el-option label="ACESFilmic" :value="THREE.ACESFilmicToneMapping" />
          <el-option label="胶片" :value="THREE.AgXToneMapping" />
          <el-option label="中性色调" :value="THREE.NeutralToneMapping" />
          <el-option label="自定义" :value="THREE.CustomToneMapping" />
        </el-select>
      </el-form-item>
      <el-form-item label="曝光度">
        <el-input-number v-model="viewerConfig.toneMappingExposure" :min="0.1" :max="10" :step="0.1" @change="handleViewerConfigChange" />
      </el-form-item>
      <el-form-item label="背景色">
        <el-color-picker v-model="viewerConfig.background" @change="handleViewerConfigChange" />
      </el-form-item>
      <el-divider>环境贴图配置</el-divider>
      <el-form-item label="环境贴图">
        <FileUrlPropertyItem v-model="viewerConfig.environment" @change="handleViewerConfigChange" />
      </el-form-item>
      <template v-if="viewerConfig.environment && viewerConfig.environmentParams">
        <el-form-item label="强度">
          <el-input-number v-model="viewerConfig.environmentParams.intensity" :min="0" :max="10" :step="0.01" @change="handleViewerConfigChange" />
        </el-form-item>
        <el-form-item label="旋转">
          <el-input-number v-model="viewerConfig.environmentParams.rotation" :min="0" :max="6.28" :step="0.01" @change="handleViewerConfigChange" />
        </el-form-item>
      </template>
      
      <template v-if="viewerConfig.postProcessor">
        <el-divider>后处理配置</el-divider>
        <el-form-item label="后处理">
          <el-switch v-model="viewerConfig.postProcessor.enabled" active-text="开启" @change="handleViewerConfigChange" />
        </el-form-item>
        <template v-if="viewerConfig.postProcessor && viewerConfig.postProcessor.enabled">
          <el-form-item label="AO">
            <el-switch v-model="viewerConfig.postProcessor.aoPass.enabled" active-text="开启" @change="handleViewerConfigChange" />
          </el-form-item>
          <el-form-item label="SSR">
            <el-switch v-model="viewerConfig.postProcessor.ssrPass.enabled" active-text="开启" @change="handleViewerConfigChange" />
          </el-form-item>
          <template v-if="viewerConfig.postProcessor.ssrPass && viewerConfig.postProcessor.ssrPass.enabled">
            <el-form-item label="分辨率比例">
              <el-input-number v-model="viewerConfig.postProcessor.ssrPass.resolutionScale" :min="0.1" :max="2" :step="0.1" @change="handleViewerConfigChange" />
            </el-form-item>
            <el-form-item label="厚度">
              <el-input-number v-model="viewerConfig.postProcessor.ssrPass.thickness" :min="0.01" :max="1" :step="0.01" @change="handleViewerConfigChange" />
            </el-form-item>
            <el-form-item label="最大距离">
              <el-input-number v-model="viewerConfig.postProcessor.ssrPass.maxDistance" :min="0" :max="500" :step="1" @change="handleViewerConfigChange" />
            </el-form-item>
            <el-form-item label="菲涅尔系数">
              <el-input-number v-model="viewerConfig.postProcessor.ssrPass.fresnel" :min="0" :max="1" :step="0.01" @change="handleViewerConfigChange" />
            </el-form-item>
            <el-form-item label="距离衰减">
              <el-input-number v-model="viewerConfig.postProcessor.ssrPass.distanceAttenuation" :min="0" :max="5" :step="0.01" @change="handleViewerConfigChange" />
            </el-form-item>
            <el-form-item label="反弹次数">
              <el-input-number v-model="viewerConfig.postProcessor.ssrPass.bouncing" :min="0" :max="5" :step="1" @change="handleViewerConfigChange" />
            </el-form-item>
            <el-form-item label="不透明度">
              <el-input-number v-model="viewerConfig.postProcessor.ssrPass.opacity" :min="0" :max="1" :step="0.01" @change="handleViewerConfigChange" />
            </el-form-item>
            <el-form-item label="模糊">
              <el-input-number v-model="viewerConfig.postProcessor.ssrPass.blur" :min="0" :max="10" :step="0.1" @change="handleViewerConfigChange" />
            </el-form-item>
          </template>
          <el-form-item label="辉光">
            <el-switch v-model="viewerConfig.postProcessor.bloomPass.enabled" active-text="开启" @change="handleViewerConfigChange" />
          </el-form-item>
          <template v-if="viewerConfig.postProcessor.bloomPass && viewerConfig.postProcessor.bloomPass.enabled">
            <el-form-item label="辉光阈值">
              <el-input-number v-model="viewerConfig.postProcessor.bloomPass.threshold" :min="0" :max="1" :step="0.01" @change="handleViewerConfigChange" />
            </el-form-item>
            <el-form-item label="辉光强度">
              <el-input-number v-model="viewerConfig.postProcessor.bloomPass.strength" :min="0" :max="10" :step="0.01" @change="handleViewerConfigChange" />
            </el-form-item>
            <el-form-item label="辉光半径">
              <el-input-number v-model="viewerConfig.postProcessor.bloomPass.radius" :min="0" :max="1" :step="0.01" @change="handleViewerConfigChange" />
            </el-form-item>
          </template>
          <el-form-item label="反锯齿">
            <el-switch v-model="viewerConfig.postProcessor.aaPass.enabled" active-text="开启" @change="handleViewerConfigChange" />
          </el-form-item>
          <template v-if="viewerConfig.postProcessor.aaPass && viewerConfig.postProcessor.aaPass.enabled">
            <el-form-item label="方法">
              <el-select v-model="viewerConfig.postProcessor.aaPass.method" placeholder="请选择反锯齿方法" @change="handleViewerConfigChange">
                <el-option label="FXAA" value="fxaa" />
                <el-option label="SMAA" value="smaa" />
                <el-option label="SSAA" value="ssaa" />
                <el-option label="TAA" value="taa" />
              </el-select>
            </el-form-item>
            <template v-if="viewerConfig.postProcessor.aaPass.method === 'ssaa'">
              <el-form-item label="采样级别">
                <el-input-number v-model="viewerConfig.postProcessor.aaPass.ssaaPass.sampleLevel" :min="0" :max="5" :step="1" @change="handleViewerConfigChange" />
              </el-form-item>
            </template>
            <template v-else-if="viewerConfig.postProcessor.aaPass.method === 'taa'">
              <el-form-item label="采样级别">
                <el-input-number v-model="viewerConfig.postProcessor.aaPass.taaPass.sampleLevel" :min="0" :max="5" :step="1" @change="handleViewerConfigChange" />
              </el-form-item>
              <el-form-item label="累积">
                <el-switch v-model="viewerConfig.postProcessor.aaPass.taaPass.accumulate" active-text="开启" @change="handleViewerConfigChange" />
              </el-form-item>
            </template>
          </template>
        </template>
      </template>
    </el-form>
  </div>
</template>

<style lang="scss" scoped>
.property-panel {
  padding: 8px;
  overflow: auto;
}
.scene-form {
  margin-top: 8px;
}
</style>
