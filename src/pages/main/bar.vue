<template>
    <div class="bar">
        <aside class="sidebar" :class="{ collapsed: isCollapse }">
            <div class="title">
                <span v-show="!isCollapse" class="title-text">公寓用电管理系统</span>
                <el-icon class="collapse-btn" @click="toggle">
                    <Expand v-if="isCollapse" />
                    <Fold v-else />
                </el-icon>
            </div>
            <el-menu router :default-active="route.path" :collapse="isCollapse" :collapse-transition="false"
                class="menu">
                <el-menu-item index="/main">
                    <el-icon>
                        <HomeFilled />
                    </el-icon>
                    <template #title>首页</template>
                </el-menu-item>
                <el-menu-item index="/main/transmission">
                    <el-icon>
                        <Connection />
                    </el-icon>
                    <template #title>输电监控</template>
                </el-menu-item>
                <el-menu-item index="/main/energy">
                    <el-icon>
                        <DataAnalysis />
                    </el-icon>
                    <template #title>能耗分析</template>
                </el-menu-item>
                <el-menu-item index="/main/unit">
                    <el-icon>
                        <OfficeBuilding />
                    </el-icon>
                    <template #title>单元管理</template>
                </el-menu-item>
            </el-menu>
        </aside>

        <main class="content">
            <el-breadcrumb separator="/" class="breadcrumb">
                <el-breadcrumb-item :to="{ path: '/main' }">首页</el-breadcrumb-item>
                <el-breadcrumb-item v-if="route.path !== '/main'">{{ route.meta.title }}</el-breadcrumb-item>
            </el-breadcrumb>
            <router-view />
        </main>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import {
    HomeFilled,
    Connection,
    DataAnalysis,
    OfficeBuilding,
    Fold,
    Expand,
} from '@element-plus/icons-vue'

const route = useRoute()
const isCollapse = ref(false)

function toggle() {
    isCollapse.value = !isCollapse.value
}
</script>

<style scoped>
.bar {
    display: flex;
    min-height: 100vh;
}

.sidebar {
    width: 220px;
    flex-shrink: 0;
    border-right: 1px solid #e4e7ed;
    background-color: #fff;
    transition: width 0.3s;
}

.sidebar.collapsed {
    width: 64px;
}

.title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 56px;
    padding: 0 16px;
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    border-bottom: 1px solid #e4e7ed;
    white-space: nowrap;
    overflow: hidden;
}

.sidebar.collapsed .title {
    justify-content: center;
    padding: 0;
}

.title-text {
    overflow: hidden;
}

.collapse-btn {
    cursor: pointer;
    font-size: 18px;
    color: #606266;
}

.menu {
    border-right: none;
}

.content {
    flex: 1;
    padding: 16px;
}

.breadcrumb {
    padding-bottom: 16px;
    margin-bottom: 16px;
    border-bottom: 1px solid #e4e7ed;
}
</style>
