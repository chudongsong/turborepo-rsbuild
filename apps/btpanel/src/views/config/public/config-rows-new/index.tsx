import { getConfigStore } from '../../useStore'
import selectLighting from './directives'
import './index.css'

export default defineComponent({
	name: 'ConfigRow',
	directives: {
		selectLighting,
	},
	props: {
		label: {
			type: String,
			default: '',
		},
	},
	setup(props, { slots }) {
		const {
			refs: { settingSearch },
		} = getConfigStore()

		const { label } = props

		const descRef = ref<HTMLElement | null>(null)
		const text = ref('')

		const isSearch = computed(() => {
			let show = true
			if (settingSearch.value === '') {
				show = true
			} else if (text.value.includes(settingSearch.value)) {
				show = true
			} else if (props.label.includes(settingSearch.value)) {
				show = true
			} else {
				show = false
			}
			return show
		})

		onMounted(() => {
			nextTick(() => {
				if (descRef.value) {
					text.value = descRef.value.innerText
				}
			})
		})

		return () => (
			<section class="config-rows" title={label} style={`display: ${isSearch.value ? 'flex' : 'none'}`}>
				<div class="label text-small">{!!slots?.label ? slots?.label() : <span v-select-lighting>{label}</span>}</div>
				<div class="value">{slots.value ? slots.value() : null}</div>
				<div ref={descRef} class="desc text-tertiary text-small" v-select-lighting>
					{slots.desc ? slots.desc() : null}
				</div>
			</section>
		)
	},
})
