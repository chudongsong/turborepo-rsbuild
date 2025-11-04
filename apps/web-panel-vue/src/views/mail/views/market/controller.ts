import { menu, tempId, taskShowVisible, typeId } from './useMethod'

export const setMenu = (val: string) => {
	menu.value = val
}

export const showAddTemplate = (id: number) => {
	setMenu('task')
	tempId.value = id
	nextTick(() => {
		taskShowVisible.value = true
	})
}

export const showContacts = (id: number) => {
	typeId.value = id
	setMenu('contact')
}
