import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ProductSelect',
  setup(props) {
    return () => (
      <div class="product-select">
        <h2>产品选择</h2>
        <div class="product-options">
        
        </div>
      </div>
    )
  }
})
