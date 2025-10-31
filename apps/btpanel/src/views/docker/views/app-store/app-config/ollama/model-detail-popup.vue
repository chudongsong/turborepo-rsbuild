<script lang="tsx">
import { editorConfig } from './useController';

import BtEditor from '@/components/extension/bt-editor';

export default {
	name: 'model-detail-popup',
	props: {
		compData: {
			type: String,
			default: '',
			required: true, // 非必传
		},
	},
	setup(props) {
		return () => (<div class="relative p-[1.6rem]">
			<BtEditor v-model={props.compData} class="h-[55rem]" editorOption={editorConfig} />
		</div>)
	}
}
</script>