<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { resetPassword, validatePasswordToken } from '$lib/api/auth';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import type { PasswordTokenType } from '$lib/types';
	import { ArrowLeft, Key, Loader } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	let validating = $state(false);
	let token = $state<{
		value: string;
		type: PasswordTokenType;
		expiresAt: Date;
	} | null>(null);
	let validationError = $state<string>();
	let timeLeft = $state('');

	onMount(async () => {
		validating = true;

		const tokenValue = page.url.searchParams.get('token');
		if (typeof tokenValue !== 'string' || tokenValue.trim() === '') {
			validating = false;
			token = null;
			return;
		}

		try {
			const details = await validatePasswordToken(tokenValue);

			const expiresAt = new Date(details.expiresAt);
			token = {
				value: tokenValue,
				type: details.type,
				expiresAt: expiresAt
			};

			setInterval(() => {
				const distance = (expiresAt.getTime() - Date.now()) / 1000;
				const days = Math.floor(distance / (60 * 60 * 24));
				const hours = Math.floor((distance % (60 * 60 * 24)) / (60 * 60));
				const minutes = Math.floor((distance % (60 * 60)) / 60);
				const seconds = Math.floor(distance % 60);

				let s = '';
				if (days > 0) s += `${days} days`;
				if (hours > 0) s += `${hours} hours`;
				if (minutes > 0) s += `${minutes} minutes`;
				if (seconds > 0) s += `${seconds} seconds`;
				console.log(days, hours, seconds, minutes);
				timeLeft = s;
			}, 1000);

			setTimeout(() => {
				window.location.reload();
			}, token.expiresAt.getTime() - Date.now());
		} catch (error: any) {
			validationError = error.message ?? "Couldn't validate token";
		} finally {
			validating = false;
		}
	});

	let password = $state('');
	let confirmPassword = $state('');
	let passwordError = $state<string>();
	let settingPassword = $state(false);
	let completed = $state(false);

	async function handleSubmit() {
		if (settingPassword) return;
		if (token == null) return toast.error('Invalid token');
		settingPassword = true;

		// todo: zod validation
		if (password.length === 0 || confirmPassword.length === 0)
			passwordError = 'Passwords cannot be empty';
		if (password !== confirmPassword) passwordError = 'Passwords do not match';

		if (passwordError != null) {
			settingPassword = false;
			return;
		}

		try {
			await resetPassword(token.value, password);
			completed = true;
			setTimeout(() => goto('/login'), 5000);
		} catch (error: any) {
			toast.error(error.message ?? 'Something went wrong');
		} finally {
			settingPassword = false;
		}
	}
</script>

{#if validating}
	<div class="space-y-2">
		<a class="flex place-items-center gap-2 font-light hover:underline" href="/login">
			<ArrowLeft class="size-4 shrink-0" /> Back to login
		</a>

		<h1 class="mb-xs font-medium text-primary">Validating token...</h1>
	</div>

	<p>Please while we validate your password change request.</p>
{:else if validationError != null || token == null}
	<div class="space-y-2">
		<a class="flex place-items-center gap-2 font-light hover:underline" href="/login">
			<ArrowLeft class="size-4 shrink-0" /> Back to login
		</a>

		<h1 class="mb-xs font-medium text-destructive">{validationError}</h1>
	</div>

	<p>Kindly redo the procedure and get a fresh token to change your account password.</p>

	<div>
		<ul class="ml-4 list-outside list-disc">
			<li>
				If you forgot or want to reset the password,
				<a class="underline" href="/forgot-password">go here</a>.
			</li>
			<li class="list-item">
				If you are new here, and haven't set up your account password yet,
				<a class="underline" href="/set-password">go here</a>.
			</li>
		</ul>
	</div>
{:else if !completed}
	<div class="space-y-2">
		<a class="flex place-items-center gap-2 font-light hover:underline" href="/login">
			<ArrowLeft class="size-4 shrink-0" /> Back to login
		</a>

		<h1 class="mb-xs font-medium text-primary">
			{#if token.type === 'reset_password'}
				Reset your password
			{:else if token.type === 'set_password'}
				Set up your password
			{:else}
				???
			{/if}
		</h1>
	</div>

	<p>Set your new account password.</p>

	<form class="space-y-2" onsubmit={handleSubmit}>
		<div class="space-y-2">
			<Label for="password">Password</Label>
			<Input type="password" name="password" bind:value={password} required placeholder="******" />
		</div>
		<div class="space-y-2">
			<Label for="confirm-password">Confirm Password</Label>
			<Input
				type="password"
				name="confirm-password"
				bind:value={confirmPassword}
				required
				placeholder="****** (again)"
			/>
		</div>

		{#if passwordError}
			<p class="text-sm font-semibold text-destructive">{passwordError}</p>
		{/if}

		<Button
			class="font-semibold"
			disabled={settingPassword || password !== confirmPassword}
			type="submit"
		>
			{#if settingPassword}
				<Loader class="animate-spin" />
				Storing safely...
			{:else}
				<Key /> Change password
			{/if}
		</Button>
	</form>

	<p class="text-xs text-muted-foreground">
		This page will expire on {new Intl.DateTimeFormat('en-IN', {
			dateStyle: 'long',
			timeStyle: 'long'
		}).format(token.expiresAt)} ({timeLeft || '...'}).
	</p>
{:else}
	<div class="space-y-2">
		<a class="flex place-items-center gap-2 font-light hover:underline" href="/login">
			<ArrowLeft class="size-4 shrink-0" /> Back to login
		</a>

		<h1 class="mb-xs font-medium text-primary">Done!</h1>
	</div>

	<p>
		Your password was successfully changed! You will be redirected to the login page shortly. Use
		the new credentials to login to your account.
	</p>
{/if}
