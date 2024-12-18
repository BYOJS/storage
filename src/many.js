export async function  setMany(data, set) {
	if (data != null && typeof data == "object" && !Array.isArray(data)) {
		data = [...Object.entries(data)];
	}
	return Promise.all(data.map(([prop, val]) => set(prop, val))).then(() => true).catch(() => false);
}
export async function getMany(props, get) {
	return await Promise.all(props.map((prop) => get(prop)));
}
export async function removeMany(props, remove) {
	return await Promise.all(props.map((prop) => remove(prop))).then(() => true).catch(() => false);
}
