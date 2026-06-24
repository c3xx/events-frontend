<script lang="ts">
	import { requestPasswordToken } from '$lib/api/auth';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { ArrowLeft, Loader, Mail } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';

	let lastEmail = $state('');
	let email = $state('');
	let emailError = $state<string>();
	let sending = $state(false);
	let completed = $state(false);

	async function handleSubmit() {
		if (sending) return;
		sending = true;

		// todo: zod validation
		if (email.trim().length === 0) {
			emailError = 'Enter a valid email address';
		}

		if (emailError != null) {
			sending = false;
			return;
		}

		try {
			await requestPasswordToken(email, 'reset_password');
			lastEmail = email;
			completed = true;
		} catch (error: any) {
			toast.error(error.message ?? 'Something went wrong');
		} finally {
			sending = false;
		}
	}
</script>

{#if !completed}
	<div class="space-y-2">
		<a class="flex place-items-center gap-2 font-light hover:underline" href="/login">
			<ArrowLeft class="size-4 shrink-0" /> Back to login
		</a>

		<h1 class="mb-xs font-medium text-primary">Forgot your password?</h1>
	</div>

	<p><i>No worries!</i> Enter your email below to get a link to reset your account password.</p>

	<form class="space-y-2" onsubmit={handleSubmit}>
		<div class="space-y-2">
			<Label for="email">Email</Label>
			<Input
				type="email"
				name="email"
				bind:value={email}
				required
				placeholder="someone@tkmce.ac.in"
			/>
			{#if emailError}
				<p class="text-sm font-semibold text-destructive">{emailError}</p>
			{/if}
		</div>

		<Button class="font-semibold" disabled={sending || lastEmail === email} type="submit">
			{#if sending}
				<Loader class="animate-spin" />
				Verifying & sending...
			{:else}
				<Mail />
				Send me the setup link
			{/if}
		</Button>
	</form>
{:else}
	<div class="space-y-2">
		<a class="flex place-items-center gap-2 font-light hover:underline" href="/login">
			<ArrowLeft class="size-4 shrink-0" /> Back to login
		</a>

		<h1 class="mb-xs font-medium text-primary">Check your inbox</h1>
	</div>

	<p>
		If you are an already registered active user, you will recieve an email with a link to reset
		your account password very shortly. Click it to reset your password.
		<b>The link will expire in 15 minutes.</b>
	</p>
{/if}

<p>
	If you are new around here, and haven't set your password yet, you should
	<a class="underline" href="/set-password">click here</a>
	and set one.
</p>
