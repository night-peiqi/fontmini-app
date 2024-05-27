<script setup lang="ts">
import { ref } from 'vue'
import { UploadFilled } from '@element-plus/icons-vue'
import type { IUploadFile } from './typings/app-typings'
import { genFileId } from 'element-plus'
import type { UploadFile, UploadInstance, UploadProps, UploadRawFile } from 'element-plus'

console.log('✨恭喜你激活系统✨')

const SUPPORTED_FILE_EXT = ['.ttf', '.otf']

const uploadRef = ref<UploadInstance>()
const extractText = ref('')
const btnLoading = ref(false)

const textareaRows = 6

// 超出限制，覆盖上一个文件
const handleExceed: UploadProps['onExceed'] = files => {
  uploadRef.value?.clearFiles()
  const file = files[0] as UploadRawFile
  file.uid = genFileId()
  uploadRef.value?.handleStart(file)
}

const changeHandler = (file: UploadFile) => {
  const filePath = (file as IUploadFile).raw.path

  if (!SUPPORTED_FILE_EXT.some(ext => filePath.toLowerCase().endsWith(ext))) {
    uploadRef.value?.clearFiles()
    ElMessageBox.alert('目前只支持 *.ttf，*.otf 格式', '提示', {
      confirmButtonText: '好的',
      closeOnClickModal: true,
      closeOnPressEscape: true
    })

    return
  }

  window.electronAPI.saveFile(filePath)
}

const submit = async () => {
  btnLoading.value = true
  const ret = await window.electronAPI.generateNewFontPackage(extractText.value)
  if (ret === null) {
    btnLoading.value = false
    ElMessage({
      message: '字体包提取成功',
      type: 'success'
    })
  } else {
    ElMessage({
      message: ret,
      type: 'error'
    })
  }
  btnLoading.value = false
}
</script>

<template>
  <div class="fontmini-container">
    <div class="left-menu">
      <div class="logo">Font Mini</div>
      <el-menu default-active="1" class="my-el-menu-vertical">
        <el-menu-item index="1">
          <template #title>字体包压缩</template>
        </el-menu-item>
      </el-menu>
    </div>
    <div class="right-container">
      <div class="divider-title">源字体包</div>
      <el-upload
        ref="uploadRef"
        class="upload-box"
        drag
        :limit="1"
        :on-exceed="handleExceed"
        :on-change="changeHandler"
        :auto-upload="false"
        accept=""
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">把源字体包拖拽到这里或者 <em>点击选择文件</em></div>
      </el-upload>

      <div class="divider-title">文字片段</div>
      <el-input
        v-model="extractText"
        class="textarea"
        :autosize="{ minRows: textareaRows, maxRows: textareaRows }"
        type="textarea"
        placeholder="填入所有需要使用的文字，新的字体包中只会包含这些文字"
      />

      <div class="btn-group">
        <el-button>重置</el-button>
        <el-button type="primary" :loading="btnLoading" @click="submit">压缩</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fontmini-container {
  width: 100%;
  height: 100%;
  color: #333333;
  display: flex;

  .left-menu {
    background: #ffffff;

    .logo {
      height: 116px;
      padding: 40px 0;
      text-align: center;
      font-weight: bold;
      font-size: 24px;
    }

    .el-menu-item {
      padding-left: 44px;
    }

    .my-el-menu-vertical:not(.el-menu--collapse) {
      width: 200px;
      height: calc(100vh - 116px);
      border: none;
    }

    .el-menu-item {
      font-weight: bold;
    }
  }

  .right-container {
    flex: 1;
    padding: 20px;
    background: #f5f5f5;

    .divider-title {
      font-weight: bold;
      margin-bottom: 16px;
    }

    .upload-box {
      margin-bottom: 32px;
    }

    .textarea {
      width: 100%;
    }

    .btn-group {
      padding: 32px;
      text-align: center;

      .el-button + .el-button {
        margin-left: 32px;
      }
    }
  }
}
</style>
