<script lang="ts">
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	let data: { message: string } | null = null;

	onMount(async () => {
		try {
			const res = await fetch('/api/test');
			data = await res.json();
		} catch (error) {
			console.error(error);
		}
	});
</script>

<h1>Dashboard Page</h1>
<div class="flex flex-col">
	<a href={resolve('/register')}>Register Page</a>
	<a href={resolve('/login')}>Login Page</a>
	<a href={resolve('/password-change')}>Change Password</a>
</div>

{#if data}
	<p>{data.message}</p>
{/if}
