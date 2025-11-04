export const useHandleError = (error: any, name?: string) => {
	if (error instanceof Error) {
		// console.error(`${name}数据类型错误：${error.message}`)
		// console.error(error.message)
		console.error(error, name);
	} else {
		console.error(error);
	}
};
