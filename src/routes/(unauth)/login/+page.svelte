<script lang="ts">
	import { goto } from '$app/navigation';
	import { loginUser } from '$lib/api/auth';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import { ArrowRight, Loader } from '@lucide/svelte';

	let errorText = $state('');
	let email = $state('');
	let password = $state('');

	let loginLoading = $state(false);

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		email = email.trim();
		if (email === null || email.length === 0) {
			errorText = 'Enter a valid email address';
			return;
		}
		if (password === null || password.length === 0) {
			errorText = 'Password field cannot be empty';
			return;
		}
		try {
			loginLoading = true;
			errorText = '';
			if (await loginUser(email, password)) {
				goto('/');
			}
		} catch (err: any) {
			errorText = err.message ?? 'Something went wrong';
		} finally {
			loginLoading = false;
		}
	}
</script>

<div>
	<h1 class="mb-xs text-primary">Login</h1>
	<p>Log in to your account</p>

	<form onsubmit={handleSubmit} class="mt-heavy flex flex-col gap-y-sm">
		{#if errorText}
			<p class="text-sm text-red-500">{errorText}</p>
		{/if}
		<div class="flex flex-col gap-y-xxxs">
			<Label for="email">Email</Label>
			<Input
				type="email"
				name="email"
				bind:value={email}
				onchange={(e) => {
					email = e.currentTarget.value;
				}}
				placeholder="example@domain.com"
			/>
		</div>
		<div class="flex flex-col gap-y-xxxs">
			<Label for="password">Password</Label>
			<Input
				type="password"
				name="password"
				bind:value={password}
				onchange={(e) => {
					password = e.currentTarget.value;
				}}
				placeholder="******"
			/>
		</div>

		<a class="text-sm hover:underline" href="/forgot-password">Forgot password?</a>

		<Button disabled={loginLoading} type="submit" class="mt-heavy text-sm">
			Log In
			{#if loginLoading}
				<Loader size="15" class="animate-spin" />
			{/if}
		</Button>

		<a class="text-center text-sm hover:underline" href="/set-password">
			Set up your account password if you are new here <ArrowRight class="inline size-4" />
		</a>
	</form>
</div>
