import { reactive, toRefs, watch } from 'vue'
import { isEmail } from 'sd-validate/lib/rules'

const DATABASE_URL = process.env.NODE_ENV === 'production' ?
	'https://stranerd-13084.firebaseio.com/emails.json' :
	'http://localhost:5003/emails.json?ns=ss-nuxtify'

const saveEmail = async (email) => {
	const res = await fetch(`${DATABASE_URL}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(email),
	})
	if (res.ok) return res.json()
	else throw (await res.json()).error
}

const getEmails = async () => {
	const res = await fetch(`${DATABASE_URL}`, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' }
	})
	if (res.ok) return res.json()
	else throw (await res.json()).error
}

export const useMailing = () => {
	const state = reactive({
		error: '',
		message: '',
		loading: false,
		email: '',
	})

	watch(() => state.email, () => {
		if (state.email) state.error = ''
	})

	const submitEmail = async () => {
		if (state.loading) return
		state.error = ''
		const res = isEmail(state.email)
		if (!res.valid) return state.error = 'Please provide a valid email!'
		try {
			state.loading = true
			await saveEmail(state.email)
			state.email = ''
			state.message = 'Email submitted successfully!'
		} catch (error) { state.error = error }
		finally { state.loading = false }
	}

	return { submitEmail, ...toRefs(state) }
}

export const useMails = () => {
	const state = reactive({
		error: '',
		loading: false,
		emails: [],
	})

	const fetchEmails = async () => {
		if (state.loading) return
		state.error = ''
		try {
			state.loading = true
			const emailsObj = await getEmails()
			const emailSet = new Set(Object.values(emailsObj))
			state.emails = []
			emailSet.forEach((e) => state.emails.push(e))
		} catch (error) { state.error = error }
		finally { state.loading = false }
	}

	return { fetchEmails, ...toRefs(state) }
}