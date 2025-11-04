import { defineComponent, PropType } from 'vue'
import ProductIntroduce from './module/product-introduce'
import ProductSelect from './module/product-select'
import type { CompData } from './types'

export default defineComponent({
  name: 'BtProductPaymentNew',
  components: {
    ProductIntroduce,
    ProductSelect
  },
  props: {
    compData: {
      type: Object as PropType<CompData>,
      required: true,
      default: () => ({
        disablePro: true,
        sourceId: '27',
        plugin: true,
        pluginInfo: {
          title: '',
          describe: '',
          pid: 0
        },
        isHomeBubble: {}
      })
    }
  },
  setup(props) {
    return () => (
      <div class="flex w-full h-full">
        {/* 左侧产品介绍 */}
        <ProductIntroduce />
        {/* 右侧产品选择 */}
        <ProductSelect />
      </div>
    )
  }
})









