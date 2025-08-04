<script setup>
// 3D场景编辑器主应用组件
</script>

<template>
  <div id="app" class="editor-container">
    <header class="editor-header">
      <h1>3D 场景编辑器</h1>
    </header>
    
    <main class="editor-main">
      <div class="editor-sidebar">
        <!-- 工具栏和属性面板将在这里 -->
        <div class="panel">
          <h3>工具栏</h3>
          <p>编辑器组件将在此处加载</p>
        </div>
      </div>
      
      <div class="editor-viewport">
        <!-- 3D场景视口将在这里 -->
        <div class="viewport-container">
          <h3>3D 场景视口</h3>
          <p>Three.js + TresJS 场景将在此处渲染</p>
        </div>
      </div>
      
      <div class="editor-properties">
        <!-- 属性面板将在这里 -->
        <div class="panel">
          <h3>属性面板</h3>
          <p>对象属性编辑器将在此处加载</p>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.editor-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.editor-header {
  background-color: #2c3e50;
  color: white;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.editor-header h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.editor-main {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.editor-sidebar {
  width: 250px;
  background-color: #f8f9fa;
  border-right: 1px solid #dee2e6;
  overflow-y: auto;
}

.editor-viewport {
  flex: 1;
  background-color: #343a40;
  position: relative;
  overflow: hidden;
}

.editor-properties {
  width: 300px;
  background-color: #f8f9fa;
  border-left: 1px solid #dee2e6;
  overflow-y: auto;
}

.viewport-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
}

.panel {
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
}

.panel h3 {
  margin: 0 0 0.5rem 0;
  color: #495057;
  font-size: 1rem;
  font-weight: 600;
}

.panel p {
  margin: 0;
  color: #6c757d;
  font-size: 0.875rem;
}
</style>
