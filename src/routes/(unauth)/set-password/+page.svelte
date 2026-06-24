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
			await requestPasswordToken(email, 'set_password');
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

		<h1 class="mb-xs font-medium text-primary">Set up your password</h1>
	</div>

	<p>
		If you haven't setup a password for your account yet, you can enter your email below to get a
		link to set a password.
	</p>

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
		If you are a registered user setting up the password for the first time, you will recieve an
		email with a link to set your account password very shortly. Click it to set your password.
		<b>The link will expire in 15 minutes.</b>
	</p>
{/if}

<p>
	If you forgot or want to reset the password,
	<a class="underline" href="/forgot-password">go here</a>.
</p>
