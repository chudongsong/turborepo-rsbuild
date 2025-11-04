import BtButton from '@/components/base/bt-button'
import BtIcon from '@/components/base/bt-icon'
import { Message } from '@/hooks/tools'

export default defineComponent({
	name: 'BtTableRefresh',
	emits: ['refresh'],
	setup(props, { emit }) {
		const refresh = () => {
			emit('refresh')
			Message.success('刷新成功')
		}
		return () => (
			<BtButton onClick={refresh}>
				<BtIcon icon="el-refresh" />
			</BtButton>
		)
	},
})
