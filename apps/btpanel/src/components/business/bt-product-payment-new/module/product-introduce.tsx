import { defineComponent } from 'vue'
import { useProductPaymentStore } from '../useStore'
import styles from '../index.module.css'

export default defineComponent({
  name: 'ProductIntroduce',
  setup() {
    const { productIntroduceList } = useProductPaymentStore()

    return () => (
      <div class={styles.productIntroduce}>
        <h2 class="text-2xl font-bold mb-6">产品介绍</h2>
        <div class="features-list space-y-4">
          {features.map(feature => (
            <div key={feature.id} class="feature-item">
              <h3 class="text-lg font-semibold">{feature.title}</h3>
              <p class="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }
})
